"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAuth } from "@/components/RequireAuth";

type BlacklistCase = {
  id: string;
  full_name: string;
  full_name_kana: string | null;
  gender: string | null;
  birth_date: string | null;
  phone_last4: string | null;
  occurrence_date: string | null;
  reason_text: string;
  status: string;
};

export default function SearchPage() {
  const [nameQuery, setNameQuery] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [searchMonth, setSearchMonth] = useState("");
  const [searchDay, setSearchDay] = useState("");
  const [results, setResults] = useState<BlacklistCase[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);

  // Check admin role and get company_id on mount
  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.app_metadata?.role === "admin") {
        setIsAdmin(true);
      }
      if (session?.user) {
        const { data: appUser } = await supabase
          .from("app_users")
          .select("company_id")
          .eq("id", session.user.id)
          .maybeSingle();
        if (appUser?.company_id) {
          setUserCompanyId(appUser.company_id);
        }
      }
    };
    checkRole();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(false);
    setResults([]);
    setErrorMsg(null);

    try {
      const dateQuery = (searchYear && searchMonth && searchDay)
        ? `${searchYear}-${searchMonth.padStart(2, '0')}-${searchDay.padStart(2, '0')}`
        : "";
      if (!nameQuery && !dateQuery) {
        throw new Error("讀懃ｴ｢譚｡莉ｶ繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・);
      }

      // 繧ｯ繝ｩ繧､繧｢繝ｳ繝医し繧､繝峨ヵ繧｣繝ｫ繧ｿ繝ｪ繝ｳ繧ｰ
      let query = supabase
        .from("blacklist_cases")
        .select("*");

      // 邂｡逅・・〒縺ｪ縺・ｴ蜷医・閾ｪ遉ｾ繝・・繧ｿ縺ｮ縺ｿ・区価隱肴ｸ医∩縺ｮ縺ｿ・亥倶ｺｺ諠・ｱ菫晁ｭｷ豕募ｯｾ蠢懶ｼ・
      if (!isAdmin) {
        query = query.eq("status", "approved");
        if (userCompanyId) {
          query = query.eq("registered_company_id", userCompanyId);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new Error("繝・・繧ｿ縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆: " + error.message);
      }

      const filtered = (data || []).filter((item) => {
        let matchName = true;
        let matchDate = true;

        if (nameQuery) {
          const q = nameQuery.replace(/\s+/g, "").toLowerCase();
          const name = (item.full_name || "").replace(/\s+/g, "").toLowerCase();
          const kana = (item.full_name_kana || "").replace(/\s+/g, "").toLowerCase();
          matchName = name.includes(q) || kana.includes(q);
        }

        if (dateQuery) {
          matchDate = item.birth_date === dateQuery;
        }

        return matchName && matchDate;
      });

      // 逋ｻ骭ｲ譌･縺ｧ繧ｽ繝ｼ繝・(髯埼・
      filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

      setResults(filtered);
      setHasSearched(true);

      // 繧｢繧ｯ繧ｻ繧ｹ繝ｭ繧ｰ縺ｮ菫晏ｭ・
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const logQuery = [nameQuery, dateQuery].filter(Boolean).join(", ");
          await fetch("/api/audit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              action_type: "SEARCH",
              target_id: logQuery
            })
          });
        }
      } catch (logErr) {
        console.error("Failed to save audit log:", logErr);
      }

    } catch (err: any) {
      setErrorMsg(err.message || "莠域悄縺帙〓繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return { label: "逋ｻ骭ｲ貂医∩", className: "bg-red-500/10 text-red-400 border-red-500/20", borderLeft: "border-l-red-500" };
      case "pending":
        return { label: "蟇ｩ譟ｻ荳ｭ", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", borderLeft: "border-l-yellow-500" };
      case "rejected":
        return { label: "蜊ｴ荳・, className: "bg-slate-500/10 text-slate-400 border-slate-500/20", borderLeft: "border-l-slate-500" };
      default:
        return { label: status, className: "bg-slate-500/10 text-slate-400 border-slate-500/20", borderLeft: "border-l-slate-500" };
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
        <div className="max-w-4xl w-full relative z-10">

          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">讀懃ｴ｢</h1>
              <p className="text-slate-300 font-medium">逋ｻ骭ｲ繝・・繧ｿ縺ｮ讀懃ｴ｢繝ｻ辣ｧ莨壹ｒ陦後＞縺ｾ縺・/p>
            </div>
            <Link href="/dashboard" className="btn-secondary text-xs backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10">
              謌ｻ繧・
            </Link>
          </div>

          <div className="glass-panel rounded-3xl p-8 md:p-10 mb-8 animate-fade-in delay-100 shadow-2xl border border-white/10">
            <form onSubmit={handleSearch} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">

                {/* 豌丞錐讀懃ｴ｢ */}
                <div className="input-group group space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest transition-colors duration-300">
                      豌丞錐 / 繧ｫ繝・
                    </label>
                    <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      莉ｻ諢・
                    </span>
                  </div>
                  <input
                    type="text"
                    value={nameQuery}
                    onChange={(e) => setNameQuery(e.target.value)}
                    className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#00e5ff]/50 focus:bg-slate-900/60 focus:ring-4 focus:ring-[#00e5ff]/10 transition-all duration-300"
                    placeholder="萓・ 螻ｱ逕ｰ 螟ｪ驛・
                  />
                </div>

                {/* 逕溷ｹｴ譛域律讀懃ｴ｢ */}
                <div className="input-group group space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest transition-colors duration-300">
                      逕溷ｹｴ譛域律
                    </label>
                    <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      莉ｻ諢・
                    </span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={searchYear}
                    onChange={(e) => { if (/^\d*$/.test(e.target.value)) setSearchYear(e.target.value); }}
                    className="w-20 bg-slate-900/40 border border-slate-700/50 rounded-xl px-3 py-3.5 text-slate-100 focus:outline-none focus:border-[#00e5ff]/50 focus:ring-4 focus:ring-[#00e5ff]/10 transition-all duration-300 text-center"
                    placeholder="0000"
                  />
                  <span className="text-slate-400">蟷ｴ</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={searchMonth}
                    onChange={(e) => { if (/^\d*$/.test(e.target.value)) setSearchMonth(e.target.value); }}
                    className="w-14 bg-slate-900/40 border border-slate-700/50 rounded-xl px-3 py-3.5 text-slate-100 focus:outline-none focus:border-[#00e5ff]/50 focus:ring-4 focus:ring-[#00e5ff]/10 transition-all duration-300 text-center"
                    placeholder="00"
                  />
                  <span className="text-slate-400">譛・/span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={searchDay}
                    onChange={(e) => { if (/^\d*$/.test(e.target.value)) setSearchDay(e.target.value); }}
                    className="w-14 bg-slate-900/40 border border-slate-700/50 rounded-xl px-3 py-3.5 text-slate-100 focus:outline-none focus:border-[#00e5ff]/50 focus:ring-4 focus:ring-[#00e5ff]/10 transition-all duration-300 text-center"
                    placeholder="00"
                  />
                  <span className="text-slate-400">譌･</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-500">
                  窶ｻ豌丞錐縺ｾ縺溘・逕溷ｹｴ譛域律縺ｮ<span className="text-[#00e5ff] font-bold">縺ｩ縺｡繧峨°荳譁ｹ縺ｯ蠢・・/span>縺ｧ縺・
                </p>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary min-w-[160px] shadow-lg py-3 rounded-xl font-bold tracking-wide"
                >
                  {isLoading ?
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      讀懃ｴ｢荳ｭ...
                    </span>
                    : "讀懃ｴ｢螳溯｡・
                  }
                </button>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3 animate-fade-in">
                  <span className="text-lg">笞・・/span>
                  <span className="pt-0.5">{errorMsg}</span>
                </div>
              )}
            </form>
          </div>

          {hasSearched && (
            <div className="animate-fade-in delay-200">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                讀懃ｴ｢邨先棡
                <span className="text-xs font-bold text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/20 px-2.5 py-0.5 rounded-full">
                  {results.length} 莉ｶ
                </span>
              </h2>

              {results.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-3xl border-white/5 bg-slate-900/30">
                  <div className="text-4xl mb-4 opacity-50">剥</div>
                  <p className="text-slate-400 font-medium">隧ｲ蠖薙☆繧九ョ繝ｼ繧ｿ縺ｯ隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆縲・/p>
                  <p className="text-slate-500 text-sm mt-2">譚｡莉ｶ繧貞､画峩縺励※蜀榊ｺｦ讀懃ｴ｢縺励※縺上□縺輔＞縲・/p>
                </div>
              ) : (
                <div className="grid gap-5">
                  {results.map((item) => {
                    const badge = getStatusBadge(item.status);
                    return (
                      <div
                        key={item.id}
                        className={`glass-panel p-6 rounded-2xl border-l-4 flex flex-col md:flex-row justify-between gap-6 card-hover group transition-all ${badge.borderLeft}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white group-hover:text-[#00e5ff] transition-colors">
                                {item.full_name}
                              </h3>
                              <p className="text-sm text-slate-500 font-medium">
                                {item.full_name_kana}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-widest ${badge.className}`}>
                                {badge.label}
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 rounded-xl p-4 border border-white/5">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">逋ｻ骭ｲ逅・罰</h4>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium line-clamp-3">
                              {item.reason_text}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between items-end min-w-[140px] text-right">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">逕溷ｹｴ譛域律</p>
                            <p className="text-sm text-slate-200 font-mono font-bold">{item.birth_date}</p>
                          </div>

                          <div className="space-y-1 mt-4">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">逋ｺ逕滓律</p>
                            <p className="text-sm text-red-300 font-mono font-medium">{item.occurrence_date}</p>
                          </div>

                          <Link
                            href={`/cases/${item.id}`} // 隧ｳ邏ｰ繝壹・繧ｸ縺後〒縺阪◆繧蛾｣帙・諠ｳ螳夲ｼ医↑縺代ｌ縺ｰ#・・
                            className="mt-4 text-xs text-[#00e5ff] hover:text-[#00e5ff] font-bold hover:underline decoration-[#00e5ff]/30 underline-offset-4 transition-all"
                          >
                            隧ｳ邏ｰ繧定ｦ九ｋ
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
