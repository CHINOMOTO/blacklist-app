"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAdmin } from "@/components/RequireAdmin";

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
  approved_at: string | null;
  rejected_reason: string | null;
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
      return "逕ｷ諤ｧ";
    case "female":
      return "螂ｳ諤ｧ";
    case "other":
      return "縺昴・莉・;
    case "unknown":
    default:
      return "譛ｪ險ｭ螳・;
  }
}

function statusLabel(status: CaseDetail["status"]) {
  switch (status) {
    case "approved":
      return "謇ｿ隱肴ｸ医∩";
    case "pending":
      return "蟇ｩ譟ｻ荳ｭ";
    case "rejected":
      return "蜊ｴ荳・;
  }
}

export default function AdminCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null); // 繝・・繧ｿ蜿門ｾ励お繝ｩ繝ｼ・医ヶ繝ｭ繝・く繝ｳ繧ｰ・・
  const [companyName, setCompanyName] = useState<string | null>(null);

  // Action States
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); // 繝輔か繝ｼ繝謫堺ｽ懊お繝ｩ繝ｼ・磯撼繝悶Ο繝・く繝ｳ繧ｰ・・

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState<{ type: 'approved' | 'rejected' } | null>(null);

  // Storage files
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      setLoading(true);
      setFetchError(null);

      const { data, error } = await supabase
        .from("blacklist_cases")
        .select(
          "id, full_name, full_name_kana, gender, birth_date, phone_last4, occurrence_date, reason_text, status, created_at, approved_at, rejected_reason, evidence_urls, registered_company_id"
        )
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setFetchError(error.message || "繝・・繧ｿ縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆縲・);
        setLoading(false);
        return;
      }

      if (!data) {
        setFetchError("隧ｲ蠖薙☆繧九ョ繝ｼ繧ｿ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・);
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

      // 險ｼ諡繝輔ぃ繧､繝ｫ縺ｮ鄂ｲ蜷堺ｻ倥″URL繧貞叙蠕・
      if (data.evidence_urls && Array.isArray(data.evidence_urls) && data.evidence_urls.length > 0) {
        const files: EvidenceFile[] = [];
        for (const path of data.evidence_urls) {
          const { data: signedData } = await supabase.storage
            .from('case-evidence')
            .createSignedUrl(path, 3600); // 1譎る俣譛牙柑

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

  const executeApprove = async () => {
    if (!caseDetail) return;
    setFormError(null);
    setIsProcessing(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setFormError("繝ｭ繧ｰ繧､繝ｳ諠・ｱ繧貞叙蠕励〒縺阪∪縺帙ｓ縺ｧ縺励◆縲ょ・蠎ｦ繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・);
        setIsProcessing(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("blacklist_cases")
        .update({
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejected_reason: null,
        })
        .eq("id", caseDetail.id);

      if (updateError) {
        setFormError(updateError.message || "謇ｿ隱阪↓螟ｱ謨励＠縺ｾ縺励◆縲・);
        setIsProcessing(false);
        return;
      }

      // 謌仙粥
      setIsProcessing(false);
      setShowApproveModal(false);
      setShowSuccessModal({ type: 'approved' });

    } catch {
      setFormError("莠域悄縺帙〓繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・);
      setIsProcessing(false);
    }
  };

  const executeReject = async () => {
    if (!caseDetail) return;

    if (!rejectReason.trim()) {
      setFormError("蜊ｴ荳狗炊逕ｱ繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・);
      // 繝｢繝ｼ繝繝ｫ縺ｯ髢峨§縺ｪ縺・
      return;
    }

    setFormError(null);
    setIsProcessing(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setFormError("繝ｭ繧ｰ繧､繝ｳ諠・ｱ繧貞叙蠕励〒縺阪∪縺帙ｓ縺ｧ縺励◆縲ょ・蠎ｦ繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・);
        setIsProcessing(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("blacklist_cases")
        .update({
          status: "rejected",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejected_reason: rejectReason.trim(),
        })
        .eq("id", caseDetail.id);

      if (updateError) {
        setFormError(updateError.message || "蜊ｴ荳九↓螟ｱ謨励＠縺ｾ縺励◆縲・);
        setIsProcessing(false);
        return;
      }

      // 謌仙粥
      setIsProcessing(false);
      setShowRejectModal(false);
      setShowSuccessModal({ type: 'rejected' });

    } catch {
      setFormError("莠域悄縺帙〓繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・);
      setIsProcessing(false);
    }
  };

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center pt-12 pb-12">
        <div className="max-w-3xl w-full mx-4 bg-slate-800/80 border border-slate-700 rounded-2xl p-8 shadow-xl relative">

          {loading ? (
            <p className="text-sm text-slate-200 text-center py-10">隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ縺ｧ縺・..</p>
          ) : fetchError ? (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-700 rounded-md px-3 py-2">
              {fetchError}
            </p>
          ) : !caseDetail ? (
            <p className="text-sm text-slate-300">繝・・繧ｿ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・/p>
          ) : (
            <>
              <div className="mb-4">
                <Link
                  href="/admin/cases"
                  className="text-sm text-[#00e5ff] hover:text-[#00e5ff] transition-colors inline-block mb-2"
                >
                  荳隕ｧ縺ｸ謌ｻ繧・
                </Link>
                <h1 className="text-xl font-bold text-[#00e5ff]">
                  謇ｿ隱阪・蜊ｴ荳具ｼ郁ｩｳ邏ｰ・・
                </h1>
              </div>

              {/* Inline Error for Ops */}
              {formError && !showRejectModal && (
                <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-200 text-xs">
                  笞・・{formError}
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                  <h2 className="text-sm font-bold text-[#00e5ff] uppercase tracking-widest mb-4 border-b border-[#00e5ff]/20 pb-2">蝓ｺ譛ｬ諠・ｱ</h2>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">豌丞錐・・/span>
                      <span className="text-slate-50 font-semibold">{caseDetail.full_name}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">豌丞錐・医き繝奇ｼ会ｼ・/span>
                      <span className="text-slate-50">{caseDetail.full_name_kana || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">諤ｧ蛻･・・/span>
                      <span className="text-slate-50">{genderLabel(caseDetail.gender)}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">逕溷ｹｴ譛域律・・/span>
                      <span className="text-slate-50">{caseDetail.birth_date?.replace(/-/g, "/")}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">髮ｻ隧ｱ逡ｪ蜿ｷ・井ｸ・譯・ｼ会ｼ・/span>
                      <span className="text-slate-50">{caseDetail.phone_last4 || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">逋ｺ逕滓律・・/span>
                      <span className="text-slate-50">{caseDetail.occurrence_date?.replace(/-/g, "/")}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">逋ｻ骭ｲ譌･・・/span>
                      <span className="text-slate-50">
                        {caseDetail.created_at
                          ? new Date(caseDetail.created_at).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">逋ｻ骭ｲ蜈・ｼ・/span>
                      <span className="text-slate-50">{companyName || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">繧ｹ繝・・繧ｿ繧ｹ・・/span>
                      <span className="text-slate-50 font-bold">{statusLabel(caseDetail.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                  <h2 className="text-sm font-bold text-[#00e5ff] uppercase tracking-widest mb-4 border-b border-[#00e5ff]/20 pb-2">繝医Λ繝悶Ν隧ｳ邏ｰ繝ｻ逅・罰</h2>
                  <div className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {caseDetail.reason_text}
                  </div>
                </div>

                {/* 險ｼ諡繝輔ぃ繧､繝ｫ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                  <h2 className="text-sm font-bold text-[#00e5ff] uppercase tracking-widest mb-4 border-b border-[#00e5ff]/20 pb-2">豺ｻ莉倩ｳ・侭</h2>
                  {evidenceFiles.length === 0 ? (
                    <p className="text-sm text-slate-500">險ｼ諡繝輔ぃ繧､繝ｫ縺ｯ縺ゅｊ縺ｾ縺帙ｓ縲・/p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {evidenceFiles.map((file, i) => (
                        <div key={i} className="group relative bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-[#00e5ff]/50 transition-colors">
                          {file.type === 'image' ? (
                            <a href={file.signedUrl} target="_blank" rel="noopener noreferrer" className="block outline-none">
                              <div className="aspect-square relative flex items-center justify-center bg-slate-950">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={file.signedUrl} alt={file.name} className="max-w-full max-h-full object-contain" />
                              </div>
                              <div className="p-2 text-xs text-slate-300 truncate text-center group-hover:text-[#00e5ff] bg-slate-900/80 absolute bottom-0 w-full backdrop-blur-sm">
                                {file.name}
                              </div>
                            </a>
                          ) : (
                            <a href={file.signedUrl} target="_blank" rel="noopener noreferrer" className="block outline-none h-full p-4 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-[#00e5ff]">
                              <span className="text-3xl">塘</span>
                              <span className="text-xs truncate w-full text-center">{file.name}</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(true)}
                  disabled={isProcessing}
                  className="flex-1 bg-[#00e5ff]/80 hover:bg-[#00e5ff] disabled:bg-[#00e5ff]/40 text-black font-bold py-3 rounded-lg text-sm transition-all shadow-lg"
                >
                  謇ｿ隱阪☆繧・
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setShowRejectModal(true)
                  }}
                  disabled={isProcessing}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-red-800/60 text-white font-bold py-3 rounded-lg text-sm transition-all shadow-lg shadow-red-900/20"
                >
                  蜊ｴ荳九☆繧・
                </button>
              </div>
            </>
          )}

          {/* === Modals === */}

          {/* Approve Confirmation Modal */}
          {showApproveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-900 border border-[#00e5ff] p-8 rounded-2xl max-w-sm w-full shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                <h3 className="text-xl font-bold text-white mb-4">謇ｿ隱阪・遒ｺ隱・/h3>
                <p className="text-slate-300 mb-8">
                  縺薙・逕ｳ隲九ｒ謇ｿ隱阪＠縺ｾ縺吶°・・br />
                  <span className="text-xs text-slate-500">謇ｿ隱阪☆繧九→縲√☆縺ｹ縺ｦ縺ｮ繝ｦ繝ｼ繧ｶ繝ｼ縺後％縺ｮ繝・・繧ｿ繧帝夢隕ｧ縺ｧ縺阪ｋ繧医≧縺ｫ縺ｪ繧翫∪縺吶・/span>
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="flex-1 py-2 rounded border border-slate-600 text-slate-400 hover:bg-slate-800"
                  >
                    繧ｭ繝｣繝ｳ繧ｻ繝ｫ
                  </button>
                  <button
                    onClick={executeApprove}
                    disabled={isProcessing}
                    className="flex-1 py-2 rounded bg-[#00e5ff] text-black font-bold hover:bg-[#00e5ff]/80 shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                  >
                    {isProcessing ? "蜃ｦ逅・ｸｭ..." : "謇ｿ隱咲｢ｺ螳・}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Input Modal */}
          {showRejectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-900 border border-red-500 p-8 rounded-2xl max-w-md w-full shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <h3 className="text-xl font-bold text-white mb-4">蜊ｴ荳九・遒ｺ隱・/h3>
                <p className="text-slate-300 mb-4">
                  縺薙・逕ｳ隲九ｒ蜊ｴ荳九＠縺ｾ縺吶°・・br />
                  <span className="text-xs text-slate-500">蜊ｴ荳狗炊逕ｱ繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲ら筏隲九Θ繝ｼ繧ｶ繝ｼ縺ｫ縺ｯ騾夂衍縺輔ｌ縺ｾ縺帙ｓ縺後∬ｨ倬鹸縺ｨ縺励※谿九ｊ縺ｾ縺吶・/span>
                </p>

                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-100 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all mb-4"
                  placeholder="萓・ 諠・ｱ荳崎ｶｳ縺ｮ縺溘ａ縲∵悽莠ｺ遒ｺ隱阪′蜿悶ｌ縺ｪ縺・◆繧∫ｭ・
                />
                {formError && (
                  <div className="mb-4 text-xs text-red-400">笞・・{formError}</div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setFormError(null);
                    }}
                    className="flex-1 py-2 rounded border border-slate-600 text-slate-400 hover:bg-slate-800"
                  >
                    繧ｭ繝｣繝ｳ繧ｻ繝ｫ
                  </button>
                  <button
                    onClick={executeReject}
                    disabled={isProcessing}
                    className="flex-1 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  >
                    {isProcessing ? "蜃ｦ逅・ｸｭ..." : "蜊ｴ荳狗｢ｺ螳・}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
              <div className={`p-10 rounded-3xl max-w-sm w-full text-center border-t-4 shadow-2xl ${showSuccessModal.type === 'approved' ? 'border-[#00e5ff] shadow-[0_0_50px_rgba(0,229,255,0.2)]' : 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]'}`}>
                <h3 className="text-xl font-bold text-white mb-8">
                  {showSuccessModal.type === 'approved' ? '逕ｳ隲九′謇ｿ隱阪＆繧後∪縺励◆縲・ : '逕ｳ隲九′蜊ｴ荳九＆繧後∪縺励◆縲・}
                </h3>
                <button
                  onClick={() => router.push("/admin/cases")}
                  className={`w-full py-3 rounded-lg font-bold text-black ${showSuccessModal.type === 'approved' ? 'bg-[#00e5ff] hover:bg-[#00e5ff]/80' : 'bg-red-500 hover:bg-red-400 text-white'}`}
                >
                  荳隕ｧ縺ｸ謌ｻ繧・
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </RequireAdmin >
  );
}
