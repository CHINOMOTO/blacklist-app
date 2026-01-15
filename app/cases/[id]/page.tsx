"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAuth } from "@/components/RequireAuth";

type CaseDetail = {
    id: string;
    full_name: string;
    full_name_kana: string | null;
    gender: "male" | "female" | "other" | "unknown";
    birth_date: string;
    phone_last4: string | null;
    occurrence_date: string;
    reason_text: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    evidence_urls?: string[];
    registered_company_id?: string;
};

type EvidenceFile = {
    path: string;
    signedUrl: string;
    type: 'image' | 'other';
    name: string;
}

function genderLabel(g: CaseDetail["gender"]) {
    switch (g) {
        case "male":
            return "男性";
        case "female":
            return "女性";
        case "other":
            return "その他";
        case "unknown":
        default:
            return "未設定";
    }
}

function statusLabel(status: CaseDetail["status"]) {
    switch (status) {
        case "approved":
            return "承認済み";
        case "pending":
            return "審査中";
        case "rejected":
            return "却下";
    }
}

function statusColor(status: CaseDetail["status"]) {
    switch (status) {
        case "approved":
            return "text-emerald-400 border-emerald-500/30 bg-emerald-500/20";
        case "pending":
            return "text-amber-400 border-amber-500/30 bg-amber-500/20";
        case "rejected":
            return "text-red-400 border-red-500/30 bg-red-500/20";
    }
}

export default function CaseDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState<string | null>(null);

    // Storage files
    const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);

    useEffect(() => {
        if (!id) return;

        const fetchDetail = async () => {
            setLoading(true);
            setErrorMsg(null);

            const { data, error } = await supabase
                .from("blacklist_cases")
                .select(
                    "id, full_name, full_name_kana, gender, birth_date, phone_last4, occurrence_date, reason_text, status, created_at, evidence_urls, registered_company_id"
                )
                .eq("id", id)
                .maybeSingle();

            if (error) {
                setErrorMsg(error.message || "データの取得に失敗しました。");
                setLoading(false);
                return;
            }

            if (!data) {
                setErrorMsg("該当するデータが見つかりません。");
                setLoading(false);
                return;
            }

            setCaseDetail(data as CaseDetail);

            // Fetch Company Name if exists
            if (data.registered_company_id) {
                const { data: comp } = await supabase
                    .from("companies")
                    .select("name")
                    .eq("id", data.registered_company_id)
                    .single();
                if (comp) {
                    setCompanyName(comp.name);
                }
            }

            // 証拠ファイルの署名付きURLを取得
            if (data.evidence_urls && Array.isArray(data.evidence_urls) && data.evidence_urls.length > 0) {
                const files: EvidenceFile[] = [];
                for (const path of data.evidence_urls) {
                    const { data: signedData } = await supabase.storage
                        .from('case-evidence')
                        .createSignedUrl(path, 3600); // 1時間有効

                    if (signedData) {
                        const isImage = path.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        files.push({
                            path,
                            signedUrl: signedData.signedUrl,
                            type: isImage ? 'image' : 'other',
                            name: path.split('/').pop() || 'file'
                        });
                    }
                }
                setEvidenceFiles(files);
            } else {
                setEvidenceFiles([]);
            }

            setLoading(false);
        };

        fetchDetail();
    }, [id]);

    return (
        <RequireAuth>
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                <div className="max-w-3xl w-full">

                    <div className="mb-4 animate-fade-in">
                        <Link href="/cases" className="btn-secondary text-sm inline-flex items-center gap-2 px-4 py-2 hover:bg-slate-800 transition-colors mb-4">
                            一覧へ戻る
                        </Link>
                    </div>

                    <div className="glass-panel rounded-2xl p-8 shadow-xl animate-fade-in delay-100">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <span className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                            </div>
                        ) : errorMsg ? (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                                ⚠️ {errorMsg}
                            </div>
                        ) : !caseDetail ? (
                            <p className="text-slate-400 text-center py-8">データが見つかりません。</p>
                        ) : (
                            <div className="space-y-8">

                                {/* Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/50 pb-6">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white mb-1">{caseDetail.full_name}</h1>
                                        <p className="text-slate-400">{caseDetail.full_name_kana || ""}</p>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statusColor(caseDetail.status)}`}>
                                        {statusLabel(caseDetail.status)}
                                    </span>
                                </div>

                                {/* Info Grid */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-b border-emerald-500/20 pb-2">基本情報</h2>
                                        <dl className="space-y-3 text-sm">
                                            <div className="grid grid-cols-[120px_1fr]">
                                                <dt className="text-slate-400">性別</dt>
                                                <dd className="text-slate-100 font-medium">{genderLabel(caseDetail.gender)}</dd>
                                            </div>
                                            <div className="grid grid-cols-[120px_1fr]">
                                                <dt className="text-slate-400">生年月日</dt>
                                                <dd className="text-slate-100 font-medium">{caseDetail.birth_date?.replace(/-/g, "/") || "-"}</dd>
                                            </div>
                                            <div className="grid grid-cols-[120px_1fr]">
                                                <dt className="text-slate-400">電話番号(下4桁)</dt>
                                                <dd className="text-slate-100 font-medium">{caseDetail.phone_last4 || "-"}</dd>
                                            </div>
                                            <div className="grid grid-cols-[120px_1fr]">
                                                <dt className="text-slate-400">発生日</dt>
                                                <dd className="text-slate-100 font-medium">{caseDetail.occurrence_date?.replace(/-/g, "/") || "-"}</dd>
                                            </div>
                                            <div className="grid grid-cols-[120px_1fr]">
                                                <dt className="text-slate-400">登録日</dt>
                                                <dd className="text-slate-100 font-medium">
                                                    {caseDetail.created_at ? new Date(caseDetail.created_at).toLocaleDateString() : "-"}
                                                </dd>
                                            </div>
                                            <div className="grid grid-cols-[120px_1fr]">
                                                <dt className="text-slate-400">登録元</dt>
                                                <dd className="text-slate-100 font-medium">
                                                    {companyName || "-"}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div className="space-y-4">
                                        <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-b border-emerald-500/20 pb-2">トラブル詳細・理由</h2>
                                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 min-h-[160px]">
                                            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                                                {caseDetail.reason_text}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Evidence Files */}
                                <div className="space-y-4">
                                    <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-b border-emerald-500/20 pb-2">添付資料</h2>
                                    {evidenceFiles.length === 0 ? (
                                        <p className="text-sm text-slate-500">証拠ファイルはありません。</p>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {evidenceFiles.map((file, i) => (
                                                <div key={i} className="group relative bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-colors">
                                                    {file.type === 'image' ? (
                                                        <a href={file.signedUrl} target="_blank" rel="noopener noreferrer" className="block outline-none">
                                                            <div className="aspect-square relative flex items-center justify-center bg-slate-950">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={file.signedUrl} alt={file.name} className="max-w-full max-h-full object-contain" />
                                                            </div>
                                                            <div className="p-2 text-xs text-slate-300 truncate text-center group-hover:text-emerald-400 bg-slate-900/80 absolute bottom-0 w-full backdrop-blur-sm">
                                                                {file.name}
                                                            </div>
                                                        </a>
                                                    ) : (
                                                        <a href={file.signedUrl} target="_blank" rel="noopener noreferrer" className="block outline-none h-full p-4 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-emerald-400 aspect-square">
                                                            <span className="text-3xl">📄</span>
                                                            <span className="text-xs truncate w-full text-center">{file.name}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RequireAuth>
    );
}
