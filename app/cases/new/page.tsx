"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAuth } from "@/components/RequireAuth";
import { recognizeText } from "@/lib/ocr";

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [nameKana, setNameKana] = useState("");
  const [gender, setGender] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [city, setCity] = useState("");
  const [occurrenceYear, setOccurrenceYear] = useState("");
  const [occurrenceMonth, setOccurrenceMonth] = useState("");
  const [occurrenceDay, setOccurrenceDay] = useState("");
  const [reason, setReason] = useState("");

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // File upload handling
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB default limit for Supabase

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];

      newFiles.forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`繝輔ぃ繧､繝ｫ縲・{file.name}縲阪・繧ｵ繧､繧ｺ縺悟､ｧ縺阪☆縺弱∪縺・(譛螟ｧ50MB)`);
        } else {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOCR = async (file: File) => {
    if (!confirm("逕ｻ蜒上ｒ隗｣譫舌＠縺ｦ繝・く繧ｹ繝医ｒ謚ｽ蜃ｺ縺励∪縺吶°・歃\n謚ｽ蜃ｺ縺輔ｌ縺溘ユ繧ｭ繧ｹ繝医・縲檎匳骭ｲ逅・罰/隧ｳ邏ｰ縲阪↓霑ｽ險倥＆繧後∪縺吶・)) return;

    setIsAnalyzing(true);
    try {
      const text = await recognizeText(file);
      if (text) {
        // 菴吝・縺ｪ遨ｺ逋ｽ繧帝勁蜴ｻ縺励※霑ｽ險・
        const cleanedText = text.replace(/\\s+/g, ' ').trim();
        setReason((prev) => prev + (prev ? "\\n\\n" : "") + "[逕ｻ蜒剰ｧ｣譫千ｵ先棡]\\n" + cleanedText);
        alert("繝・く繧ｹ繝医ｒ謚ｽ蜃ｺ縺励∪縺励◆・・);
      } else {
        alert("繝・く繧ｹ繝医′隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆縲・);
      }
    } catch (error) {
      console.error(error);
      alert("隗｣譫舌↓螟ｱ謨励＠縺ｾ縺励◆縲・);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("繝ｭ繧ｰ繧､繝ｳ繧ｻ繝・す繝ｧ繝ｳ縺悟・繧後∪縺励◆縲ょ・繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・);
      }

      // 繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ莨夂､ｾID縺ｨ莨夂､ｾ蜷阪ｒ蜿門ｾ・
      const { data: appUser } = await supabase
        .from("app_users")
        .select("company_id, companies(name)")
        .eq("id", user.id)
        .single();

      if (!appUser?.company_id) {
        throw new Error("謇螻樔ｼ夂､ｾ諠・ｱ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・);
      }

      if (nameKana && !/^[繧｡-繝ｶ繝ｼ\s縲]*$/.test(nameKana)) {
        throw new Error("豌丞錐・医き繝奇ｼ峨・蜈ｨ隗偵き繧ｿ繧ｫ繝翫〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
      }

      // 繝輔ぃ繧､繝ｫ繧｢繝・・繝ｭ繝ｼ繝牙・逅・
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
            throw new Error(`繝輔ぃ繧､繝ｫ縺ｮ繧｢繝・・繝ｭ繝ｼ繝峨↓螟ｱ謨励＠縺ｾ縺励◆ (${file.name}): ${uploadError.message}`);
          }

          if (uploadData?.path) {
            uploadedUrls.push(uploadData.path);
          }
        }
      }


      const { error } = await supabase.from("blacklist_cases").insert([
        {
          registered_company_id: appUser.company_id,
          full_name: name,
          full_name_kana: nameKana,
          gender: gender || null, // "male", "female", "other" or null
          birth_date: (birthYear && birthMonth && birthDay)
            ? `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
            : null,
          phone_last4: phoneLast4 || null,
          city: city || null,
          occurrence_date: (occurrenceYear && occurrenceMonth && occurrenceDay)
            ? `${occurrenceYear}-${occurrenceMonth.padStart(2, '0')}-${occurrenceDay.padStart(2, '0')}`
            : null,
          reason_text: reason,
          evidence_urls: uploadedUrls, // 繧｢繝・・繝ｭ繝ｼ繝峨＠縺溘ヵ繧｡繧､繝ｫ縺ｮ繝代せ驟榊・
          status: "pending", // 蛻晄悄迥ｶ諷九・譛ｪ謇ｿ隱・
          registered_by_user_id: user.id,
        },
      ]);

      if (error) throw error;

      // LINE騾夂衍API縺ｮ蜻ｼ縺ｳ蜃ｺ縺暦ｼ亥､ｱ謨励＠縺ｦ繧ら判髱｢驕ｷ遘ｻ縺ｯ豁｢繧√↑縺・ｼ・
      try {
        await fetch('/api/notify/line', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_case',
            data: {
              targetName: name,
              company: (appUser?.companies as any)?.name || "荳肴・"
            }
          })
        });
      } catch (notifyErr) {
        console.error("Notify Error:", notifyErr);
      }

      setLoading(false);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("逋ｻ骭ｲ蜃ｦ逅・ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆: " + (err.message || "隧ｳ邏ｰ荳肴・"));
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

            <h2 className="text-2xl font-bold text-white mb-6 tracking-wider">
              逋ｻ骭ｲ逕ｳ隲句ｮ御ｺ・
            </h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              逋ｻ骭ｲ逕ｳ隲九′螳御ｺ・＠縺ｾ縺励◆縲・br />
              邂｡逅・・・謇ｿ隱阪ｒ縺雁ｾ・■縺上□縺輔＞縲・
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setName("");
                  setNameKana("");
                  setGender("");
                  setBirthYear("");
                  setBirthMonth("");
                  setBirthDay("");
                  setPhoneLast4("");
                  setCity("");
                  setOccurrenceYear("");
                  setOccurrenceMonth("");
                  setOccurrenceDay("");
                  setReason("");
                  setSelectedFiles([]);
                  window.scrollTo(0, 0);
                }}
                className="btn-secondary py-3 px-6"
              >
                邯壹￠縺ｦ逋ｻ骭ｲ縺吶ｋ
              </button>
              <Link href="/dashboard" className="btn-primary py-3 px-6 shadow-lg">
                繝繝・す繝･繝懊・繝峨∈謌ｻ繧・
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
            <h1 className="text-3xl font-bold text-white mb-2">譁ｰ隕冗匳骭ｲ逕ｳ隲・/h1>
            <p className="text-slate-400">譁ｰ縺励＞繝・・繧ｿ繧堤匳骭ｲ縺励∪縺・/p>
          </div>

          <div className="glass-panel rounded-2xl p-6 md:p-10 animate-fade-in delay-100">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* 蝓ｺ譛ｬ諠・ｱ */}
              <Section title="蝓ｺ譛ｬ諠・ｱ">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label required>豌丞錐</Label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="螻ｱ逕ｰ 螟ｪ驛・
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>豌丞錐・医き繝奇ｼ・/Label>
                    <input
                      type="text"
                      value={nameKana}
                      onChange={(e) => setNameKana(e.target.value)}
                      className="input-field"
                      placeholder="繝､繝槭ム 繧ｿ繝ｭ繧ｦ"
                      pattern="^[繧｡-繝ｶ繝ｼ\s縲]*$"
                      title="蜈ｨ隗偵き繧ｿ繧ｫ繝翫〒蜈･蜉帙＠縺ｦ縺上□縺輔＞"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>逕溷ｹｴ譛域律</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={birthYear}
                        onChange={(e) => { if (/^\d*$/.test(e.target.value)) setBirthYear(e.target.value); }}
                        className="input-field w-24 text-center"
                        placeholder="0000"
                      />
                      <span className="text-slate-400">蟷ｴ</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={birthMonth}
                        onChange={(e) => { if (/^\d*$/.test(e.target.value)) setBirthMonth(e.target.value); }}
                        className="input-field w-16 text-center"
                        placeholder="00"
                      />
                      <span className="text-slate-400">譛・/span>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={birthDay}
                        onChange={(e) => { if (/^\d*$/.test(e.target.value)) setBirthDay(e.target.value); }}
                        className="input-field w-16 text-center"
                        placeholder="00"
                      />
                      <span className="text-slate-400">譌･</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>諤ｧ蛻･</Label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="input-field appearance-none"
                    >
                      <option value="">驕ｸ謚槭＠縺ｦ縺上□縺輔＞</option>
                      <option value="male">逕ｷ諤ｧ</option>
                      <option value="female">螂ｳ諤ｧ</option>
                      <option value="other">縺昴・莉・/option>
                    </select>
                  </div>
                </div>
              </Section>

              {/* 隧ｳ邏ｰ諠・ｱ */}
              <Section title="繝医Λ繝悶Ν諠・ｱ">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label>謳ｺ蟶ｯ髮ｻ隧ｱ逡ｪ蜿ｷ・井ｸ・譯・ｼ・/Label>
                    <input
                      type="text"
                      maxLength={4}
                      value={phoneLast4}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          setPhoneLast4(val);
                        }
                      }}
                      className="input-field"
                      placeholder="1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>菴乗園・亥ｸょ玄逕ｺ譚托ｼ・/Label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-field"
                      placeholder="萓具ｼ壽擲莠ｬ驛ｽ貂玖ｰｷ蛹ｺ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>逋ｺ逕滓律</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={occurrenceYear}
                        onChange={(e) => { if (/^\d*$/.test(e.target.value)) setOccurrenceYear(e.target.value); }}
                        className="input-field w-24 text-center"
                        placeholder="0000"
                      />
                      <span className="text-slate-400">蟷ｴ</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={occurrenceMonth}
                        onChange={(e) => { if (/^\d*$/.test(e.target.value)) setOccurrenceMonth(e.target.value); }}
                        className="input-field w-16 text-center"
                        placeholder="00"
                      />
                      <span className="text-slate-400">譛・/span>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={occurrenceDay}
                        onChange={(e) => { if (/^\d*$/.test(e.target.value)) setOccurrenceDay(e.target.value); }}
                        className="input-field w-16 text-center"
                        placeholder="00"
                      />
                      <span className="text-slate-400">譌･</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label required>逋ｻ骭ｲ逅・罰 / 隧ｳ邏ｰ</Label>
                  <textarea
                    required
                    rows={5}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input-field min-h-[120px]"
                    placeholder="蜈ｷ菴鍋噪縺ｪ繝医Λ繝悶Ν蜀・ｮｹ繧・ｳｨ諢冗せ繧定ｨ倩ｼ峨＠縺ｦ縺上□縺輔＞..."
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <Label>豺ｻ莉倩ｳ・侭・育判蜒上・PDF遲会ｼ・/Label>
                  <div className="border border-dashed border-slate-600 rounded-lg p-6 text-center hover:bg-slate-800/30 transition-colors relative">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*,application/pdf"
                    />
                    <div className="pointer-events-none">
                      <span className="text-2xl block mb-2">刀</span>
                      <p className="text-sm text-slate-400">繧ｯ繝ｪ繝・け縺ｾ縺溘・繝峨Λ繝・げ・・ラ繝ｭ繝・・縺ｧ繝輔ぃ繧､繝ｫ繧定ｿｽ蜉</p>
                      <p className="text-xs text-slate-500 mt-1">・育判蜒上￣DF縺ｪ縺ｩ隍・焚蜿ｯ・・/p>
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
                                {isAnalyzing ? "隗｣譫蝉ｸｭ..." : "譁・ｭ苓ｪ崎ｭ・OCR)"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded transition-colors"
                            >
                              笨・
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
                  笞・・{errorMsg}
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-slate-700/50">
                <Link href="/dashboard" className="btn-secondary flex-1 text-center py-3">
                  繧ｭ繝｣繝ｳ繧ｻ繝ｫ
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 py-3 text-base shadow-lg"
                >
                  {loading ? "騾∽ｿ｡荳ｭ..." : "逋ｻ骭ｲ繧堤筏隲九☆繧・}
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
          蠢・・
        </span>
      ) : (
        <span className="text-slate-500 text-[10px] border border-slate-700 bg-slate-800 px-1.5 py-0.5 rounded">
          莉ｻ諢・
        </span>
      )}
    </label>
  )
}
