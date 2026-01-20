"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAuth } from "@/components/RequireAuth";

type AppUser = {
    id: string;
    role: string;
    display_name: string | null;
    companies: {
        id: string;
        name: string;
    } | null;
    is_approved: boolean; // boolean
    email?: string; // joinで取ってくるのは難しいが、authからは取れないのであきらめるか、別途取得
    // note: Supabaseでauth.usersとpublicテーブルをjoinするのはセキュリティ上難しいので、
    // ここではpublic.app_usersの情報だけで表示する。Emailが必要ならEdge Functionが必要。
    created_at?: string;
};

export default function AdminUsersPage() {
    const [pendingUsers, setPendingUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingUsers = async () => {
        setLoading(true);
        // 未承認(is_approved = false)のユーザーを取得
        const { data, error } = await supabase
            .from("app_users")
            .select(`
        id,
        role,
        display_name,
        is_approved,
        companies ( id, name )
      `)
            .eq("is_approved", false);

        if (error) {
            console.error(error);
        } else {
            setPendingUsers((data as any) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApprove = async (userId: string) => {
        const { error } = await supabase
            .from("app_users")
            .update({ is_approved: true })
            .eq("id", userId);

        if (!error) {
            // リストから削除して更新
            setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
        } else {
            alert("承認に失敗しました: " + error.message);
        }
    };

    return (
        <RequireAuth>
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                <div className="max-w-5xl w-full">

                    <div className="flex items-center justify-between mb-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">User Approval</h1>
                            <p className="text-slate-400">新規ユーザー登録申請の承認管理</p>
                        </div>
                        <Link href="/dashboard" className="btn-secondary text-xs">
                            ダッシュボードへ戻る
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin h-10 w-10 border-4 border-[#00e5ff] rounded-full border-t-transparent"></div>
                        </div>
                    ) : pendingUsers.length === 0 ? (
                        <div className="glass-panel p-10 text-center rounded-2xl animate-fade-in">
                            <span className="text-4xl mb-4 block">👍</span>
                            <p className="text-slate-300">現在、未承認のユーザーはいません。</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 animate-fade-in delay-100">
                            {pendingUsers.map((user) => (
                                <div key={user.id} className="glass-panel p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 card-hover">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white">{user.display_name || "名無し"}</h3>
                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded border border-yellow-500/30">
                                                PENDING
                                            </span>
                                        </div>
                                        <div className="text-slate-400 text-sm flex items-center gap-2">
                                            <span className="text-slate-500">Company:</span>
                                            {user.companies?.name || "未所属"}
                                        </div>
                                        <div className="text-slate-500 text-xs mt-1">
                                            User ID: {user.id}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => {
                                                if (confirm("このユーザーを承認しますか？")) handleApprove(user.id);
                                            }}
                                            className="btn-primary flex-grow md:flex-grow-0 whitespace-nowrap"
                                        >
                                            承認する
                                        </button>
                                        {/* 却下機能は未実装だがボタンだけ置くならここ。今回は承認のみ */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </RequireAuth>
    );
}
