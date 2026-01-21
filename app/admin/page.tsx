"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAdmin } from "@/components/RequireAdmin";

export default function AdminDashboardPage() {
    const [pendingCount, setPendingCount] = useState<number | null>(null);
    const [pendingUserCount, setPendingUserCount] = useState<number | null>(null);
    const [companyCount, setCompanyCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            setLoading(true);

            // ケースの承認待ち件数
            const casesQuery = supabase
                .from("blacklist_cases")
                .select("*", { count: "exact", head: true })
                .eq("status", "pending");

            // ユーザーの承認待ち件数
            const usersQuery = supabase
                .from("app_users")
                .select("*", { count: "exact", head: true })
                .eq("is_approved", false);

            // 会社の総数
            const companiesQuery = supabase
                .from("companies")
                .select("*", { count: "exact", head: true });

            const [casesResult, usersResult, companiesResult] = await Promise.all([casesQuery, usersQuery, companiesQuery]);

            if (!casesResult.error) setPendingCount(casesResult.count);
            if (!usersResult.error) setPendingUserCount(usersResult.count);
            if (!companiesResult.error) setCompanyCount(companiesResult.count);
            setLoading(false);
        };

        fetchCounts();
    }, []);

    return (
        <RequireAdmin>
            <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
                <div className="max-w-4xl w-full mx-4">
                    <h1 className="text-3xl font-bold text-[#00e5ff] mb-8 text-center">
                        管理者ダッシュボード
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 承認待ちタイル */}
                        <Link
                            href="/admin/cases"
                            className="block group relative p-8 rounded-3xl border border-[#00e5ff]/30 transition-all duration-300 glass-panel hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] flex flex-col overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[#00e5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 rounded-2xl bg-[#00e5ff]/10 text-3xl shadow-inner text-[#00e5ff]">
                                        📋
                                    </div>
                                    <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] text-xs font-bold rounded-lg border border-[#00e5ff]/30 uppercase tracking-wider shadow-sm">
                                        Action Required
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-[#00e5ff] transition-colors duration-300">
                                    承認待ちリスト
                                </h2>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    新規登録されたブラックリスト候補の審査を行います。
                                </p>
                                
                                <div className="mt-auto">
                                    <div className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
                                        {loading ? (
                                            <span className="text-2xl text-slate-600 animate-pulse">...</span>
                                        ) : (
                                            <>
                                                {pendingCount}
                                                <span className="text-lg text-slate-500 font-normal ml-2 tracking-widest">
                                                    CASE
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* ユーザー承認タイル */}
                        <Link
                            href="/admin/users"
                            className="block group relative p-8 rounded-3xl border border-[#00e5ff]/30 transition-all duration-300 glass-panel hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] flex flex-col overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[#00e5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 rounded-2xl bg-[#00e5ff]/10 text-3xl shadow-inner text-[#00e5ff]">
                                        👤
                                    </div>
                                    <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] text-xs font-bold rounded-lg border border-[#00e5ff]/30 uppercase tracking-wider shadow-sm">
                                        Review
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-[#00e5ff] transition-colors duration-300">
                                    新規ユーザー承認
                                </h2>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    アカウント利用申請を確認し、利用を許可します。
                                </p>

                                <div className="mt-auto">
                                    <div className="text-5xl font-bold text-slate-500 group-hover:text-white transition-colors duration-300">
                                        {loading ? (
                                            <span className="text-2xl text-slate-600 animate-pulse">...</span>
                                        ) : (
                                            <>
                                                <span className={pendingUserCount && pendingUserCount > 0 ? "text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]" : ""}>
                                                    {pendingUserCount ?? 0}
                                                </span>
                                                <span className="text-lg text-slate-500 font-normal ml-2 tracking-widest">
                                                    USER
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* 会社管理タイル */}
                        <Link
                            href="/admin/companies"
                            className="block group relative p-8 rounded-3xl border border-[#00e5ff]/30 transition-all duration-300 glass-panel hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] flex flex-col overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[#00e5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 rounded-2xl bg-[#00e5ff]/10 text-3xl shadow-inner text-[#00e5ff]">
                                        🏢
                                    </div>
                                    <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] text-xs font-bold rounded-lg border border-[#00e5ff]/30 uppercase tracking-wider shadow-sm">
                                        System
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-[#00e5ff] transition-colors duration-300">
                                    会社管理
                                </h2>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    利用会社（グループ会社）の追加・編集を行います。
                                </p>

                                <div className="mt-auto">
                                    <div className="text-5xl font-bold text-slate-500 group-hover:text-white transition-colors duration-300">
                                        {loading ? (
                                            <span className="text-2xl text-slate-600 animate-pulse">...</span>
                                        ) : (
                                            <>
                                                <span className="group-hover:text-[#00e5ff] transition-colors">
                                                    {companyCount ?? 0}
                                                </span>
                                                <span className="text-lg text-slate-500 font-normal ml-2 tracking-widest">
                                                    CORP
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </RequireAdmin>
    );
}
