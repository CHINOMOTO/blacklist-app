import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00e5ff]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00e5ff]/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 md:px-6 relative sm:pt-20 pt-16 pb-20">
        <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/20 text-[#00e5ff] text-xs font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse"></span>
            Secure & Reliable Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
            建設業の信頼を、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-cyan-400 text-glow">
              未来へつなぐ。
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            業界全体で共有する、安全なブラックリスト管理システム。<br className="hidden md:block" />
            リスクを未然に防ぎ、健全な取引環境を構築します。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/login"
              className="btn-primary text-lg px-8 py-4 shadow-xl shadow-[#00e5ff]/20 hover:scale-105 transition-transform"
            >
              ログインして始める
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mx-auto px-4 opacity-0 animate-fade-in delay-200" style={{ animationFillMode: 'forwards' }}>
          <FeatureCard
            icon="🔒"
            title="堅牢なセキュリティ"
            description="最新のセキュリティ技術により、機密情報を安全に保護・管理します。"
          />
          <FeatureCard
            icon="⚡"
            title="リアルタイム共有"
            description="情報は即座に反映され、組織全体で最新のリスク情報を共有できます。"
          />
          <FeatureCard
            icon="📱"
            title="どこでもアクセス"
            description="スマホ・タブレット対応。現場や移動中もスムーズに確認可能です。"
          />
        </div>
      </main>

      <footer className="w-full py-8 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} SCOUTER. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl hover:bg-slate-800/50 transition-colors text-left card-hover">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
