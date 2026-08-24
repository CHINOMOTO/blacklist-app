"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAuth } from "@/components/RequireAuth";

export default function SettingsPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [companyName, setCompanyName] = useState("");
    
    // Password state
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                setEmail(user.email || "");

                const { data: appUser } = await supabase
                    .from("app_users")
                    .select("display_name, companies(name)")
                    .eq("id", user.id)
                    .single();

                if (appUser) {
                    setDisplayName(appUser.display_name || "");
                    setCompanyName((appUser.companies as any)?.name || "譛ｪ謇螻・);
                }
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setIsSavingProfile(true);
        setProfileMsg(null);

        try {
            const { error } = await supabase
                .from("app_users")
                .update({ display_name: displayName })
                .eq("id", userId);

            if (error) throw error;
            
            // auth蛛ｴ縺ｮ繝｡繧ｿ繝・・繧ｿ繧よ峩譁ｰ・郁｡ｨ遉ｺ蜷榊酔譛溘・縺溘ａ・・            await supabase.auth.updateUser({
                data: { display_name: displayName }
            });

            setProfileMsg({ type: 'success', text: "繝励Ο繝輔ぅ繝ｼ繝ｫ諠・ｱ繧呈峩譁ｰ縺励∪縺励◆縲・ });
        } catch (err: any) {
            setProfileMsg({ type: 'error', text: err.message || "譖ｴ譁ｰ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・ });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingPassword(true);
        setPasswordMsg(null);

        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: 'error', text: "繝代せ繝ｯ繝ｼ繝峨′荳閾ｴ縺励∪縺帙ｓ縲・ });
            setIsSavingPassword(false);
            return;
        }

        if (newPassword.length < 8) {
            setPasswordMsg({ type: 'error', text: "繝代せ繝ｯ繝ｼ繝峨・8譁・ｭ嶺ｻ･荳翫〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・ });
            setIsSavingPassword(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setPasswordMsg({ type: 'success', text: "繝代せ繝ｯ繝ｼ繝峨ｒ譖ｴ譁ｰ縺励∪縺励◆縲・ });
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setPasswordMsg({ type: 'error', text: err.message || "譖ｴ譁ｰ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・ });
        } finally {
            setIsSavingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <RequireAuth>
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="animate-spin h-10 w-10 border-4 border-[#00e5ff] rounded-full border-t-transparent mx-auto"></div>
                </div>
            </RequireAuth>
        );
    }

    return (
        <RequireAuth>
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                <div className="max-w-3xl w-full relative z-10">

                    <div className="flex items-center justify-between mb-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">繧｢繧ｫ繧ｦ繝ｳ繝郁ｨｭ螳・/h1>
                            <p className="text-slate-400">逋ｻ骭ｲ諠・ｱ繧・ヱ繧ｹ繝ｯ繝ｼ繝峨・螟画峩繧定｡後＞縺ｾ縺・/p>
                        </div>
                        <Link href="/dashboard" className="btn-secondary text-xs backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10">
                            繝繝・す繝･繝懊・繝峨∈謌ｻ繧・                        </Link>
                    </div>

                    <div className="space-y-8 animate-fade-in delay-100">
                        {/* 蝓ｺ譛ｬ諠・ｱ險ｭ螳・*/}
                        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[#00e5ff]/20 relative overflow-hidden">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="text-[#00e5ff]">側</span> 蝓ｺ譛ｬ諠・ｱ
                            </h2>

                            <form onSubmit={handleUpdateProfile} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                        謇螻樔ｼ夂､ｾ
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={companyName}
                                        className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed text-sm"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1 ml-1">窶ｻ謇螻樔ｼ夂､ｾ縺ｯ繧ｷ繧ｹ繝・Β邂｡逅・・・縺ｿ螟画峩蜿ｯ閭ｽ縺ｧ縺吶・/p>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                        繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ
                                    </label>
                                    <input
                                        type="email"
                                        disabled
                                        value={email}
                                        className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed font-mono text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                        陦ｨ遉ｺ蜷搾ｼ域ｰ丞錐・・                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 focus:border-[#00e5ff]/60 focus:ring-1 focus:ring-[#00e5ff]/40 transition-all text-sm"
                                    />
                                </div>

                                {profileMsg && (
                                    <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${profileMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        <span className="pt-0.5">{profileMsg.type === 'success' ? '笨・ : '笞・・}</span>
                                        <p>{profileMsg.text}</p>
                                    </div>
                                )}

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSavingProfile}
                                        className="px-6 py-2.5 rounded-xl text-white font-bold bg-[#008299] hover:bg-[#00e5ff] hover:text-black transition-all text-sm shadow-[0_0_15px_rgba(0,229,255,0.2)] disabled:opacity-50"
                                    >
                                        {isSavingProfile ? "菫晏ｭ倅ｸｭ..." : "繝励Ο繝輔ぅ繝ｼ繝ｫ繧呈峩譁ｰ"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* 繝代せ繝ｯ繝ｼ繝芽ｨｭ螳・*/}
                        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[#00e5ff]/20 relative overflow-hidden">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="text-[#00e5ff]">白</span> 繝代せ繝ｯ繝ｼ繝牙､画峩
                            </h2>

                            <form onSubmit={handleUpdatePassword} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                        譁ｰ縺励＞繝代せ繝ｯ繝ｼ繝・                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="8譁・ｭ嶺ｻ･荳・
                                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 focus:border-[#00e5ff]/60 focus:ring-1 focus:ring-[#00e5ff]/40 transition-all font-mono text-sm"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                        譁ｰ縺励＞繝代せ繝ｯ繝ｼ繝会ｼ育｢ｺ隱咲畑・・                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="繧ゅ≧荳蠎ｦ蜈･蜉帙＠縺ｦ縺上□縺輔＞"
                                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 focus:border-[#00e5ff]/60 focus:ring-1 focus:ring-[#00e5ff]/40 transition-all font-mono text-sm"
                                    />
                                </div>

                                {passwordMsg && (
                                    <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${passwordMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        <span className="pt-0.5">{passwordMsg.type === 'success' ? '笨・ : '笞・・}</span>
                                        <p>{passwordMsg.text}</p>
                                    </div>
                                )}

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSavingPassword}
                                        className="px-6 py-2.5 rounded-xl text-white font-bold bg-[#008299] hover:bg-[#00e5ff] hover:text-black transition-all text-sm shadow-[0_0_15px_rgba(0,229,255,0.2)] disabled:opacity-50"
                                    >
                                        {isSavingPassword ? "譖ｴ譁ｰ荳ｭ..." : "繝代せ繝ｯ繝ｼ繝峨ｒ螟画峩"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </RequireAuth>
    );
}
