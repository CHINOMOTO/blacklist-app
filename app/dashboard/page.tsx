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
              ダッシュボード
            </h1>

          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 検索 */}
            <DashboardCard
              title="検索・照会"
              subtitle="SEARCH"
              description="氏名・カナ・生年月日などから登録データを照会します。"
              icon="🔍"
              colorClass="group-hover:text-[#00e5ff] group-hover:border-[#00e5ff]/50"
              bgGradient="group-hover:bg-[#00e5ff]/10"
              onClick={() => router.push("/search")}
            />

            {/* 一覧 */}
            <DashboardCard
              title="登録データ一覧"
              subtitle="LIST"
              description="現在登録されている応募者属性の全データを確認します。"
              icon="📋"
              colorClass="group-hover:text-[#00e5ff] group-hover:border-[#00e5ff]/50"
              bgGradient="group-hover:bg-[#00e5ff]/10"
              onClick={() => router.push("/cases")}
            />

            {/* 新規登録 */}
            <DashboardCard
              title="新規登録"
              subtitle="REGISTER"
              description="新たな対象者を応募者属性リストに追加登録します。"
              icon="✍️"
              colorClass="group-hover:text-[#00e5ff] group-hover:border-[#00e5ff]/50"
              bgGradient="group-hover:bg-[#00e5ff]/10"
              onClick={() => router.push("/cases/new")}
            />

            {/* アカウント設定 */}
            <DashboardCard
              title="アカウント設定"
              subtitle="SETTINGS"
              description="表示名やパスワードの変更、アカウント情報の確認を行います。"
              icon="⚙️"
              colorClass="group-hover:text-[#00e5ff] group-hover:border-[#00e5ff]/50"
              bgGradient="group-hover:bg-[#00e5ff]/10"
              onClick={() => router.push("/settings")}
            />

            {/* 管理者メニュー */}
            {isAdmin && (
              <DashboardCard
                title="管理者メニュー"
                subtitle="ADMIN"
                description="新規登録申請やユーザーアカウントの承認・管理を行います。"
                icon="⚡"
                isAdmin
                onClick={() => router.push("/admin")}
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
          ? 'border-[#00e5ff]/40 bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20'
          : 'border-white/10 hover:border-white/20'
        }`}
    >
      {/* Background Hover Glow */}
      <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${bgGradient} ${isAdmin ? 'opacity-100' : 'group-hover:opacity-100'}`} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6 w-full">
          <div className={`p-4 rounded-2xl text-4xl shadow-inner transition-transform duration-300 group-hover:scale-110 ${isAdmin ? 'bg-[#00e5ff]/20' : 'bg-white/5'}`}>
            {icon}
          </div>
          {isAdmin && (
            <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] text-xs font-bold rounded-lg border border-[#00e5ff]/30 uppercase tracking-wider shadow-sm">
              Admin Only
            </span>
          )}
        </div>

        <h3 className={`text-2xl font-bold text-slate-100 mb-2 transition-colors duration-300 ${colorClass} ${isAdmin ? 'text-[#00e5ff]' : ''}`}>
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
