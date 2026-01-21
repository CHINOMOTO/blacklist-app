"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAuth } from "@/components/RequireAuth";
import { recognizeText } from "@/lib/ocr";
import { calculateCombatPower } from "@/lib/combatPower";

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ... (keep handleFileChange/removeFile/handleOCR) ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("ログインセッションが切れました。再ログインしてください。");
      }

      // ユーザーの会社IDを取得
      const { data: appUser } = await supabase
        .from("app_users")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!appUser?.company_id) {
        throw new Error("所属会社情報が見つかりません。");
      }

      // ファイルアップロード処理
      const uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('case-evidence')
            .upload(fileName, file);

          if (uploadError) {
            console.error("Upload failed:", uploadError);
            throw new Error(`ファイルのアップロードに失敗しました (${file.name}): ${uploadError.message}`);
          }

          if (uploadData?.path) {
            uploadedUrls.push(uploadData.path);
          }
        }
      }

      // 戦闘力(リスクスコア)計算
      const riskScore = calculateCombatPower(reason);

      const { error } = await supabase.from("blacklist_cases").insert([
        {
          registered_company_id: appUser.company_id,
          full_name: name,
          full_name_kana: nameKana,
          gender: gender || null, // "male", "female", "other" or null
          birth_date: birthDate || null,
          phone_last4: phoneLast4 || null,
          occurrence_date: occurrenceDate || null,
          reason_text: reason,
          evidence_urls: uploadedUrls, // アップロードしたファイルのパス配列
          status: "pending", // 初期状態は未承認
          registered_by_user_id: user.id,
          risk_score: riskScore, // 戦闘力
        },
      ]);

      if (error) throw error;

      setLoading(false);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("登録処理中にエラーが発生しました: " + (err.message || "詳細不明"));
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <RequireAuth>
        <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center">
          <div className="max-w-xl w-full text-center glass-panel p-10 rounded-3xl animate-fade-in border-t-4 border-t-[#00e5ff] relative overflow-hidden">

            {/* Background Effect */}
            <div className="absolute inset-0 bg-[#00e5ff]/5 pointer-events-none"></div>

            <div className="text-6xl mb-6 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">
              🚀
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-wider">
              TRANSMISSION COMPLETE
            </h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              登録申請が完了しました。<br />
              管理者の承認をお待ちください。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setName("");
                  setNameKana("");
                  setGender("");
                  setBirthDate("");
                  setPhoneLast4("");
                  setOccurrenceDate("");
                  setReason("");
                  setSelectedFiles([]);
                  window.scrollTo(0, 0);
                }}
                className="btn-secondary py-3 px-6"
              >
                続けて登録する
              </button>
              <Link href="/dashboard" className="btn-primary py-3 px-6 shadow-lg shadow-[#00e5ff]/20">
                ダッシュボードへ戻る
              </Link>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
        <div className="max-w-3xl w-full">

          <div className="mb-8 text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">新規登録申請</h1>
            <p className="text-slate-400">New Registration</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 md:p-10 animate-fade-in delay-100">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* 基本情報 */}
              <Section title="基本情報">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label required>氏名</Label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="山田 太郎"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>氏名（カナ）</Label>
                    <input
                      type="text"
                      value={nameKana}
                      onChange={(e) => setNameKana(e.target.value)}
                      className="input-field"
                      placeholder="ヤマダ タロウ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>生年月日</Label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>性別</Label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="input-field appearance-none"
                    >
                      <option value="">選択してください</option>
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                      <option value="other">その他</option>
                    </select>
                  </div>
                </div>
              </Section>

              {/* 詳細情報 */}
              <Section title="トラブル情報">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label>携帯電話番号（下4桁）</Label>
                    <input
                      type="text"
                      maxLength={4}
                      value={phoneLast4}
                      onChange={(e) => setPhoneLast4(e.target.value)}
                      className="input-field"
                      placeholder="1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>発生日</Label>
                    <input
                      type="date"
                      value={occurrenceDate}
                      onChange={(e) => setOccurrenceDate(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label required>登録理由 / 詳細</Label>
                  <textarea
                    required
                    rows={5}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input-field min-h-[120px]"
                    placeholder="具体的なトラブル内容や注意点を記載してください..."
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <Label>添付資料（画像・PDF等）</Label>
                  <div className="border border-dashed border-slate-600 rounded-lg p-6 text-center hover:bg-slate-800/30 transition-colors relative">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*,application/pdf"
                    />
                    <div className="pointer-events-none">
                      <span className="text-2xl block mb-2">📁</span>
                      <p className="text-sm text-slate-400">クリックまたはドラッグ＆ドロップでファイルを追加</p>
                      <p className="text-xs text-slate-500 mt-1">（画像、PDFなど複数可）</p>
                    </div>
                  </div>

                  {selectedFiles.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-sm">
                          <span className="truncate max-w-[60%] text-slate-300">{file.name} ({(file.size / 1024).toFixed(0)}KB)</span>
                          <div className="flex items-center gap-3">
                            {file.type.startsWith('image/') && (
                              <button
                                type="button"
                                onClick={() => handleOCR(file)}
                                disabled={isAnalyzing}
                                className="text-xs text-[#00e5ff] hover:text-[#00e5ff] border border-[#00e5ff]/30 bg-[#00e5ff]/10 px-2 py-1 rounded transition-colors"
                              >
                                {isAnalyzing ? "解析中..." : "文字認識(OCR)"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Section>

              {errorMsg && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-slate-700/50">
                <Link href="/dashboard" className="btn-secondary flex-1 text-center py-3">
                  キャンセル
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 py-3 text-base shadow-lg shadow-[#00e5ff]/20"
                >
                  {loading ? "送信中..." : "登録を申請する"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-[#00e5ff] uppercase tracking-widest border-b border-[#00e5ff]/20 pb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Label({ children, required }: { children: React.ReactNode, required?: boolean }) {
  return (
    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
      {children}
      {required ? (
        <span className="text-[#00e5ff] text-[10px] border border-[#00e5ff]/30 bg-[#00e5ff]/10 px-1.5 py-0.5 rounded">
          必須
        </span>
      ) : (
        <span className="text-slate-500 text-[10px] border border-slate-700 bg-slate-800 px-1.5 py-0.5 rounded">
          任意
        </span>
      )}
    </label>
  )
}
