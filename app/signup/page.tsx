"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [companyName, setCompanyName] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);

        try {
            // 1. Supabase Auth Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                if (authError.message.includes("User already registered")) {
                    throw new Error("縺薙・繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ縺ｯ譌｢縺ｫ逋ｻ骭ｲ縺輔ｌ縺ｦ縺・∪縺吶ゅΟ繧ｰ繧､繝ｳ逕ｻ髱｢縺九ｉ繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・);
                }
                if (authError.message.includes("Password should be at least")) {
                    throw new Error("繝代せ繝ｯ繝ｼ繝峨・8譁・ｭ嶺ｻ･荳翫〒險ｭ螳壹＠縺ｦ縺上□縺輔＞縲・);
                }
                throw new Error("繧｢繧ｫ繧ｦ繝ｳ繝育匳骭ｲ縺ｫ螟ｱ謨励＠縺ｾ縺励◆: " + authError.message);
            }

            if (!authData.user) {
                throw new Error("繝ｦ繝ｼ繧ｶ繝ｼ菴懈・縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲よ凾髢薙ｒ縺翫＞縺ｦ蜀榊ｺｦ縺願ｩｦ縺励￥縺縺輔＞縲・);
            }

            const userId = authData.user.id;

            // 2. 莨夂､ｾ諠・ｱ縺ｮ讀懃ｴ｢縺ｾ縺溘・菴懈・
            let companyId: string | null = null;

            // 莨夂､ｾ蜷阪ｒ豁｣隕丞喧・郁｡ｨ險倥ｆ繧悟ｯｾ遲厄ｼ・
            const normalizeCompanyName = (name: string): string => {
                let n = name.trim();
                // 蜈ｨ隗偵せ繝壹・繧ｹ繝ｻ蜊願ｧ偵せ繝壹・繧ｹ繧帝勁蜴ｻ
                n = n.replace(/[\s\u3000]+/g, '');
                // 繹ｱ 竊・譬ｪ蠑丈ｼ夂､ｾ
                n = n.replace(/繹ｱ/g, '譬ｪ蠑丈ｼ夂､ｾ');
                // 繹ｲ 竊・譛蛾剞莨夂､ｾ
                n = n.replace(/繹ｲ/g, '譛蛾剞莨夂､ｾ');
                // (譬ｪ) 竊・譬ｪ蠑丈ｼ夂､ｾ
                n = n.replace(/[・・]譬ｪ[・・]/g, '譬ｪ蠑丈ｼ夂､ｾ');
                // (譛・ 竊・譛蛾剞莨夂､ｾ
                n = n.replace(/[・・]譛閏・・]/g, '譛蛾剞莨夂､ｾ');
                // 蜈ｨ隗定恭謨ｰ蟄励ｒ蜊願ｧ偵↓螟画鋤
                n = n.replace(/[・｡-・ｺ・・・夲ｼ・・兢/g, (s) =>
                    String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
                );
                return n;
            };

            const normalizedName = normalizeCompanyName(companyName);

            // 譌｢蟄倥・莨夂､ｾ繧貞・莉ｶ蜿門ｾ励＠縺ｦ豁｣隕丞喧蠕後・蜷榊燕縺ｧ豈碑ｼ・
            const { data: allCompanies } = await supabase
                .from("companies")
                .select("id, name");

            const matchedCompany = (allCompanies || []).find(
                (c) => normalizeCompanyName(c.name) === normalizedName
            );

            if (matchedCompany) {
                companyId = matchedCompany.id;
            } else {
                // 譁ｰ隕丈ｽ懈・・医Θ繝ｼ繧ｶ繝ｼ縺悟・蜉帙＠縺溘◎縺ｮ縺ｾ縺ｾ縺ｮ蜷榊燕縺ｧ菫晏ｭ假ｼ・
                const { data: newCompany, error: companyError } = await supabase
                    .from("companies")
                    .insert([{ name: companyName.trim(), is_main: false }])
                    .select("id")
                    .single();

                if (companyError) {
                    throw new Error("莨夂､ｾ諠・ｱ縺ｮ逋ｻ骭ｲ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲らｮ｡逅・・↓縺雁撫縺・粋繧上○縺上□縺輔＞縲・);
                }
                companyId = newCompany.id;
            }

            if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
                throw new Error("縺薙・繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ縺ｯ譌｢縺ｫ逋ｻ骭ｲ縺輔ｌ縺ｦ縺・∪縺吶ゅΟ繧ｰ繧､繝ｳ逕ｻ髱｢縺九ｉ繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・);
            }

            // 3. app_users繝・・繝悶Ν縺ｸ縺ｮ霑ｽ蜉
            // 蟆代＠蠕・ｩ溘＠縺ｦauth.users縺ｮ莨晄眺繧堤｢ｺ螳溘↓縺吶ｋ・亥ｿｵ縺ｮ轤ｺ・・
            await new Promise(resolve => setTimeout(resolve, 1000));

            const { error: appUserError } = await supabase
                .from("app_users")
                .upsert([
                    {
                        id: userId,
                        display_name: displayName,
                        company_id: companyId,
                        role: "viewer",
                        is_approved: false
                    }
                ]);

            if (appUserError) {
                console.error("App User Insert Error:", appUserError);
                if (appUserError.code === "23503") {
                    throw new Error("縺薙・繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ縺ｯ譌｢縺ｫ逋ｻ骭ｲ縺輔ｌ縺ｦ縺・∪縺吶ゅΟ繧ｰ繧､繝ｳ逕ｻ髱｢縺九ｉ繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・);
                }
                throw new Error(`繝ｦ繝ｼ繧ｶ繝ｼ繝励Ο繝輔ぅ繝ｼ繝ｫ縺ｮ菫晏ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆: ${appUserError.message} (Code: ${appUserError.code})`);
            }

            // LINE騾夂衍API縺ｮ蜻ｼ縺ｳ蜃ｺ縺暦ｼ亥､ｱ謨励＠縺ｦ繧ゅΘ繝ｼ繧ｶ繝ｼ縺ｮ逕ｻ髱｢驕ｷ遘ｻ縺ｯ豁｢繧√↑縺・ｼ・
            try {
                await fetch('/api/notify/line', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'signup',
                        data: {
                            name: displayName,
                            company: companyName,
                            email: email
                        }
                    })
                });
            } catch (notifyErr) {
                console.error("Notify Error:", notifyErr);
            }

            router.push("/pending-approval");

        } catch (err: any) {
            setErrorMsg(err.message || "莠域悄縺帙〓繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-full max-w-lg relative z-10 my-8">
                <div className="glass-panel rounded-3xl p-8 md:p-10 shadow-2xl border border-white/5 animate-fade-in backdrop-blur-xl">

                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-4 border border-white/5 shadow-inner">
                            <span className="text-2xl filter">笨ｨ</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            譁ｰ隕上い繧ｫ繧ｦ繝ｳ繝井ｽ懈・
                        </h1>
                        <p className="text-slate-400 text-sm">
                            繧｢繧ｫ繧ｦ繝ｳ繝域ュ蝣ｱ繧貞・蜉帙＠縺ｦ縺上□縺輔＞
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">

                        <div className="grid grid-cols-1 gap-5">
                            {/* Display Name */}
                            <div className="input-group group space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    豌丞錐・郁｡ｨ遉ｺ蜷搾ｼ・<span className="text-[#00e5ff]">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#00e5ff]/50 focus:bg-slate-900/60 focus:ring-4 focus:ring-[#00e5ff]/10 transition-all duration-300"
                                    placeholder="萓・ 螻ｱ逕ｰ 螟ｪ驛・
                                />
                            </div>

                            {/* Company Name */}
                            <div className="input-group group space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    莨夂､ｾ蜷・<span className="text-[#00e5ff]">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#00e5ff]/50 focus:bg-slate-900/60 focus:ring-4 focus:ring-[#00e5ff]/10 transition-all duration-300"
                                    placeholder="萓・ 譬ｪ蠑丈ｼ夂､ｾ縲・・ｻｺ險ｭ"
                                />
                                <p className="text-[10px] text-slate-500 pl-1">
                                    窶ｻ譌｢蟄倥・莨夂､ｾ縺後≠繧句ｴ蜷医・閾ｪ蜍慕噪縺ｫ邏蝉ｻ倥￠繧峨ｌ縺ｾ縺・
                                </p>
                            </div>

                            {/* Email */}
                            <div className="input-group group space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ <span className="text-[#00e5ff]">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#00e5ff]/50 focus:bg-slate-900/60 focus:ring-4 focus:ring-[#00e5ff]/10 transition-all duration-300"
                                    placeholder="name@company.com"
                                />
                            </div>

                            {/* Password */}
                            <div className="input-group group space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    繝代せ繝ｯ繝ｼ繝・<span className="text-[#00e5ff]">*</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#00e5ff]/50 focus:bg-slate-900/60 focus:ring-4 focus:ring-[#00e5ff]/10 transition-all duration-300"
                                    placeholder="8譁・ｭ嶺ｻ･荳翫〒險ｭ螳・
                                />
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fade-in flex items-start gap-3 mt-4">
                                <span className="text-red-400 text-lg">笞・・/span>
                                <p className="text-sm text-red-200 leading-snug pt-0.5">
                                    {errorMsg}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-[#00e5ff]/80 to-[#00e5ff] hover:from-[#00e5ff] hover:to-[#00e5ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00e5ff] shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                "繧｢繧ｫ繧ｦ繝ｳ繝井ｽ懈・・育筏隲具ｼ・
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-xs text-slate-500 text-center leading-relaxed">
                        逋ｻ骭ｲ逕ｳ隲句ｾ後∫ｮ｡逅・・↓繧医ｋ謇ｿ隱阪′蠢・ｦ√〒縺吶・br />
                        <Link href="/" className="text-[#00e5ff] hover:text-[#00e5ff] underline underline-offset-2 ml-1">
                            縺吶〒縺ｫ繧｢繧ｫ繧ｦ繝ｳ繝医ｒ縺頑戟縺｡縺ｮ譁ｹ縺ｯ縺薙■繧・
                        </Link>
                    </p>
                </div>

                <div className="text-center mt-6">
                    <Link href="/" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                        繝医ャ繝励・繝ｼ繧ｸ縺ｫ謌ｻ繧・
                    </Link>
                </div>
            </div>
        </div>
    );
}
