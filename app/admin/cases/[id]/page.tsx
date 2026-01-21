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

export default function AdminCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null); // データ取得エラー（ブロッキング）
  const [companyName, setCompanyName] = useState<string | null>(null);

  // Action States
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); // フォーム操作エラー（非ブロッキング）

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
        setFetchError(error.message || "データの取得に失敗しました。");
        setLoading(false);
        return;
      }

      if (!data) {
        setFetchError("該当するデータが見つかりません。");
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
        setFormError("ログイン情報を取得できませんでした。再度ログインしてください。");
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
        setFormError(updateError.message || "承認に失敗しました。");
        setIsProcessing(false);
        return;
      }

      // 成功
      setIsProcessing(false);
      setShowApproveModal(false);
      setShowSuccessModal({ type: 'approved' });

    } catch {
      setFormError("予期せぬエラーが発生しました。");
      setIsProcessing(false);
    }
  };

  const executeReject = async () => {
    if (!caseDetail) return;

    if (!rejectReason.trim()) {
      setFormError("却下理由を入力してください。");
      // モーダルは閉じない
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
        setFormError("ログイン情報を取得できませんでした。再度ログインしてください。");
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
        setFormError(updateError.message || "却下に失敗しました。");
        setIsProcessing(false);
        return;
      }

      // 成功
      setIsProcessing(false);
      setShowRejectModal(false);
      setShowSuccessModal({ type: 'rejected' });

    } catch {
      setFormError("予期せぬエラーが発生しました。");
      setIsProcessing(false);
    }
  };

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center pt-12 pb-12">
        <div className="max-w-3xl w-full mx-4 bg-slate-800/80 border border-slate-700 rounded-2xl p-8 shadow-xl relative">

          {loading ? (
            <p className="text-sm text-slate-200 text-center py-10">読み込み中です...</p>
          ) : fetchError ? (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-700 rounded-md px-3 py-2">
              {fetchError}
            </p>
          ) : !caseDetail ? (
            <p className="text-sm text-slate-300">データが見つかりません。</p>
          ) : (
            <>
              <div className="mb-4">
                <Link
                  href="/admin/cases"
                  className="text-sm text-[#00e5ff] hover:text-[#00e5ff] transition-colors inline-block mb-2"
                >
                  一覧へ戻る
                </Link>
                <h1 className="text-xl font-bold text-[#00e5ff]">
                  承認・却下（詳細）
                </h1>
              </div>

              {/* Inline Error for Ops */}
              {formError && !showRejectModal && (
                <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-200 text-xs">
                  ⚠️ {formError}
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                  <h2 className="text-sm font-bold text-[#00e5ff] uppercase tracking-widest mb-4 border-b border-[#00e5ff]/20 pb-2">基本情報</h2>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">氏名：</span>
                      <span className="text-slate-50 font-semibold">{caseDetail.full_name}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">氏名（カナ）：</span>
                      <span className="text-slate-50">{caseDetail.full_name_kana || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">性別：</span>
                      <span className="text-slate-50">{genderLabel(caseDetail.gender)}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">生年月日：</span>
                      <span className="text-slate-50">{caseDetail.birth_date?.replace(/-/g, "/")}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">電話番号（下4桁）：</span>
                      <span className="text-slate-50">{caseDetail.phone_last4 || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">発生日：</span>
                      <span className="text-slate-50">{caseDetail.occurrence_date?.replace(/-/g, "/")}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">登録日：</span>
                      <span className="text-slate-50">
                        {caseDetail.created_at
                          ? new Date(caseDetail.created_at).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">登録元：</span>
                      <span className="text-slate-50">{companyName || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <span className="text-slate-400">ステータス：</span>
                      <span className="text-slate-50 font-bold">{statusLabel(caseDetail.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                  <h2 className="text-sm font-bold text-[#00e5ff] uppercase tracking-widest mb-4 border-b border-[#00e5ff]/20 pb-2">トラブル詳細・理由</h2>
                  <div className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {caseDetail.reason_text}
                  </div>
                </div>

                {/* 証拠ファイルセクション */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                  <h2 className="text-sm font-bold text-[#00e5ff] uppercase tracking-widest mb-4 border-b border-[#00e5ff]/20 pb-2">添付資料</h2>
                  {evidenceFiles.length === 0 ? (
                    <p className="text-sm text-slate-500">証拠ファイルはありません。</p>
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

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(true)}
                  disabled={isProcessing}
                  className="flex-1 bg-[#00e5ff]/80 hover:bg-[#00e5ff] disabled:bg-[#00e5ff]/40 text-black font-bold py-3 rounded-lg text-sm transition-all shadow-lg shadow-[#00e5ff]/20"
                >
                  承認する
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
                  却下する
                </button>
              </div>
            </>
          )}

          {/* === Modals === */}

          {/* Approve Confirmation Modal */}
          {showApproveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-900 border border-[#00e5ff] p-8 rounded-2xl max-w-sm w-full shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                <h3 className="text-xl font-bold text-white mb-4">承認の確認</h3>
                <p className="text-slate-300 mb-8">
                  この申請を承認しますか？<br />
                  <span className="text-xs text-slate-500">承認すると、すべてのユーザーがこのデータを閲覧できるようになります。</span>
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="flex-1 py-2 rounded border border-slate-600 text-slate-400 hover:bg-slate-800"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={executeApprove}
                    disabled={isProcessing}
                    className="flex-1 py-2 rounded bg-[#00e5ff] text-black font-bold hover:bg-[#00e5ff]/80 shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                  >
                    {isProcessing ? "処理中..." : "承認確定"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Input Modal */}
          {showRejectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-900 border border-red-500 p-8 rounded-2xl max-w-md w-full shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <h3 className="text-xl font-bold text-white mb-4">却下の確認</h3>
                <p className="text-slate-300 mb-4">
                  この申請を却下しますか？<br />
                  <span className="text-xs text-slate-500">却下理由を入力してください。申請ユーザーには通知されませんが、記録として残ります。</span>
                </p>

                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-100 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all mb-4"
                  placeholder="例: 情報不足のため、本人確認が取れないため等"
                />
                {formError && (
                  <div className="mb-4 text-xs text-red-400">⚠️ {formError}</div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setFormError(null);
                    }}
                    className="flex-1 py-2 rounded border border-slate-600 text-slate-400 hover:bg-slate-800"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={executeReject}
                    disabled={isProcessing}
                    className="flex-1 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  >
                    {isProcessing ? "処理中..." : "却下確定"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
              <div className={`p-10 rounded-3xl max-w-sm w-full text-center border-t-4 shadow-2xl ${showSuccessModal.type === 'approved' ? 'border-[#00e5ff] shadow-[0_0_50px_rgba(0,229,255,0.2)]' : 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]'}`}>
                <div className="text-6xl mb-4">
                  {showSuccessModal.type === 'approved' ? '✅' : '🚫'}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {showSuccessModal.type === 'approved' ? 'APPROVAL COMPLETE' : 'REJECTION COMPLETE'}
                </h3>
                <p className="text-slate-400 mb-8">
                  {showSuccessModal.type === 'approved' ? '申請が承認されました。' : '申請が却下されました。'}
                </p>
                <button
                  onClick={() => router.push("/admin/cases")}
                  className={`w-full py-3 rounded-lg font-bold text-black ${showSuccessModal.type === 'approved' ? 'bg-[#00e5ff] hover:bg-[#00e5ff]/80' : 'bg-red-500 hover:bg-red-400 text-white'}`}
                >
                  一覧へ戻る
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </RequireAdmin >
  );
}
