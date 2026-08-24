"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAdmin } from "@/components/RequireAdmin";

type Inquiry = {
    id: string;
    user_name: string;
    company_name: string;
    email: string;
    category: string;
    message: string;
    status: string;
    created_at: string;
};

const CATEGORY_LABELS: Record<string, string> = {
    bug: "繧ｷ繧ｹ繝・Β荳榊・蜷医・蝣ｱ蜻・,
    feature: "讖溯・縺ｮ霑ｽ蜉繝ｻ謾ｹ蝟・ｦ∵悍",
    account: "繧｢繧ｫ繧ｦ繝ｳ繝医↓髢｢縺吶ｋ逶ｸ隲・,
    other: "縺昴・莉・,
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    unread: { label: "譛ｪ隱ｭ", className: "bg-red-500/20 text-red-400 border-red-500/30" },
    in_progress: { label: "蟇ｾ蠢應ｸｭ", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    resolved: { label: "蟇ｾ蠢懈ｸ医∩", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

export default function AdminInquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

    useEffect(() => {
        const fetchInquiries = async () => {
            const { data, error } = await supabase
                .from("contact_inquiries")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error && data) {
                setInquiries(data);
            }
            setLoading(false);
        };
        fetchInquiries();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from("contact_inquiries")
            .update({ status: newStatus })
            .eq("id", id);

        if (!error) {
            setInquiries(prev =>
                prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq)
            );
            if (selectedInquiry?.id === id) {
                setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
            }
        }
    };

    return (
        <RequireAdmin>
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                <div className="max-w-5xl w-full relative z-10">
                    {/* 繝倥ャ繝繝ｼ */}
                    <div className="flex items-center justify-between mb-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                縺雁撫縺・粋繧上○邂｡逅・                            </h1>
                            <p className="text-slate-400">
                                繝ｦ繝ｼ繧ｶ繝ｼ縺九ｉ縺ｮ縺雁撫縺・粋繧上○繧堤｢ｺ隱阪・邂｡逅・＠縺ｾ縺・                            </p>
                        </div>
                        <Link href="/admin" className="btn-secondary text-xs backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10 px-4 py-2.5">
                            邂｡逅・・Γ繝九Η繝ｼ縺ｸ謌ｻ繧・                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin h-10 w-10 border-4 border-[#00e5ff] rounded-full border-t-transparent"></div>
                        </div>
                    ) : inquiries.length === 0 ? (
                        <div className="glass-panel rounded-3xl p-10 text-center animate-fade-in border border-[#00e5ff]/20">
                            <div className="text-4xl mb-4 opacity-30">働</div>
                            <p className="text-slate-400 font-medium">縺雁撫縺・粋繧上○縺ｯ縺ｾ縺縺ゅｊ縺ｾ縺帙ｓ縲・/p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            {inquiries.map((inq) => (
                                <button
                                    key={inq.id}
                                    onClick={() => setSelectedInquiry(inq)}
                                    className={`w-full text-left glass-panel rounded-2xl p-5 border transition-all hover:-translate-y-0.5 hover:shadow-lg ${inq.status === 'unread'
                                        ? 'border-red-500/30 hover:border-red-500/50'
                                        : 'border-[#00e5ff]/10 hover:border-[#00e5ff]/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${STATUS_LABELS[inq.status]?.className || ''}`}>
                                                {STATUS_LABELS[inq.status]?.label || inq.status}
                                            </span>
                                            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                                                {CATEGORY_LABELS[inq.category] || inq.category}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-500 font-mono">
                                            {new Date(inq.created_at).toLocaleString("ja-JP")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <span className="text-sm text-slate-300 font-bold">{inq.company_name}</span>
                                        <span className="text-sm text-slate-400">{inq.user_name}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-2">
                                        {inq.message}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 隧ｳ邏ｰ繝｢繝ｼ繝繝ｫ */}
            {selectedInquiry && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in"
                    onClick={() => setSelectedInquiry(null)}
                >
                    <div
                        className="glass-panel rounded-3xl p-8 max-w-xl w-full mx-4 border border-[#00e5ff]/20 max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 繧ｹ繝・・繧ｿ繧ｹ繝舌ャ繧ｸ */}
                        <div className="flex items-center justify-between mb-6">
                            <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${STATUS_LABELS[selectedInquiry.status]?.className || ''}`}>
                                {STATUS_LABELS[selectedInquiry.status]?.label || selectedInquiry.status}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                                {new Date(selectedInquiry.created_at).toLocaleString("ja-JP")}
                            </span>
                        </div>

                        {/* 諠・ｱ */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">縺雁撫縺・粋繧上○遞ｮ鬘・/p>
                                <p className="text-sm text-white font-bold">{CATEGORY_LABELS[selectedInquiry.category] || selectedInquiry.category}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">莨夂､ｾ蜷・/p>
                                    <p className="text-sm text-slate-200">{selectedInquiry.company_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">繝ｦ繝ｼ繧ｶ繝ｼ蜷・/p>
                                    <p className="text-sm text-slate-200">{selectedInquiry.user_name}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ</p>
                                <p className="text-sm text-slate-200 font-mono">{selectedInquiry.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">縺雁撫縺・粋繧上○蜀・ｮｹ</p>
                                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/30">
                                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
                                </div>
                            </div>
                        </div>

                        {/* 繧ｹ繝・・繧ｿ繧ｹ螟画峩繝懊ち繝ｳ */}
                        <div className="border-t border-slate-700/50 pt-5">
                            <p className="text-xs text-slate-500 mb-3">繧ｹ繝・・繧ｿ繧ｹ繧貞､画峩</p>
                            <div className="flex gap-2">
                                {Object.entries(STATUS_LABELS).map(([key, val]) => (
                                    <button
                                        key={key}
                                        onClick={() => updateStatus(selectedInquiry.id, key)}
                                        disabled={selectedInquiry.status === key}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${selectedInquiry.status === key
                                            ? `${val.className} opacity-100`
                                            : 'border-slate-700 text-slate-400 hover:border-slate-500'
                                            } disabled:cursor-not-allowed`}
                                    >
                                        {val.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 髢峨§繧・*/}
                        <button
                            onClick={() => setSelectedInquiry(null)}
                            className="w-full mt-5 py-3 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-xl transition-all"
                        >
                            髢峨§繧・                        </button>
                    </div>
                </div>
            )}
        </RequireAdmin>
    );
}
