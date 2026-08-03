"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { RequireAuth } from "@/components/RequireAuth";

type BlacklistCase = {
  id: string;
  full_name: string;
  birth_date: string | null;
  reason_text: string;
  status: string;
  created_at: string;
};

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<BlacklistCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 1. Check Admin Role
      const { data: { user } } = await supabase.auth.getUser();
      const isUserAdmin = user?.app_metadata?.role === 'admin';

      if (user) {
        setIsAdmin(isUserAdmin);
      }

      // 2. Fetch Cases
      try {
        let query = supabase
          .from("blacklist_cases")
          .select("id, full_name, birth_date, reason_text, status, created_at, registered_company_id")
          .order("created_at", { ascending: false });

        // 一般ユーザーは自社登録データのみ表示（個人情報保護法対応）
        if (!isUserAdmin && user) {
          const { data: appUser } = await supabase
            .from("app_users")
            .select("company_id")
            .eq("id", user.id)
            .maybeSingle();

          if (appUser?.company_id) {
            query = query.eq("registered_company_id", appUser.company_id);
          }
          query = query.eq("status", "approved");
        }

        const { data, error } = await query;

        if (error) throw error;
        setCases(data || []);
      } catch (err: any) {
        setErrorMSG("データ取得に失敗しました: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("本当にこのデータを削除しますか？この操作は取り消せません。")) return;

    try {
      const { error } = await supabase
        .from("blacklist_cases")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCases(prev => prev.filter(c => c.id !== id));
      alert("削除しました。");
    } catch (err: any) {
      alert("削除に失敗しました: " + err.message);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
        <div className="max-w-6xl w-full relative z-10">

          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">登録データ一覧</h1>
              <p className="text-slate-300 font-medium">Case List</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="btn-secondary text-xs backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10 px-4 py-2.5">
                戻る
              </Link>
              <Link href="/cases/new" className="btn-primary flex items-center gap-2 px-5 py-2.5 shadow-lg shadow-[#00e5ff]/20 hover:shadow-[#00e5ff]/40 hover:-translate-y-0.5 transition-all rounded-xl font-bold text-sm">
                <span>+</span> 新規登録
              </Link>
            </div>
          </div>

          {errorMSG && (
            <div className="p-4 mb-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3 animate-fade-in shadow-lg">
              <span className="text-lg">⚠️</span>
              <span className="pt-0.5">{errorMSG}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-24">
              <div className="relative">
                <div className="animate-spin h-12 w-12 border-4 border-[#00e5ff]/20 rounded-full border-t-[#00e5ff]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-4 w-4 bg-[#00e5ff]/20 rounded-full blur-md"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl overflow-hidden animate-fade-in delay-100 shadow-2xl border border-[#00e5ff]/30 shadow-[#00e5ff]/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/60 text-xs uppercase font-bold text-slate-400">
                    <tr>
                      <th className="px-6 py-5 tracking-widest">氏名</th>
                      <th className="px-6 py-5 tracking-widest">生年月日</th>
                      <th className="px-6 py-5 tracking-widest">登録理由</th>
                      <th className="px-6 py-5 tracking-widest">ステータス</th>
                      <th className="px-6 py-5 tracking-widest text-right">登録日</th>
                      {isAdmin && <th className="px-6 py-5 tracking-widest text-right">操作</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {cases.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-6 py-4">
                          <Link
                            href={`/cases/${c.id}`}
                            className="text-white font-bold text-lg hover:text-[#00e5ff] transition-colors inline-block truncate max-w-[200px]"
                          >
                            {c.full_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-400">
                          {c.birth_date || <span className="text-slate-600">-</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="truncate max-w-xs text-slate-300 font-medium" title={c.reason_text}>
                            {c.reason_text}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 text-right font-mono">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link
                                href={`/cases/${c.id}/edit`}
                                className="p-2 bg-slate-800 hover:bg-[#00e5ff]/20 text-slate-400 hover:text-[#00e5ff] rounded-lg transition-colors"
                                title="編集"
                              >
                                ✎
                              </Link>
                              <button
                                onClick={() => handleDelete(c.id)}
                                className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                title="削除"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {cases.length === 0 && (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="px-6 py-20 text-center text-slate-500">
                          <div className="text-4xl mb-3 opacity-30">📂</div>
                          <p>データがまだありません</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}

function StatusBadge({ status }: { status: string }) {
  let styles = "bg-slate-800 text-slate-400 border-slate-700";
  let label = status;

  if (status === "pending") {
    styles = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]";
    label = "承認待ち";
  } else if (status === "approved") {
    styles = "bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30 shadow-[0_0_10px_rgba(0,229,255,0.2)]";
    label = "承認済み";
  } else if (status === "rejected") {
    styles = "bg-red-500/10 text-red-400 border-red-500/30";
    label = "却下";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles}`}>
      {label}
    </span>
  );
}
