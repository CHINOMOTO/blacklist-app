"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAdmin } from "@/components/RequireAdmin";

export default function AdminDashboardPage() {
    const [pendingCount, setPendingCount] = useState<number | null>(null);
    const [pendingUserCount, setPendingUserCount] = useState<number | null>(null);
    const [approvedUserCount, setApprovedUserCount] = useState<number | null>(null);
    const [companyCount, setCompanyCount] = useState<number | null>(null);
    const [inquiryCount, setInquiryCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            setLoading(true);

            // 繧ｱ繝ｼ繧ｹ縺ｮ謇ｿ隱榊ｾ・■莉ｶ謨ｰ
            const casesQuery = supabase
                .from("blacklist_cases")
                .select("*", { count: "exact", head: true })
                .eq("status", "pending");

            // 繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ謇ｿ隱榊ｾ・■莉ｶ謨ｰ
            const usersQuery = supabase
                .from("app_users")
                .select("*", { count: "exact", head: true })
                .eq("is_approved", false);

            // 逋ｻ骭ｲ貂医∩・域価隱肴ｸ医∩・峨Θ繝ｼ繧ｶ繝ｼ莉ｶ謨ｰ
            const approvedUsersQuery = supabase
                .from("app_users")
                .select("*", { count: "exact", head: true })
                .eq("is_approved", true);

            // 莨夂､ｾ縺ｮ邱乗焚
            const companiesQuery = supabase
                .from("companies")
                .select("*", { count: "exact", head: true });

            // 縺雁撫縺・粋繧上○譛ｪ隱ｭ莉ｶ謨ｰ
            const inquiriesQuery = supabase
                .from("contact_inquiries")
                .select("*", { count: "exact", head: true })
                .eq("status", "unread");

            const [casesResult, usersResult, approvedUsersResult, companiesResult, inquiriesResult] = await Promise.all([
                casesQuery,
                usersQuery,
                approvedUsersQuery,
                companiesQuery,
                inquiriesQuery
            ]);

            if (!casesResult.error) setPendingCount(casesResult.count);
            if (!usersResult.error) setPendingUserCount(usersResult.count);
            if (!approvedUsersResult.error) setApprovedUserCount(approvedUsersResult.count);
            if (!companiesResult.error) setCompanyCount(companiesResult.count);
            if (!inquiriesResult.error) setInquiryCount(inquiriesResult.count);
            setLoading(false);
        };

        fetchCounts();
    }, []);

    return (
        <RequireAdmin>
            <div className="min-h-screen text-slate-100 flex items-center justify-center pt-24 pb-12">
                <div className="max-w-5xl w-full mx-4">
                    <h1 className="text-3xl font-bold text-[#00e5ff] mb-8 text-center">
                        邂｡逅・・ム繝・す繝･繝懊・繝・
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 謇ｿ隱榊ｾ・■繧ｿ繧､繝ｫ */}
                        <Link
                            href="/admin/cases"
                            className="block group relative p-8 rounded-3xl border border-[#00e5ff]/30 transition-all duration-300 glass-panel hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] flex flex-col overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[#00e5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 rounded-2xl bg-[#00e5ff]/10 text-3xl shadow-inner text-[#00e5ff]">
                                        搭
                                    </div>
                                    <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] text-xs font-bold rounded-lg border border-[#00e5ff]/30 uppercase tracking-wider shadow-sm">
                                        Action Required
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-[#00e5ff] transition-colors duration-300">
                                    謇ｿ隱榊ｾ・■繝ｪ繧ｹ繝・
                                </h2>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    譁ｰ隕冗匳骭ｲ縺輔ｌ縺溷ｿ懷供閠・ｱ樊ｧ繝ｪ繧ｹ繝医・蟇ｩ譟ｻ繧定｡後＞縺ｾ縺吶・
                                </p>

                                <div className="mt-auto">
                                    <div className="text-5xl font-bold text-white">
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

                        {/* 繝ｦ繝ｼ繧ｶ繝ｼ謇ｿ隱阪ち繧､繝ｫ */}
                        <Link
                            href="/admin/users"
                            className="block group relative p-8 rounded-3xl border border-[#00e5ff]/30 transition-all duration-300 glass-panel hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] flex flex-col overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[#00e5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 rounded-2xl bg-[#00e5ff]/10 text-3xl shadow-inner text-[#00e5ff]">
                                        側
                                    </div>
                                    <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] text-xs font-bold rounded-lg border border-[#00e5ff]/30 uppercase tracking-wider shadow-sm">
                                        Review
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-[#00e5ff] transition-colors duration-300">
                                    譁ｰ隕上Θ繝ｼ繧ｶ繝ｼ謇ｿ隱・
                                </h2>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    繧｢繧ｫ繧ｦ繝ｳ繝亥茜逕ｨ逕ｳ隲九ｒ遒ｺ隱阪＠縲∝茜逕ｨ繧定ｨｱ蜿ｯ縺励∪縺吶・
                                </p>

                                <div className="mt-auto">
                                    <div className="text-5xl font-bold text-slate-500 group-hover:text-white transition-colors duration-300">
                                        {loading ? (
                                            <span className="text-2xl text-slate-600 animate-pulse">...</span>
                                        ) : (
                                            <>
                                                <span className={pendingUserCount && pendingUserCount > 0 ? "text-[#00e5ff]" : ""}>
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

                        {/* 逋ｻ骭ｲ貂医∩繝ｦ繝ｼ繧ｶ繝ｼ荳隕ｧ繧ｿ繧､繝ｫ */}
                        <Link
                            href="/admin/registered-users"
                            className="block group relative p-8 rounded-3xl border border-[#00e5ff]/30 transition-all duration-300 glass-panel hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] flex flex-col overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[#00e5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 rounded-2xl bg-[#00e5ff]/10 text-3xl shadow-inner text-[#00e5ff]">
                                        則
                                    </div>
                                    <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] text-xs font-bold rounded-lg border border-[#00e5ff]/30 uppercase tracking-wider shadow-sm">
                                        Member
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-[#00e5ff] transition-colors duration-300">
                                    逋ｻ骭ｲ繝ｦ繝ｼ繧ｶ繝ｼ荳隕ｧ
                                </h2>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    迴ｾ蝨ｨ謇ｿ隱阪＆繧後※縺・ｋ蜈ｨ繝ｦ繝ｼ繧ｶ繝ｼ繧堤｢ｺ隱阪＠縺ｾ縺吶・
                                </p>

                                <div className="mt-auto">
                                    <div className="text-5xl font-bold text-slate-500 group-hover:text-white transition-colors duration-300">
                                        {loading ? (
                                            <span className="text-2xl text-slate-600 animate-pulse">...</span>
                                        ) : (
                                            <>
                                                <span className="group-hover:text-[#00e5ff] transition-colors">
                                                    {approvedUserCount ?? 0}
                                                </span>
                                                <span className="text-lg text-slate-500 font-normal ml-2 tracking-widest">
                                                    ACTIVE
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* 莨夂､ｾ邂｡逅・ち繧､繝ｫ */}
                        <Link
                            href="/admin/companies"
                            className="block group relative p-8 rounded-3xl border border-[#00e5ff]/30 transition-all duration-300 glass-panel hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] flex flex-col overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[#00e5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 rounded-2xl bg-[#00e5ff]/10 text-3xl shadow-inner text-[#00e5ff]">
                                        召
                                    </div>
                                    <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] text-xs font-bold rounded-lg border border-[#00e5ff]/30 uppercase tracking-wider shadow-sm">
                                        System
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-[#00e5ff] transition-colors duration-300">
                                    莨夂､ｾ邂｡逅・
                                </h2>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    蛻ｩ逕ｨ莨夂､ｾ・医げ繝ｫ繝ｼ繝嶺ｼ夂､ｾ・峨・霑ｽ蜉繝ｻ邱ｨ髮・ｒ陦後＞縺ｾ縺吶・
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

                        {/* 縺雁撫縺・粋繧上○邂｡逅・ち繧､繝ｫ */}
                        <Link
                            href="/admin/inquiries"
                            className="block group relative p-8 rounded-3xl border border-[#00e5ff]/30 transition-all duration-300 glass-panel hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] flex flex-col overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[#00e5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 rounded-2xl bg-[#00e5ff]/10 text-3xl shadow-inner text-[#00e5ff]">
                                        陶
                                    </div>
                                    <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] text-xs font-bold rounded-lg border border-[#00e5ff]/30 uppercase tracking-wider shadow-sm">
                                        Support
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-[#00e5ff] transition-colors duration-300">
                                    縺雁撫縺・粋繧上○邂｡逅・
                                </h2>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    繝ｦ繝ｼ繧ｶ繝ｼ縺九ｉ縺ｮ縺雁撫縺・粋繧上○繧堤｢ｺ隱阪・邂｡逅・＠縺ｾ縺吶・
                                </p>

                                <div className="mt-auto">
                                    <div className="text-5xl font-bold text-slate-500 group-hover:text-white transition-colors duration-300">
                                        {loading ? (
                                            <span className="text-2xl text-slate-600 animate-pulse">...</span>
                                        ) : (
                                            <>
                                                <span className={inquiryCount && inquiryCount > 0 ? "text-amber-400" : "group-hover:text-[#00e5ff] transition-colors"}>
                                                    {inquiryCount ?? 0}
                                                </span>
                                                <span className="text-lg text-slate-500 font-normal ml-2 tracking-widest">
                                                    譛ｪ隱ｭ
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
