"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Supabase縺ｮ繝上ャ繧ｷ繝･繝輔Λ繧ｰ繝｡繝ｳ繝郁ｪｭ縺ｿ蜿悶ｊ蠕・ｩ溽畑
    const [isSessionReady, setIsSessionReady] = useState(false);

    useEffect(() => {
        // 繧ｻ繝・す繝ｧ繝ｳ縺檎｢ｺ遶九＆繧後◆縺狗｢ｺ隱阪☆繧・        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsSessionReady(true);
            } else {
                // 繝上ャ繧ｷ繝･縺九ｉ縺ｮ隱ｭ縺ｿ蜿悶ｊ繧貞ｰ代＠蠕・▽
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'PASSWORD_RECOVERY' || session) {
                        setIsSessionReady(true);
                    }
                });
                return () => subscription.unsubscribe();
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);

        if (password !== confirmPassword) {
            setErrorMsg("繝代せ繝ｯ繝ｼ繝峨′荳閾ｴ縺励∪縺帙ｓ縲・);
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setSuccessMsg("繝代せ繝ｯ繝ｼ繝峨′豁｣蟶ｸ縺ｫ譖ｴ譁ｰ縺輔ｌ縺ｾ縺励◆・∵焚遘貞ｾ後↓繝繝・す繝･繝懊・繝峨∈遘ｻ蜍輔＠縺ｾ縺吶・);
            setTimeout(() => {
                router.push("/dashboard");
            }, 3000);
        } catch (err: any) {
            setErrorMsg("繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆: " + (err.message || "隧ｳ邏ｰ荳肴・"));
            setIsLoading(false);
        }
    };

    if (!isSessionReady) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-[#00e5ff] rounded-full border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-400">隱崎ｨｼ諠・ｱ繧堤｢ｺ隱堺ｸｭ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00e5ff]/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00e5ff]/5 rounded-full blur-[100px]"></div>
            </div>

            <main className="w-full max-w-lg flex flex-col items-center justify-center relative z-10 animate-fade-in">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        譁ｰ繝代せ繝ｯ繝ｼ繝峨・險ｭ螳・                    </h1>
                    <p className="text-slate-400 text-sm">
                        8譁・ｭ嶺ｻ･荳翫・譁ｰ縺励＞繝代せ繝ｯ繝ｼ繝峨ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞
                    </p>
                </div>

                <div className="w-full glass-panel rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl border border-[#00e5ff]/20 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-50"></div>

                    {successMsg ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                                <span className="text-2xl">笨・/span>
                            </div>
                            <p className="text-emerald-400 font-bold mb-2">譖ｴ譁ｰ螳御ｺ・/p>
                            <p className="text-slate-300 text-sm">{successMsg}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    譁ｰ縺励＞繝代せ繝ｯ繝ｼ繝・                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#00e5ff]/60 focus:bg-slate-900/80 focus:ring-1 focus:ring-[#00e5ff]/40 transition-all font-mono text-sm"
                                    placeholder="8譁・ｭ嶺ｻ･荳・
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    譁ｰ縺励＞繝代せ繝ｯ繝ｼ繝会ｼ育｢ｺ隱咲畑・・                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#00e5ff]/60 focus:bg-slate-900/80 focus:ring-1 focus:ring-[#00e5ff]/40 transition-all font-mono text-sm"
                                    placeholder="繧ゅ≧荳蠎ｦ蜈･蜉帙＠縺ｦ縺上□縺輔＞"
                                />
                            </div>

                            {errorMsg && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 animate-fade-in">
                                    <span className="text-red-400 text-sm">笞・・/span>
                                    <p className="text-xs text-red-200 pt-0.5">{errorMsg}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-[#008299] to-[#00e5ff] hover:from-[#00e5ff] hover:to-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed hover:text-black tracking-widest uppercase text-sm"
                            >
                                {isLoading ? "UPDATING..." : "繝代せ繝ｯ繝ｼ繝峨ｒ譖ｴ譁ｰ"}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
