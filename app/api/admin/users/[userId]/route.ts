import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const userId = resolvedParams.userId;

        // 1. app_usersテーブルから削除
        const { error: appUserError } = await supabaseAdmin
            .from('app_users')
            .delete()
            .eq('id', userId);

        if (appUserError) {
            console.error("app_users delete error:", appUserError);
            // 続行する
        }

        // 2. Auth(Supabase認証)からユーザー削除
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Delete user API error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
