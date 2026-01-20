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
  const [dateQuery, setDateQuery] = useState("");
  const [results, setResults] = useState<BlacklistCase[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin role on mount
  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.app_metadata?.role === "admin") {
        setIsAdmin(true);
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
      if (!nameQuery && !dateQuery) {
        throw new Error("検索条件を入力してください。");
      }

      // クライアントサイドフィルタリング
      let query = supabase
        .from("blacklist_cases")
        .select("*");

      // 管理者でない場合は承認済みのみフィルター
      if (!isAdmin) {
        query = query.eq("status", "approved");
      }

      const { data, error } = await query;

      if (error) {
        throw new Error("データの取得に失敗しました: " + error.message);
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

      setResults(filtered);
      setHasSearched(true);
    } catch (err: any) {
      setErrorMsg(err.message || "予期せぬエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return { label: "登録済み", className: "bg-red-500/10 text-red-400 border-red-500/20", borderLeft: "border-l-red-500" };
      case "pending":
        return { label: "審査中", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", borderLeft: "border-l-yellow-500" };
      case "rejected":
        return { label: "却下", className: "bg-slate-500/10 text-slate-400 border-slate-500/20", borderLeft: "border-l-slate-500" };
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
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">検索</h1>
              <p className="text-slate-300 font-medium">要注意人物の検索・照会</p>
            </div>
            <Link href="/dashboard" className="btn-secondary text-xs backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10">
              戻る
            </Link>
          </div>

          <div className="glass-panel rounded-3xl p-8 md:p-10 mb-8 animate-fade-in delay-100 shadow-2xl border border-white/10">
            <form onSubmit={handleSearch} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">

                {/* 氏名検索 */}
                <div className="input-group group space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest transition-colors duration-300">
                      氏名 / カナ
                    </label>
                    <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      任意
                    </span>
                  </div>
                  <input
                    type="text"
                    value={nameQuery}
                    onChange={(e) => setNameQuery(e.target.value)}
                    className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900/60 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300"
                    placeholder="例: 山田 太郎"
                  />
                </div>

                {/* 生年月日検索 */}
                <div className="input-group group space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest transition-colors duration-300">
                      生年月日
                    </label>
                    <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      任意
                    </span>
                  </div>
                  <input
                    type="date"
                    value={dateQuery}
                    onChange={(e) => setDateQuery(e.target.value)}
                    className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900/60 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-500">
                  ※氏名または生年月日の<span className="text-emerald-400 font-bold">どちらか一方は必須</span>です
                </p>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary min-w-[160px] shadow-lg shadow-emerald-500/20 py-3 rounded-xl font-bold tracking-wide"
                >
                  {isLoading ?
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      検索中...
                    </span>
                    : "検索実行"
                  }
                </button>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3 animate-fade-in">
                  <span className="text-lg">⚠️</span>
                  <span className="pt-0.5">{errorMsg}</span>
                </div>
              )}
            </form>
          </div>

          {hasSearched && (
            <div className="animate-fade-in delay-200">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                検索結果
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  {results.length} 件
                </span>
              </h2>

              {results.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-3xl border-white/5 bg-slate-900/30">
                  <div className="text-4xl mb-4 opacity-50">🔍</div>
                  <p className="text-slate-400 font-medium">該当するデータは見つかりませんでした。</p>
                  <p className="text-slate-500 text-sm mt-2">条件を変更して再度検索してください。</p>
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
                            <div>
                              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                {item.full_name}
                              </h3>
                              <p className="text-sm text-slate-500 font-medium">
                                {item.full_name_kana}
                              </p>
                            </div>
                            <span className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-widest mt-1 ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>

                          <div className="bg-slate-900/40 rounded-xl p-4 border border-white/5">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">登録理由</h4>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                              {item.reason_text}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between items-end min-w-[140px] text-right">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">生年月日</p>
                            <p className="text-sm text-slate-200 font-mono font-bold">{item.birth_date}</p>
                          </div>

                          <div className="space-y-1 mt-4">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">発生日</p>
                            <p className="text-sm text-red-300 font-mono font-medium">{item.occurrence_date}</p>
                          </div>

                          <Link
                            href={`/cases/${item.id}`} // 詳細ページができたら飛ぶ想定（なければ#）
                            className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 font-bold hover:underline decoration-emerald-500/30 underline-offset-4 transition-all"
                          >
                            詳細を見る
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
