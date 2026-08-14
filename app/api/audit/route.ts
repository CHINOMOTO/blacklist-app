import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action_type, target_id } = body;

        // 1. Authorizationヘッダーからトークンを取得
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
        }
        const token = authHeader.replace("Bearer ", "");

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        // ユーザー用クライアント（トークン検証用）
        const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        // 管理者権限クライアント（実際のデータ操作用）
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 2. トークンからユーザー情報を取得
        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: appUser } = await supabaseAdmin
            .from("app_users")
            .select("company_id")
            .eq("id", user.id)
            .single();

        if (!appUser) {
            return NextResponse.json({ error: "User profile not found" }, { status: 403 });
        }

        // 3. ログの保存
        // x-forwarded-forヘッダーからIPアドレスを取得（Vercel環境などで有効）
        const forwardedFor = request.headers.get("x-forwarded-for");
        const ip_address = forwardedFor ? forwardedFor.split(",")[0] : null;

        const { error: insertError } = await supabaseAdmin
            .from("audit_logs")
            .insert([{
                user_id: user.id,
                company_id: appUser.company_id,
                action_type: action_type,
                target_id: target_id,
                ip_address: ip_address
            }]);

        if (insertError) {
            console.error("Audit Log Insert Error:", insertError);
            // ログの保存失敗でユーザーの画面操作を止めないため、500エラーではなくコンソールに出すだけにする
            return NextResponse.json({ success: false, error: insertError.message });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Audit log error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
