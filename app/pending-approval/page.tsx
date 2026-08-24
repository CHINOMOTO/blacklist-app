"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function PendingApprovalPage() {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg glass-panel rounded-2xl p-10 text-center animate-fade-in border-t border-slate-600/50">

                <div className="w-20 h-20 bg-[#00e5ff]/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-[#00e5ff]/30">
                    <span className="text-4xl">竢ｳ</span>
                </div>

                <h1 className="text-2xl font-bold text-white mb-3">
                    謇ｿ隱榊ｾ・■縺ｧ縺・
                </h1>

                <p className="text-slate-300 mb-8 leading-relaxed">
                    繧｢繧ｫ繧ｦ繝ｳ繝育匳骭ｲ縺ｮ逕ｳ隲九ｒ蜿励￠莉倥￠縺ｾ縺励◆縲・br />
                    迴ｾ蝨ｨ縲∫ｮ｡逅・・↓繧医ｋ遒ｺ隱阪ｒ陦後▲縺ｦ縺翫ｊ縺ｾ縺吶・
                </p>

                <div className="bg-slate-900/40 rounded-xl p-6 text-left mb-8 border border-slate-700/50">
                    <h3 className="text-xs font-bold text-[#00e5ff] mb-2 uppercase tracking-widest">Next Steps</h3>
                    <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                        <li>邂｡逅・・′縺ゅ↑縺溘・謇螻樊ュ蝣ｱ繧堤｢ｺ隱阪＠縺ｾ縺・/li>
                        <li>遒ｺ隱阪Γ繝ｼ繝ｫ縺碁√ｉ繧後∪縺励◆縺ｮ縺ｧ縲∬ｪ崎ｨｼ繝ｪ繝ｳ繧ｯ繧偵け繝ｪ繝・け縺励※縺上□縺輔＞</li>
                        <li>謇ｿ隱榊ｾ後∵悽繧ｷ繧ｹ繝・Β繧貞茜逕ｨ蜿ｯ閭ｽ縺ｫ縺ｪ繧翫∪縺・/li>
                    </ul>
                </div>

                <button
                    onClick={handleLogout}
                    className="btn-secondary w-full"
                >
                    荳蠎ｦ繝ｭ繧ｰ繧｢繧ｦ繝医＠縺ｦ蠕・ｩ溘☆繧・
                </button>
            </div>
        </div>
    );
}
