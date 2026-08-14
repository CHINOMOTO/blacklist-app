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

    // 削除機能
    const handleDelete = async (userId: string) => {
        if (!confirm("本当にこのユーザーを削除しますか？\n※投稿データは保持されますが、ログインできなくなります。\nこの操作は取り消せません。")) return;

        try {
            // 現在のセッショントークンを取得
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            
            if (data.error) throw new Error(data.error);

            // 成功したら一覧から削除
            setUsers(prev => prev.filter(u => u.id !== userId));
            alert("ユーザーを削除しました。");
        } catch (e: any) {
            alert("削除に失敗しました: " + e.message);
        }
    };

    return (
        <RequireAdmin>
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                <div className="max-w-6xl w-full">

                    <div className="flex items-center justify-between mb-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">登録済みユーザー一覧</h1>
                            <p className="text-slate-400">Registered Users</p>
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
                                            <th className="px-6 py-5 tracking-widest text-center">操作</th>
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
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${user.role === 'admin'
                                                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                        <button
                                                            onClick={async () => {
                                                                // 管理者が自分一人しかいない場合、自分を降格させると誰も管理画面に入れなくなる
                                                                if (user.role === 'admin') {
                                                                    const adminCount = users.filter(u => u.role === 'admin').length;
                                                                    if (adminCount <= 1) {
                                                                        alert("エラー: 最後の管理者は降格できません。\n少なくとも1人の管理者が存在する必要があります。");
                                                                        return;
                                                                    }
                                                                }

                                                                const newRole = user.role === 'admin' ? 'viewer' : 'admin';
                                                                if (!confirm(`「${user.display_name}」の権限を【${newRole.toUpperCase()}】に変更しますか？`)) return;

                                                                try {
                                                                    const { data: { session } } = await supabase.auth.getSession();
                                                                    const token = session?.access_token;

                                                                    const res = await fetch(`/api/admin/users/${user.id}/role`, {
                                                                        method: "PATCH",
                                                                        headers: {
                                                                            "Content-Type": "application/json",
                                                                            "Authorization": `Bearer ${token}`
                                                                        },
                                                                        body: JSON.stringify({ role: newRole })
                                                                    });
                                                                    const data = await res.json();
                                                                    
                                                                    if (data.error) throw new Error(data.error);

                                                                    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                                                                    alert("権限を更新しました。");
                                                                } catch (err: any) {
                                                                    alert("更新に失敗しました: " + err.message);
                                                                }
                                                            }}
                                                            className="text-[10px] text-slate-400 hover:text-white border border-slate-600 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                                                            title={user.role === 'admin' ? "一般ユーザーに降格" : "管理者に昇格"}
                                                        >
                                                            ⇄ 変更
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">
                                                    {user.id}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-[10px] text-red-400 hover:text-white border border-red-500/30 hover:bg-red-500 px-3 py-1.5 rounded transition-colors uppercase tracking-wider font-bold"
                                                    >
                                                        削除
                                                    </button>
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
