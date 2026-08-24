"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAdmin } from "@/components/RequireAdmin";

export default function EditCasePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
    const [status, setStatus] = useState("pending");

    // File states
    type ExistingFile = { path: string; signedUrl: string; name: string };
    const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    useEffect(() => {
        if (!id) return;

        const fetchCase = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("blacklist_cases")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                setErrorMsg("繝・・繧ｿ縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆: " + error.message);
                setLoading(false);
                return;
            }

            if (data) {
                setName(data.full_name);
                setNameKana(data.full_name_kana || "");
                setGender(data.gender || "");
                const [by, bm, bd] = (data.birth_date || "").split("-");
                setBirthYear(by || ""); setBirthMonth(bm || ""); setBirthDay(bd || "");
                setPhoneLast4(data.phone_last4 || "");
                setCity(data.city || "");
                const [oy, om, od] = (data.occurrence_date || "").split("-");
                setOccurrenceYear(oy || ""); setOccurrenceMonth(om || ""); setOccurrenceDay(od || "");
                setReason(data.reason_text);
                setStatus(data.status);

                // Existing files
                if (data.evidence_urls && Array.isArray(data.evidence_urls)) {
                    const loadedFiles: ExistingFile[] = [];
                    for (const path of data.evidence_urls) {
                        const { data: signedData } = await supabase.storage
                            .from('case-evidence')
                            .createSignedUrl(path, 3600);

                        if (signedData) {
                            loadedFiles.push({
                                path,
                                signedUrl: signedData.signedUrl,
                                name: path.split('/').pop() || 'unknown file'
                            });
                        }
                    }
                    setExistingFiles(loadedFiles);
                }
            }
            setLoading(false);
        };

        fetchCase();
    }, [id]);

    // File handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeNewFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingFile = (pathToRemove: string) => {
        if (!confirm("菫晏ｭ俶凾縺ｫ縺薙・繝輔ぃ繧､繝ｫ縺ｯ蜑企勁縺輔ｌ縺ｾ縺吶ゅΜ繧ｹ繝医°繧蛾勁螟悶＠縺ｾ縺吶°・・)) return;
        setExistingFiles((prev) => prev.filter((f) => f.path !== pathToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("繧ｻ繝・す繝ｧ繝ｳ縺悟・繧後∪縺励◆縲ょ・繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・);

            if (nameKana && !/^[繧｡-繝ｶ繝ｼ\s縲]*$/.test(nameKana)) {
                throw new Error("豌丞錐・医き繝奇ｼ峨・蜈ｨ隗偵き繧ｿ繧ｫ繝翫〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
            }

            // 1. Upload new files
            const newUploadedPaths: string[] = [];
            if (selectedFiles.length > 0) {
                for (const file of selectedFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                    const { error: uploadError, data: uploadData } = await supabase.storage
                        .from('case-evidence')
                        .upload(fileName, file);

                    if (uploadError) throw new Error(`繝輔ぃ繧､繝ｫ繧｢繝・・繝ｭ繝ｼ繝牙､ｱ謨・ ${file.name}`);
                    if (uploadData?.path) newUploadedPaths.push(uploadData.path);
                }
            }

            // 2. Combine paths (Existing filtered + New)
            const finalEvidenceUrls = [
                ...existingFiles.map(f => f.path),
                ...newUploadedPaths
            ];

            // 3. Update DB
            const { error } = await supabase
                .from("blacklist_cases")
                .update({
                    full_name: name,
                    full_name_kana: nameKana,
                    gender,
                    birth_date: (birthYear && birthMonth && birthDay)
                        ? `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
                        : null,
                    phone_last4: phoneLast4 || null,
                    city: city || null,
                    occurrence_date: (occurrenceYear && occurrenceMonth && occurrenceDay)
                        ? `${occurrenceYear}-${occurrenceMonth.padStart(2, '0')}-${occurrenceDay.padStart(2, '0')}`
                        : null,
                    reason_text: reason,
                    status: status,
                    evidence_urls: finalEvidenceUrls
                })
                .eq("id", id);

            if (error) throw error;

            router.push("/cases");
            router.refresh();
        } catch (err: any) {
            setErrorMsg("譖ｴ譁ｰ縺ｫ螟ｱ謨励＠縺ｾ縺励◆: " + err.message);
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
                <div className="max-w-3xl w-full">

                    <div className="mb-8 text-center animate-fade-in">
                        <h1 className="text-3xl font-bold text-white mb-2">逋ｻ骭ｲ諠・ｱ縺ｮ邱ｨ髮・/h1>
                        <p className="text-slate-400">逋ｻ骭ｲ繝・・繧ｿ縺ｮ邱ｨ髮・ｼ育ｮ｡逅・・・縺ｿ・・/p>
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
                                            <input type="text" inputMode="numeric" maxLength={4} value={birthYear}
                                                onChange={(e) => { if (/^\d*$/.test(e.target.value)) setBirthYear(e.target.value); }}
                                                className="input-field w-24 text-center" placeholder="0000" />
                                            <span className="text-slate-400">蟷ｴ</span>
                                            <input type="text" inputMode="numeric" maxLength={2} value={birthMonth}
                                                onChange={(e) => { if (/^\d*$/.test(e.target.value)) setBirthMonth(e.target.value); }}
                                                className="input-field w-16 text-center" placeholder="00" />
                                            <span className="text-slate-400">譛・/span>
                                            <input type="text" inputMode="numeric" maxLength={2} value={birthDay}
                                                onChange={(e) => { if (/^\d*$/.test(e.target.value)) setBirthDay(e.target.value); }}
                                                className="input-field w-16 text-center" placeholder="00" />
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
                                            onChange={(e) => setPhoneLast4(e.target.value)}
                                            className="input-field"
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
                                            <input type="text" inputMode="numeric" maxLength={4} value={occurrenceYear}
                                                onChange={(e) => { if (/^\d*$/.test(e.target.value)) setOccurrenceYear(e.target.value); }}
                                                className="input-field w-24 text-center" placeholder="0000" />
                                            <span className="text-slate-400">蟷ｴ</span>
                                            <input type="text" inputMode="numeric" maxLength={2} value={occurrenceMonth}
                                                onChange={(e) => { if (/^\d*$/.test(e.target.value)) setOccurrenceMonth(e.target.value); }}
                                                className="input-field w-16 text-center" placeholder="00" />
                                            <span className="text-slate-400">譛・/span>
                                            <input type="text" inputMode="numeric" maxLength={2} value={occurrenceDay}
                                                onChange={(e) => { if (/^\d*$/.test(e.target.value)) setOccurrenceDay(e.target.value); }}
                                                className="input-field w-16 text-center" placeholder="00" />
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
                                    />
                                </div>

                                {/* FILE UPLOAD SECTION */}
                                <div className="space-y-2 mt-6 border-t border-slate-700/50 pt-6">
                                    <Label>豺ｻ莉倩ｳ・侭・育判蜒上・PDF遲会ｼ・/Label>

                                    {/* Existing Files */}
                                    {existingFiles.length > 0 && (
                                        <div className="mb-4 space-y-2">
                                            <p className="text-xs text-[#00e5ff] font-bold mb-2">逋ｻ骭ｲ貂医∩繝輔ぃ繧､繝ｫ:</p>
                                            {existingFiles.map((file) => (
                                                <div key={file.path} className="flex items-center justify-between bg-slate-800/80 p-3 rounded-lg border border-slate-600">
                                                    <a href={file.signedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-300 hover:underline truncate max-w-[80%] flex items-center gap-2">
                                                        <span>塘</span>
                                                        {file.name}
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingFile(file.path)}
                                                        className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded text-xs transition-colors"
                                                    >
                                                        蜑企勁
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* New File Upload Area */}
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
                                            <p className="text-sm text-slate-400">繝輔ぃ繧､繝ｫ繧偵％縺薙↓霑ｽ蜉</p>
                                            <p className="text-xs text-slate-500 mt-1">・医け繝ｪ繝・け縺ｾ縺溘・繝峨Λ繝・げ・・ラ繝ｭ繝・・・・/p>
                                        </div>
                                    </div>

                                    {/* Selected New Files */}
                                    {selectedFiles.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-xs text-yellow-500 font-bold mb-2">霑ｽ蜉莠亥ｮ壹ヵ繧｡繧､繝ｫ:</p>
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-sm">
                                                    <span className="truncate max-w-[80%] text-slate-300">{file.name} ({(file.size / 1024).toFixed(0)}KB)</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewFile(index)}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded transition-colors"
                                                    >
                                                        笨・
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 mt-4">
                                    <Label>繧ｹ繝・・繧ｿ繧ｹ</Label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="input-field appearance-none bg-slate-800"
                                    >
                                        <option value="pending">蟇ｩ譟ｻ荳ｭ (Pending)</option>
                                        <option value="approved">謇ｿ隱肴ｸ医∩ (Approved)</option>
                                        <option value="rejected">蜊ｴ荳・(Rejected)</option>
                                    </select>
                                </div>
                            </Section>

                            {errorMsg && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                                    笞・・{errorMsg}
                                </div>
                            )}

                            <div className="flex gap-4 pt-4 border-t border-slate-700/50">
                                <Link href="/cases" className="btn-secondary flex-1 text-center py-3">
                                    繧ｭ繝｣繝ｳ繧ｻ繝ｫ
                                </Link>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary flex-1 py-3 text-base shadow-lg"
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
