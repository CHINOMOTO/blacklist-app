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

      <main className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 relative z-10 animate-fade-in">

        {/* Left Side: Hero Text */}
        <div className="text-center md:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/20 text-[#00e5ff] text-xs font-medium mb-6 mx-auto md:mx-0">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse"></span>
            Secure & Reliable Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg mb-6 leading-tight">
            建設業の信頼を、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-cyan-400 text-glow">
              未来へつなぐ。
            </span>
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed mb-8 md:mb-0">
            業界全体で共有する、安全なブラックリスト管理システム。<br className="hidden md:block" />
            リスクを未然に防ぎ、健全な取引環境を構築します。
          </p>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-white/5 backdrop-blur-xl">
            <div className="mb-8 pl-1">
              <h2 className="text-xl font-bold text-white tracking-widest uppercase flex items-center gap-2">
                <span className="text-[#00e5ff]">Login</span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="input-group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#00e5ff]/50 focus:bg-slate-900/70 focus:ring-1 focus:ring-[#00e5ff]/30 transition-all"
                    placeholder="メールアドレス"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#00e5ff]/50 focus:bg-slate-900/70 focus:ring-1 focus:ring-[#00e5ff]/30 transition-all"
                    placeholder="パスワード"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                  <span className="text-red-400 text-sm">⚠️</span>
                  <p className="text-xs text-red-200 pt-0.5">{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-[#00e5ff]/80 to-[#00e5ff] hover:from-[#00e5ff] hover:to-[#00e5ff] shadow-lg shadow-[#00e5ff]/20 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "処理中..." : "ログイン"}
              </button>
            </form>

            <div className="text-center mt-6 border-t border-white/5 pt-4">
              <Link href="/signup" className="text-xs text-[#00e5ff] hover:underline opacity-80 hover:opacity-100">
                新規アカウント作成はこちら
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-4 w-full text-center text-slate-700 text-xs font-mono">
        <p>&copy; {new Date().getFullYear()} SCOUTER SYSTEM. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
