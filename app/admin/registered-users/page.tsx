"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAdmin } from "@/components/RequireAdmin";

type AppUser = {
    id: string;
    role: string;
    display_name: string | null;
    companies: {
        id: string;
        name: string;
    } | null;
    is_approved: boolean;
    created_at?: string;
};

export default function RegisteredUsersPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        // 承認済み(is_approved = true)のユーザーを取得
        const { data, error } = await supabase
            .from("app_users")
            .select(`
        id,
        role,
        display_name,
        is_approved,
        companies ( id, name )
      `)
            .eq("is_approved", true);

        if (error) {
            console.error(error);
        } else {
            setUsers((data as any) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 削除機能（もし必要なら）
    const handleDelete = async (userId: string) => {
        if (!confirm("本当にこのユーザーを削除しますか？\n(投稿データは保持されます)")) return;

        // Note: Edge Function等を通さずに直接Clientから削除する場合、Authユーザー削除はAdmin権限でも不可(Supabase仕様)
        // 通常は app_users を消すとTriggerでAuthも消す、あるいはEdge Functionを呼ぶなどの実装が必要。
        // ここではとりあえず app_users の削除を試みる実装にしておくが、
        // 実際には前回修正したカスケード設定が効いていれば、Auth側を消す手段が必要になる。
        // クライアントサイドからは supabase.auth.admin.deleteUser は呼べない。
        // なので、本来は「削除」ボタンは慎重に実装すべきだが、今回はUI表示がメイン。
        // エラーが出る可能性が高いため、今回は「削除」ボタンは実装しないでおく（リクエストは一覧表示）。
        alert("管理画面からのユーザー削除は、Supabaseダッシュボードから行ってください。\n(今後API実装予定)");
    };

    return (
        <RequireAdmin>
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                <div className="max-w-6xl w-full">

                    <div className="flex items-center justify-between mb-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Registered Users</h1>
                            <p className="text-slate-400">登録済みユーザー一覧</p>
                        </div>
                        <Link href="/admin" className="btn-secondary text-xs">
                            管理者メニューへ戻る
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin h-10 w-10 border-4 border-[#00e5ff] rounded-full border-t-transparent"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="glass-panel p-10 text-center rounded-2xl animate-fade-in">
                            <p className="text-slate-300">登録ユーザーはいません。</p>
                        </div>
                    ) : (
                        <div className="glass-panel rounded-3xl overflow-hidden animate-fade-in delay-100 shadow-2xl border border-[#00e5ff]/30">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="bg-slate-900/60 text-xs uppercase font-bold text-slate-400">
                                        <tr>
                                            <th className="px-6 py-5 tracking-widest">氏名</th>
                                            <th className="px-6 py-5 tracking-widest">会社名</th>
                                            <th className="px-6 py-5 tracking-widest">権限</th>
                                            <th className="px-6 py-5 tracking-widest text-right">ユーザーID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-bold text-white">
                                                    {user.display_name || "未設定"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.companies?.name || "未所属"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${user.role === 'admin'
                                                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">
                                                    {user.id}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </RequireAdmin>
    );
}
