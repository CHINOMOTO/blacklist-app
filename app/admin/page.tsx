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
                    <h1 className="text-3xl font-bold text-emerald-400 mb-8 text-center">
                        管理者ダッシュボード
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 承認待ちタイル */}
                        <Link
                            href="/admin/cases"
                            className="block group bg-slate-800/80 border border-slate-700 rounded-2xl p-8 shadow-xl hover:border-emerald-500/50 hover:bg-slate-800 transition-all transform hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                                    承認待ちリスト
                                </h2>
                                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/30">
                                    要対応
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm mb-6">
                                新規登録されたブラックリスト候補の審査を行います。
                            </p>
                            <div className="text-4xl font-bold text-white">
                                {loading ? (
                                    <span className="text-2xl text-slate-600">...</span>
                                ) : (
                                    <>
                                        {pendingCount}
                                        <span className="text-lg text-slate-500 font-normal ml-2">
                                            件
                                        </span>
                                    </>
                                )}
                            </div>
                        </Link>

                        {/* ユーザー承認タイル */}
                        <Link
                            href="/admin/users"
                            className="block group bg-slate-800/80 border border-slate-700 rounded-2xl p-8 shadow-xl hover:border-blue-500/50 hover:bg-slate-800 transition-all transform hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                                    新規ユーザー承認
                                </h2>
                                <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/30">
                                    Review
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm mb-6">
                                アカウント利用申請を確認し、利用を許可します。
                            </p>
                            <div className="text-4xl font-bold text-slate-500">
                                {loading ? (
                                    <span className="text-2xl text-slate-600">...</span>
                                ) : (
                                    <>
                                        <span className={pendingUserCount && pendingUserCount > 0 ? "text-white" : ""}>
                                            {pendingUserCount ?? 0}
                                        </span>
                                        <span className="text-lg text-slate-500 font-normal ml-2">
                                            件
                                        </span>
                                    </>
                                )}
                            </div>
                        </Link>

                        {/* 会社管理タイル */}
                        <Link
                            href="/admin/companies"
                            className="block group bg-slate-800/80 border border-slate-700 rounded-2xl p-8 shadow-xl hover:border-purple-500/50 hover:bg-slate-800 transition-all transform hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                                    会社管理
                                </h2>
                                <span className="bg-purple-500/10 text-purple-400 text-xs px-2 py-1 rounded border border-purple-500/30">
                                    System
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm mb-6">
                                利用会社（グループ会社）の追加・編集を行います。
                            </p>
                            <div className="text-4xl font-bold text-slate-500">
                                {loading ? (
                                    <span className="text-2xl text-slate-600">...</span>
                                ) : (
                                    <>
                                        <span className="text-slate-300">
                                            {companyCount ?? 0}
                                        </span>
                                        <span className="text-lg text-slate-500 font-normal ml-2">
                                            社
                                        </span>
                                    </>
                                )}
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </RequireAdmin>
    );
}
