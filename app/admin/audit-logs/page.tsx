"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAdmin } from "@/components/RequireAdmin";

type AuditLog = {
    id: string;
    action_type: string;
    target_id: string;
    ip_address: string;
    created_at: string;
    app_users: {
        display_name: string;
    } | null;
    companies: {
        name: string;
    } | null;
};

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        // SupabaseのRLSポリシーにより、管理者のみが閲覧可能
        const { data, error } = await supabase
            .from("audit_logs")
            .select(`
                id,
                action_type,
                target_id,
                ip_address,
                created_at,
                app_users ( display_name ),
                companies ( name )
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error(error);
        } else {
            setLogs((data as any) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const formatActionType = (type: string) => {
        switch (type) {
            case 'SEARCH': return <span className="text-blue-400 font-bold">検索</span>;
            case 'VIEW_CASE': return <span className="text-emerald-400 font-bold">詳細閲覧</span>;
            default: return <span>{type}</span>;
        }
    };

    return (
        <RequireAdmin>
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                <div className="max-w-6xl w-full relative z-10">

                    <div className="flex items-center justify-between mb-8 animate-fade-in">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">アクセスログ（証跡）</h1>
                            <p className="text-slate-300 font-medium">Audit Logs</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={fetchLogs} className="btn-secondary text-xs backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10">
                                🔄 更新
                            </button>
                            <Link href="/admin" className="btn-secondary text-xs backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10">
                                管理者メニューへ戻る
                            </Link>
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-[#00e5ff]/20 animate-fade-in delay-100">
                        <div className="p-6 md:p-8 overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin h-8 w-8 border-4 border-[#00e5ff] rounded-full border-t-transparent"></div>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    アクセスログはまだありません。
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="border-b border-white/10 text-xs font-bold text-slate-400 uppercase">
                                            <th className="px-6 py-5 tracking-widest">日時</th>
                                            <th className="px-6 py-5 tracking-widest">操作ユーザー</th>
                                            <th className="px-6 py-5 tracking-widest">所属会社</th>
                                            <th className="px-6 py-5 tracking-widest">操作内容</th>
                                            <th className="px-6 py-5 tracking-widest">対象データ（検索条件/ID）</th>
                                            <th className="px-6 py-5 tracking-widest text-right">IPアドレス</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 text-slate-300 whitespace-nowrap text-sm">
                                                    {new Date(log.created_at).toLocaleString('ja-JP')}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-white">
                                                    {log.app_users?.display_name || "不明"}
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">
                                                    {log.companies?.name || "未所属"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {formatActionType(log.action_type)}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                                    {log.target_id || "-"}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">
                                                    {log.ip_address || "不明"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </RequireAdmin>
    );
}
