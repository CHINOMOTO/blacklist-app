"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAuth } from "@/components/RequireAuth";

type UserProfile = {
    email: string;
    displayName: string;
    companyName: string | null;
    role: string;
    isApproved: boolean;
    createdAt: string;
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: appUser } = await supabase
                    .from("app_users")
                    .select("display_name, company_id, role, is_approved, created_at")
                    .eq("id", user.id)
                    .maybeSingle();

                let companyName: string | null = null;
                if (appUser?.company_id) {
                    const { data: company } = await supabase
                        .from("companies")
                        .select("name")
                        .eq("id", appUser.company_id)
                        .maybeSingle();
                    companyName = company?.name || null;
                }

                setProfile({
                    email: user.email || "",
                    displayName: appUser?.display_name || user.user_metadata?.display_name || "譛ｪ險ｭ螳・,
                    companyName,
                    role: appUser?.role || "viewer",
                    isApproved: appUser?.is_approved ?? false,
                    createdAt: appUser?.created_at || user.created_at || "",
                });
            } catch (err) {
                console.error("Profile fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const roleLabel = (role: string) => {
        switch (role) {
            case "admin": return "邂｡逅・・;
            case "viewer": return "荳闊ｬ繝ｦ繝ｼ繧ｶ繝ｼ";
            default: return role;
        }
    };

    return (
        <RequireAuth>
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                <div className="max-w-2xl w-full">

                    <div className="mb-6 animate-fade-in">
                        <Link href="/dashboard" className="btn-secondary text-sm inline-flex items-center gap-2 px-4 py-2 hover:bg-slate-800 transition-colors">
                            竊・繝繝・す繝･繝懊・繝峨∈謌ｻ繧・                        </Link>
                    </div>

                    <div className="glass-panel rounded-2xl p-8 shadow-xl animate-fade-in delay-100">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <span className="w-8 h-8 border-4 border-[#00e5ff] border-t-transparent rounded-full animate-spin"></span>
                            </div>
                        ) : !profile ? (
                            <p className="text-slate-400 text-center py-8">繝励Ο繝輔ぅ繝ｼ繝ｫ諠・ｱ繧貞叙蠕励〒縺阪∪縺帙ｓ縺ｧ縺励◆縲・/p>
                        ) : (
                            <div className="space-y-8">
                                {/* Header */}
                                <div className="text-center pb-6 border-b border-white/10">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#00e5ff]/10 border-2 border-[#00e5ff]/30 flex items-center justify-center">
                                        <span className="text-3xl">側</span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-white mb-1">{profile.displayName}</h1>
                                    {profile.companyName && (
                                        <p className="text-[#00e5ff]/70 font-medium">{profile.companyName}</p>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="space-y-1">
                                    <h2 className="text-sm font-bold text-[#00e5ff] uppercase tracking-widest border-b border-[#00e5ff]/20 pb-2 mb-4">
                                        繧｢繧ｫ繧ｦ繝ｳ繝域ュ蝣ｱ
                                    </h2>
                                    <dl className="space-y-4 text-sm">
                                        <div className="grid grid-cols-[140px_1fr] items-center py-3 px-4 rounded-lg bg-slate-900/40 border border-white/5">
                                            <dt className="text-slate-400 font-medium">豌丞錐</dt>
                                            <dd className="text-white font-bold">{profile.displayName}</dd>
                                        </div>
                                        <div className="grid grid-cols-[140px_1fr] items-center py-3 px-4 rounded-lg bg-slate-900/40 border border-white/5">
                                            <dt className="text-slate-400 font-medium">繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ</dt>
                                            <dd className="text-white font-mono text-xs">{profile.email}</dd>
                                        </div>
                                        <div className="grid grid-cols-[140px_1fr] items-center py-3 px-4 rounded-lg bg-slate-900/40 border border-white/5">
                                            <dt className="text-slate-400 font-medium">謇螻樔ｼ夂､ｾ</dt>
                                            <dd className="text-white font-bold">{profile.companyName || "譛ｪ險ｭ螳・}</dd>
                                        </div>
                                        <div className="grid grid-cols-[140px_1fr] items-center py-3 px-4 rounded-lg bg-slate-900/40 border border-white/5">
                                            <dt className="text-slate-400 font-medium">讓ｩ髯・/dt>
                                            <dd>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                                    profile.role === "admin"
                                                        ? "bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30"
                                                        : "bg-slate-800 text-slate-300 border-slate-600"
                                                }`}>
                                                    {roleLabel(profile.role)}
                                                </span>
                                            </dd>
                                        </div>
                                        <div className="grid grid-cols-[140px_1fr] items-center py-3 px-4 rounded-lg bg-slate-900/40 border border-white/5">
                                            <dt className="text-slate-400 font-medium">繧｢繧ｫ繧ｦ繝ｳ繝育憾諷・/dt>
                                            <dd>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                                    profile.isApproved
                                                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                                                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                                }`}>
                                                    {profile.isApproved ? "謇ｿ隱肴ｸ医∩" : "謇ｿ隱榊ｾ・■"}
                                                </span>
                                            </dd>
                                        </div>
                                        <div className="grid grid-cols-[140px_1fr] items-center py-3 px-4 rounded-lg bg-slate-900/40 border border-white/5">
                                            <dt className="text-slate-400 font-medium">逋ｻ骭ｲ譌･</dt>
                                            <dd className="text-white font-mono text-xs">
                                                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("ja-JP", {
                                                    year: "numeric", month: "long", day: "numeric"
                                                }) : "-"}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RequireAuth>
    );
}
