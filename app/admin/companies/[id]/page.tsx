"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { RequireAdmin } from "@/components/RequireAdmin";

export default function EditCompanyPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [name, setName] = useState("");
    const [isMain, setIsMain] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCompany = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from("companies")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                setError("莨夂､ｾ諠・ｱ縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆");
            } else if (data) {
                setName(data.name);
                setIsMain(data.is_main);
            }
            setLoading(false);
        };

        fetchCompany();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from("companies")
                .update({ name, is_main: isMain })
                .eq("id", id);

            if (updateError) throw updateError;

            router.push("/admin/companies");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "譖ｴ譁ｰ縺ｫ螟ｱ謨励＠縺ｾ縺励◆");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <RequireAdmin>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin h-10 w-10 border-4 border-[#00e5ff] rounded-full border-t-transparent"></div>
                </div>
            </RequireAdmin>
        );
    }

    return (
        <RequireAdmin>
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                <div className="max-w-2xl w-full">
                    <div className="mb-8 animate-fade-in">
                        <Link href="/admin/companies" className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1 mb-4">
                            繧ｭ繝｣繝ｳ繧ｻ繝ｫ縺励※荳隕ｧ縺ｸ謌ｻ繧・
                        </Link>
                        <h1 className="text-3xl font-bold text-white mb-2">莨夂､ｾ諠・ｱ縺ｮ邱ｨ髮・/h1>
                        <p className="text-slate-400">逋ｻ骭ｲ貂医∩縺ｮ莨夂､ｾ諠・ｱ繧呈峩譁ｰ縺励∪縺・/p>
                    </div>

                    <div className="glass-panel p-8 rounded-2xl animate-fade-in delay-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">
                                    莨夂､ｾ蜷・<span className="text-[#00e5ff]">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field"
                                    placeholder="萓・ 譬ｪ蠑丈ｼ夂､ｾ縲・・髪蠎・
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                <input
                                    type="checkbox"
                                    id="isMain"
                                    checked={isMain}
                                    onChange={(e) => setIsMain(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-[#00e5ff] focus:ring-[#00e5ff]/50"
                                />
                                <label htmlFor="isMain" className="cursor-pointer">
                                    <span className="block text-sm font-semibold text-slate-200">繝｡繧､繝ｳ莨夂､ｾ縺ｨ縺励※逋ｻ骭ｲ</span>
                                    <span className="block text-xs text-slate-500">窶ｻ騾壼ｸｸ縺ｯ繝√ぉ繝・け荳崎ｦ√〒縺呻ｼ育ｮ｡逅・畑繝輔Λ繧ｰ・・/span>
                                </label>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
                                    笞・・{error}
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary w-full py-3 text-base shadow-lg"
                                >
                                    {saving ? "譖ｴ譁ｰ荳ｭ..." : "螟画峩繧剃ｿ晏ｭ・}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </RequireAdmin>
    );
}
