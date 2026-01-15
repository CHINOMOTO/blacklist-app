"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RequireAuth } from "@/components/RequireAuth";

export default function DashboardPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Tokenベースの判定（DBアクセスなし）
        const role = user.app_metadata?.role;
        setIsAdmin(role === 'admin');
      }
    };
    checkAdmin();
  }, []);

  return (
    <RequireAuth>
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
        <div className="max-w-5xl w-full animate-fade-in relative z-10">

          <div className="mb-12 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
              Dashboard
            </h1>
            <p className="text-slate-300 text-lg font-medium">
              業務メニューを選択してください
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 検索 */}
            <DashboardCard
              title="検索・照会"
              subtitle="SEARCH"
              description="氏名・カナ・生年月日などから要注意人物を照会します。"
              icon="🔍"
              colorClass="group-hover:text-emerald-400 group-hover:border-emerald-500/50"
              bgGradient="group-hover:bg-emerald-500/10"
              onClick={() => router.push("/search")}
            />

            {/* 一覧 */}
            <DashboardCard
              title="登録データ一覧"
              subtitle="LIST"
              description="現在登録されているブラックリストの全データを確認します。"
              icon="📋"
              colorClass="group-hover:text-cyan-400 group-hover:border-cyan-500/50"
              bgGradient="group-hover:bg-cyan-500/10"
              onClick={() => router.push("/cases")}
            />

            {/* 新規登録 */}
            <DashboardCard
              title="新規登録"
              subtitle="REGISTER"
              description="新たな対象者をブラックリストに追加登録します。"
              icon="✍️"
              colorClass="group-hover:text-purple-400 group-hover:border-purple-500/50"
              bgGradient="group-hover:bg-purple-500/10"
              onClick={() => router.push("/cases/new")}
            />

            {/* 管理者メニュー */}
            {isAdmin && (
              <DashboardCard
                title="管理者メニュー"
                subtitle="ADMIN"
                description="新規登録申請やユーザーアカウントの承認・管理を行います。"
                icon="⚡"
                isAdmin
                onClick={() => router.push("/admin/cases")}
              />
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

function DashboardCard({
  title, subtitle, description, icon, onClick, colorClass = "", bgGradient = "", isAdmin = false
}: {
  title: string, subtitle: string, description: string, icon: string, onClick: () => void, colorClass?: string, bgGradient?: string, isAdmin?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative text-left p-8 rounded-3xl border transition-all duration-300 glass-panel hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full overflow-hidden
            ${isAdmin
          ? 'border-emerald-500/40 bg-emerald-900/20 hover:bg-emerald-900/30'
          : 'border-white/10 hover:border-white/20'
        }`}
    >
      {/* Background Hover Glow */}
      <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${bgGradient} ${isAdmin ? 'opacity-100' : 'group-hover:opacity-100'}`} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6 w-full">
          <div className={`p-4 rounded-2xl text-4xl shadow-inner transition-transform duration-300 group-hover:scale-110 ${isAdmin ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
            {icon}
          </div>
          {isAdmin && (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 uppercase tracking-wider shadow-sm">
              Admin Only
            </span>
          )}
        </div>

        <h3 className={`text-2xl font-bold text-slate-100 mb-2 transition-colors duration-300 ${colorClass} ${isAdmin ? 'text-emerald-100' : ''}`}>
          {title}
        </h3>
        <div className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
          {subtitle}
        </div>

        <p className="text-sm text-slate-400 leading-relaxed mt-auto group-hover:text-slate-200 transition-colors duration-300">
          {description}
        </p>
      </div>
    </button>
  )
}
