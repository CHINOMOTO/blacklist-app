"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAuth } from "@/components/RequireAuth";

const CATEGORIES = [
    { value: "bug", label: "繧ｷ繧ｹ繝・Β荳榊・蜷医・蝣ｱ蜻・ },
    { value: "feature", label: "讖溯・縺ｮ霑ｽ蜉繝ｻ謾ｹ蝟・ｦ∵悍" },
    { value: "account", label: "繧｢繧ｫ繧ｦ繝ｳ繝医↓髢｢縺吶ｋ逶ｸ隲・ },
    { value: "other", label: "縺昴・莉・ },
];

const MAX_MESSAGE_LENGTH = 2000;

export default function ContactPage() {
    const [companyName, setCompanyName] = useState("");
    const [userName, setUserName] = useState("");
    const [category, setCategory] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: appUser } = await supabase
                    .from("app_users")
                    .select("display_name, companies(name)")
                    .eq("id", user.id)
                    .single();

                if (appUser) {
                    setUserName(appUser.display_name || "");
                    setCompanyName((appUser.companies as any)?.name || "譛ｪ謇螻・);
                }
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!category) {
            setError("縺雁撫縺・粋繧上○遞ｮ鬘槭ｒ驕ｸ謚槭＠縺ｦ縺上□縺輔＞縲・);
            return;
        }
        if (!message.trim()) {
            setError("縺雁撫縺・粋繧上○蜀・ｮｹ繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・);
            return;
        }
        if (message.length > MAX_MESSAGE_LENGTH) {
            setError(`縺雁撫縺・粋繧上○蜀・ｮｹ縺ｯ${MAX_MESSAGE_LENGTH}譁・ｭ嶺ｻ･蜀・〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲Ａ);
            return;
        }

        setIsSending(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError("繝ｭ繧ｰ繧､繝ｳ諠・ｱ縺悟叙蠕励〒縺阪∪縺帙ｓ縺ｧ縺励◆縲ょ・蠎ｦ繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・);
                setIsSending(false);
                return;
            }

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    category,
                    message: message.trim(),
                    companyName,
                    userName,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "騾∽ｿ｡縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・);
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "莠域悄縺帙〓繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・);
        } finally {
            setIsSending(false);
        }
    };

    if (success) {
        return (
            <RequireAuth>
                <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                    <div className="max-w-2xl w-full relative z-10">
                        <div className="glass-panel rounded-3xl p-10 text-center animate-fade-in border border-[#00e5ff]/20">
                            <div className="text-5xl mb-6">笨・/div>
                            <h2 className="text-2xl font-bold text-white mb-4">
                                縺雁撫縺・粋繧上○繧帝∽ｿ｡縺励∪縺励◆
                            </h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                縺秘｣邨｡縺ゅｊ縺後→縺・＃縺悶＞縺ｾ縺吶・br />
                                邂｡逅・・′遒ｺ隱肴ｬ｡隨ｬ縲∝ｯｾ蠢懊＞縺溘＠縺ｾ縺吶・                            </p>
                            <Link
                                href="/dashboard"
                                className="inline-block px-8 py-3 bg-gradient-to-r from-[#008299] to-[#00e5ff] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all"
                            >
                                繝繝・す繝･繝懊・繝峨∈謌ｻ繧・                            </Link>
                        </div>
                    </div>
                </div>
            </RequireAuth>
        );
    }

    return (
        <RequireAuth>
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                <div className="max-w-2xl w-full relative z-10">
                    {/* 繝倥ャ繝繝ｼ */}
                    <div className="flex items-center justify-between mb-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                縺雁撫縺・粋繧上○
                            </h1>
                            <p className="text-slate-400">
                                邂｡逅・・∈縺ｮ騾｣邨｡繝ｻ縺皮嶌隲・・縺薙■繧峨°繧・                            </p>
                        </div>
                        <Link href="/dashboard" className="btn-secondary text-xs backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10 px-4 py-2.5">
                            謌ｻ繧・                        </Link>
                    </div>

                    {/* 繝輔か繝ｼ繝 */}
                    <div className="glass-panel rounded-3xl p-6 md:p-10 animate-fade-in border border-[#00e5ff]/20">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin h-8 w-8 border-4 border-[#00e5ff] rounded-full border-t-transparent"></div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* 莨夂､ｾ蜷搾ｼ郁・蜍募・蜉幢ｼ・*/}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-300">
                                        莨夂､ｾ蜷・                                    </label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        readOnly
                                        className="input-field w-full opacity-60 cursor-not-allowed"
                                    />
                                </div>

                                {/* 繝ｦ繝ｼ繧ｶ繝ｼ蜷搾ｼ郁・蜍募・蜉幢ｼ・*/}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-300">
                                        繝ｦ繝ｼ繧ｶ繝ｼ蜷・                                    </label>
                                    <input
                                        type="text"
                                        value={userName}
                                        readOnly
                                        className="input-field w-full opacity-60 cursor-not-allowed"
                                    />
                                </div>

                                {/* 縺雁撫縺・粋繧上○遞ｮ鬘・*/}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-300">
                                        縺雁撫縺・粋繧上○遞ｮ鬘・<span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="input-field w-full"
                                    >
                                        <option value="">-- 驕ｸ謚槭＠縺ｦ縺上□縺輔＞ --</option>
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 縺雁撫縺・粋繧上○蜀・ｮｹ */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-300">
                                        縺雁撫縺・粋繧上○蜀・ｮｹ <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="縺雁撫縺・粋繧上○蜀・ｮｹ繧貞・蜉帙＠縺ｦ縺上□縺輔＞"
                                        rows={6}
                                        maxLength={MAX_MESSAGE_LENGTH}
                                        className="input-field w-full resize-none"
                                    />
                                    <p className="text-xs text-slate-500 text-right">
                                        {message.length} / {MAX_MESSAGE_LENGTH}
                                    </p>
                                </div>

                                {/* 繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ */}
                                {error && (
                                    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                        <span className="text-red-400 text-lg">笞・・/span>
                                        <p className="text-sm text-red-200 leading-snug pt-0.5">{error}</p>
                                    </div>
                                )}

                                {/* 騾∽ｿ｡繝懊ち繝ｳ */}
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="w-full py-4 bg-gradient-to-r from-[#008299] to-[#00e5ff] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                >
                                    {isSending ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            騾∽ｿ｡荳ｭ...
                                        </span>
                                    ) : (
                                        "騾∽ｿ｡縺吶ｋ"
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </RequireAuth>
    );
}
