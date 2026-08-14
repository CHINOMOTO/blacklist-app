import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
        }
        const token = authHeader.replace("Bearer ", "");

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: appUser } = await supabaseAdmin
            .from("app_users")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!appUser || appUser.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
        }

        // 1. Fetch from app_users
        const { data: usersData, error: dbError } = await supabaseAdmin
            .from("app_users")
            .select(`
                id,
                role,
                display_name,
                is_approved,
                companies ( id, name )
            `)
            .eq("is_approved", true);

        if (dbError) throw dbError;

        // 2. Fetch from auth.users (to get emails)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) throw authError;

        // 3. Merge data
        const mergedUsers = usersData?.map((u: any) => {
            const authUser = authData.users.find((au) => au.id === u.id);
            return {
                ...u,
                email: authUser?.email || "不明"
            };
        });

        return NextResponse.json({ users: mergedUsers });

    } catch (error: any) {
        console.error("Fetch users error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
