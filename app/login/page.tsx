"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
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
      // タイムアウト付きのログイン処理
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
        // ダッシュボードへ遷移
        // グローバルな状態更新を待つために少し遅延させるのも手だが、router.pushで十分
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "ログイン中に問題が発生しました。");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 aurora-bg relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl border border-white/5 animate-fade-in backdrop-blur-xl">

          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 mb-6 border border-white/5 shadow-inner">
              <span className="text-3xl filter drop-shadow-lg">🛡️</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Blacklist App へログイン
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="input-group group space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest transition-colors duration-300 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900/60 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300"
                    placeholder="name@company.com"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500 opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="input-group group space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest transition-colors duration-300">
                    Password
                  </label>
                  {/* <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Forgot?</a> */}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/60 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500 opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fade-in flex items-start gap-3">
                <span className="text-red-400 text-lg">⚠️</span>
                <p className="text-sm text-red-200 leading-snug pt-0.5">
                  {errorMsg}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Log In
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-slate-700/30">
            <p className="text-sm text-slate-400 mb-2">
              まだアカウントをお持ちでないですか？
            </p>
            <Link
              href="/signup"
              className="inline-block text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors hover:underline decoration-emerald-400/50 underline-offset-4"
            >
              新規アカウント作成
            </Link>
          </div>
        </div>

        {/* Footer links or copyright could go here */}
        <div className="text-center mt-8">
          <Link href="/" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
