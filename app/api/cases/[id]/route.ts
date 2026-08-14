import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(
    request: Request,
    context: any
) {
    try {
        const { id } = context.params;

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

        // 3. ユーザーの所属会社と権限を取得
        const { data: appUser } = await supabaseAdmin
            .from("app_users")
            .select("company_id, role")
            .eq("id", user.id)
            .single();

        if (!appUser) {
            return NextResponse.json({ error: "User profile not found" }, { status: 403 });
        }

        // 4. 削除対象のケースを取得して登録会社を確認
        const { data: caseDetail } = await supabaseAdmin
            .from("blacklist_cases")
            .select("registered_company_id")
            .eq("id", id)
            .single();

        if (!caseDetail) {
            return NextResponse.json({ error: "Case not found" }, { status: 404 });
        }

        // 5. 権限チェック: 管理者か、自社が登録したデータのみ削除可能
        if (appUser.role !== 'admin' && caseDetail.registered_company_id !== appUser.company_id) {
            return NextResponse.json({ error: "Forbidden: You can only delete cases registered by your own company." }, { status: 403 });
        }

        // 6. データの削除
        const { error: deleteError } = await supabaseAdmin
            .from("blacklist_cases")
            .delete()
            .eq("id", id);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Case delete error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
