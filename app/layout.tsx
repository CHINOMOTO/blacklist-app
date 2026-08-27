import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "SCOUTER - 建設業界のための人材適性管理システム",
  description: "Construction Industry Scouter System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMaintenance = process.env.MAINTENANCE_MODE === 'true';

  if (isMaintenance) {
    return (
      <html lang="ja">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
        </head>
        <body className="font-sans antialiased bg-slate-900 text-slate-100 overflow-hidden min-h-screen flex items-center justify-center">
          <div className="fixed inset-0 pointer-events-none z-[100] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,229,255,0.05)_100%)]"></div>
          <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-[#00e5ff]/10 text-[#00e5ff] animate-pulse">
                <AlertTriangle className="w-16 h-16" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-4xl font-bold font-orbitron tracking-widest text-white mb-6">
              SYSTEM MAINTENANCE
            </h1>
            <h2 className="text-xl font-bold text-slate-200 mb-4">
              現在、システムメンテナンス中です
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              より良いサービスを提供するため、システムのアップデートおよびメンテナンスを行っております。
              <br className="hidden sm:block" />
              ご不便をおかけいたしますが、終了まで今しばらくお待ちください。
            </p>
            <div className="inline-block px-6 py-3 border border-slate-700 bg-slate-800/50 rounded-xl text-sm text-slate-400 font-mono">
              STATUS: UPGRADING
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-slate-900 text-scouter-green overflow-x-hidden min-h-screen selection:bg-scouter-green selection:text-slate-900">
        <div className="fixed inset-0 pointer-events-none z-[100] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,229,255,0.05)_100%)]"></div>
        <Navigation />
        <main className="relative z-10">{children}</main>
        <footer className="relative z-10 py-8 text-center text-scouter-green/50 text-xs font-mono border-t border-scouter-green/20 mt-12">
          <p>&copy; 2024 SCOUTER SYSTEM. ALL RIGHTS RESERVED.</p>
        </footer>
      </body>
    </html>
  );
}
