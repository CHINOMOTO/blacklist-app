"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAdmin } from "@/components/RequireAdmin";

type Company = {
    id: string;
    name: string;
    is_main: boolean;
    created_at: string;
};

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [creatingSeed, setCreatingSeed] = useState(false);

    const fetchCompanies = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("companies")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
        } else {
            setCompanies(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`本当に「${name}」を削除しますか？\n所属するユーザーやデータがある場合、不整合が生じる可能性があります。`)) return;

        try {
            const { error } = await supabase
                .from("companies")
                .delete()
                .eq("id", id);

            if (error) throw error;

            alert("削除しました。");
            setCompanies(prev => prev.filter(c => c.id !== id));
        } catch (err: any) {
            alert("削除に失敗しました: " + err.message);
        }
    };

    const handleSeedData = async () => {
        if (!confirm("ダミー会社データを5件追加しますか？")) return;
        setCreatingSeed(true);

        const dummyCompanies = [
            { name: "山田建設株式会社 (Dummy)", is_main: false },
            { name: "鈴木工務店 (Dummy)", is_main: false },
            { name: "株式会社サトウ・エンジニアリング (Dummy)", is_main: false },
            { name: "田中セキュリティーサービス (Dummy)", is_main: false },
            { name: "高橋人材派遣センター (Dummy)", is_main: false },
        ];

        try {
            const { error } = await supabase
                .from("companies")
                .insert(dummyCompanies);

            if (error) throw error;

            alert("ダミーデータを追加しました！");
            fetchCompanies();
        } catch (err: any) {
            alert("エラーが発生しました: " + err.message);
        } finally {
            setCreatingSeed(false);
        }
    };

    return (
        <RequireAdmin>
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                <div className="max-w-4xl w-full relative z-10">
                    <div className="flex items-center justify-between mb-8 animate-fade-in">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">Company List</h1>
                            <p className="text-slate-300 font-medium">利用会社（グループ会社）の管理</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSeedData}
                                disabled={creatingSeed}
                                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white border border-slate-700/50 rounded-lg hover:bg-slate-800/50 transition-colors backdrop-blur-sm"
                            >
                                {creatingSeed ? "生成中..." : "DEV: Generate Data"}
                            </button>
                            <Link href="/admin/companies/new" className="btn-primary flex items-center gap-2 px-5 py-2.5 shadow-lg shadow-[#00e5ff]/20 hover:shadow-[#00e5ff]/40 hover:-translate-y-0.5 transition-all rounded-xl font-bold text-sm">
                                <span>+</span> 新規会社追加
                            </Link>
                        </div>
                    </div>

                    <div className="mb-6 animate-fade-in delay-100">
                        <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1 transition-colors w-fit">
                            戻る
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="relative">
                                <div className="animate-spin h-12 w-12 border-4 border-[#00e5ff]/20 rounded-full border-t-[#00e5ff]"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-4 w-4 bg-[#00e5ff]/20 rounded-full blur-md"></div>
                                </div>
                            </div>
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="glass-panel p-12 text-center rounded-3xl border-white/5 bg-slate-900/30 animate-fade-in">
                            <span className="text-4xl mb-4 block opacity-30">🏢</span>
                            <p className="text-slate-400 font-medium">登録されている会社はありません。</p>
                            <p className="text-slate-500 text-sm mt-2">右上のボタンから新規追加してください。</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 animate-fade-in delay-100">
                            {companies.map((company) => (
                                <div
                                    key={company.id}
                                    className="glass-panel p-6 rounded-2xl flex items-center justify-between hover:bg-slate-800/30 transition-all border border-white/5 hover:border-[#00e5ff]/30 hover:shadow-lg group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl shadow-inner group-hover:from-[#00e5ff]/20 group-hover:to-slate-800 transition-colors">
                                            🏢
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-[#00e5ff] transition-colors">
                                                {company.name}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                {company.is_main && (
                                                    <span className="text-[10px] bg-[#00e5ff]/10 text-[#00e5ff] px-2.5 py-0.5 rounded-full border border-[#00e5ff]/20 font-bold tracking-widest">
                                                        HQ / MAIN
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded font-mono">
                                                    ID: {company.id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/admin/companies/${company.id}`}
                                            className="p-2 bg-slate-800 hover:bg-[#00e5ff]/20 text-slate-400 hover:text-[#00e5ff] rounded-lg transition-colors"
                                            title="編集"
                                        >
                                            ✎
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(company.id, company.name)}
                                            className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                            title="削除"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </RequireAdmin>
    );
}
