"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const timeoutPromise = new Promise<{ data: { session: null }; error: { message: string } }>((_, reject) =>
        setTimeout(() => reject(new Error("サーバーからの応答がありません。ネットワーク接続を確認してください。")), 15000)
      );

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("メールアドレスまたはパスワードが間違っています。");
        }
        if (error.message.includes("Email not confirmed")) {
          throw new Error("メールアドレスの確認が完了していません。受信トレイを確認してください。");
        }
        throw error;
      }

      if (data?.session) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "ログイン中に問題が発生しました。");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00e5ff]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00e5ff]/5 rounded-full blur-[100px]"></div>
      </div>

      <main className="w-full max-w-md flex flex-col items-center justify-center relative z-10 animate-fade-in">

        {/* Logo & Tagline */}
        <div className="text-center mb-10">
          <div className="mb-4 inline-block relative group">
            <h1 className="text-7xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)] drop-shadow-[0_0_25px_rgba(0,229,255,0.6)]">
              SCOUTER
            </h1>
            <div className="absolute -inset-2 bg-[#00e5ff]/20 blur-xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-500 -z-10"></div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 tracking-wider drop-shadow-md">
            リスクを未然に防ぐ、人材管理システム
          </h2>
          <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-md mx-auto">
            過去のトラブルや注意情報を一元管理し、<br className="hidden sm:block" />
            同じリスクを繰り返さない
          </p>
        </div>

        {/* Login Form Container */}
        <div className="w-full glass-panel rounded-3xl p-8 shadow-2xl border border-[#00e5ff]/20 backdrop-blur-xl relative overflow-hidden">
          {/* Decorative decorative line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-50"></div>

          <div className="mb-8 text-center">
            <h2 className="text-sm font-bold text-[#00e5ff] tracking-[0.2em] uppercase mb-1">
              System Login
            </h2>
            <p className="text-xs text-slate-500">アカウント情報を入力してください</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="input-group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#00e5ff]/60 focus:bg-slate-900/80 focus:ring-1 focus:ring-[#00e5ff]/40 transition-all font-mono text-sm"
                  placeholder="メールアドレス"
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#00e5ff]/60 focus:bg-slate-900/80 focus:ring-1 focus:ring-[#00e5ff]/40 transition-all font-mono text-sm"
                  placeholder="パスワード"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 animate-fade-in">
                <span className="text-red-400 text-sm">⚠️</span>
                <p className="text-xs text-red-200 pt-0.5">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-[#008299] to-[#00e5ff] hover:from-[#00e5ff] hover:to-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed hover:text-black tracking-widest uppercase text-sm"
            >
              {isLoading ? "AUTHENTICATING..." : "LOGIN"}
            </button>
          </form>

          <div className="text-center mt-8 border-t border-white/5 pt-4">
            <Link href="/signup" className="text-xs text-slate-500 hover:text-[#00e5ff] transition-colors">
              &gt;&gt; 新規アカウント作成はこちら
            </Link>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-4 w-full text-center text-slate-700 text-xs font-mono">
        <p>&copy; {new Date().getFullYear()} SCOUTER SYSTEM. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
