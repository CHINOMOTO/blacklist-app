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
        // Token繝吶・繧ｹ縺ｮ蛻､螳夲ｼ・B繧｢繧ｯ繧ｻ繧ｹ縺ｪ縺暦ｼ・
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
              繝繝・す繝･繝懊・繝・
            </h1>

          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 讀懃ｴ｢ */}
            <DashboardCard
              title="讀懃ｴ｢繝ｻ辣ｧ莨・
              subtitle="讀懃ｴ｢"
              description="豌丞錐繧・き繝翫↑縺ｩ縺九ｉ逋ｻ骭ｲ繝・・繧ｿ繧呈､懃ｴ｢縺励∪縺吶・
              icon="剥"
              colorClass="group-hover:text-[#00e5ff]"
              bgGradient="from-[#00e5ff]/20 to-transparent"
              onClick={() => router.push("/search")}
            />

            {/* 荳隕ｧ */}
            <DashboardCard
              title="逋ｻ骭ｲ繝・・繧ｿ荳隕ｧ"
              subtitle="荳隕ｧ"
              description="迴ｾ蝨ｨ逋ｻ骭ｲ縺輔ｌ縺ｦ縺・ｋ蜈ｨ繝・・繧ｿ繧堤｢ｺ隱阪＠縺ｾ縺吶・
              icon="搭"
              colorClass="group-hover:text-purple-400"
              bgGradient="from-purple-500/20 to-transparent"
              onClick={() => router.push("/cases")}
            />

            {/* 譁ｰ隕冗匳骭ｲ */}
            <DashboardCard
              title="譁ｰ隕冗匳骭ｲ"
              subtitle="逋ｻ骭ｲ"
              description="譁ｰ縺溘↑蟇ｾ雎｡閠・ｒ逋ｻ骭ｲ繝・・繧ｿ縺ｫ霑ｽ蜉縺励∪縺吶・
              icon="統"
              colorClass="group-hover:text-pink-400"
              bgGradient="from-pink-500/20 to-transparent"
              onClick={() => router.push("/cases/new")}
            />

            {/* 繧｢繧ｫ繧ｦ繝ｳ繝郁ｨｭ螳・*/}
            <DashboardCard
              title="繧｢繧ｫ繧ｦ繝ｳ繝郁ｨｭ螳・
              subtitle="險ｭ螳・
              description="繝ｭ繧ｰ繧､繝ｳ繝代せ繝ｯ繝ｼ繝峨・螟画峩繧・√い繧ｫ繧ｦ繝ｳ繝医・遒ｺ隱阪ｒ陦後＞縺ｾ縺吶・
              icon="笞呻ｸ・
              colorClass="group-hover:text-emerald-400"
              bgGradient="from-emerald-500/20 to-transparent"
              onClick={() => router.push("/settings")}
            />

            {/* 縺雁撫縺・粋繧上○ */}
            <DashboardCard
              title="縺雁撫縺・粋繧上○"
              subtitle="騾｣邨｡"
              description="繧ｷ繧ｹ繝・Β縺ｮ荳榊・蜷医ｄ讖溯・隕∵悍縺ｪ縺ｩ縲∫ｮ｡逅・・↓縺秘｣邨｡縺・◆縺縺代∪縺吶・
              icon="陶"
              colorClass="group-hover:text-amber-400"
              bgGradient="from-amber-500/20 to-transparent"
              onClick={() => router.push("/contact")}
            />

            {/* 邂｡逅・・Γ繝九Η繝ｼ */}
            {isAdmin && (
              <DashboardCard
                title="邂｡逅・・Γ繝九Η繝ｼ"
                subtitle="邂｡逅・
                description="譁ｰ隕冗匳骭ｲ逕ｳ隲九ｄ繝ｦ繝ｼ繧ｶ繝ｼ繧｢繧ｫ繧ｦ繝ｳ繝医・謇ｿ隱阪・邂｡逅・ｒ陦後＞縺ｾ縺吶・
                icon="笞｡"
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
