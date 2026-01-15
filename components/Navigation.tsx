"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            if (session?.user) {
                // Tokenベースの判定（DBアクセスなし）
                const role = session.user.app_metadata?.role;
                setIsAdmin(role === 'admin');

                // 表示名は user_metadata から取得（app_usersテーブルは見ない）
                setUserName(session.user.user_metadata?.display_name || "User");
            } else {
                setIsAdmin(false);
                setUserName(null);
            }
        };

        checkUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            // ログアウト時はここで検知してリダイレクトすることも可能だが、
            // handleLogoutで明示的に行うので、ここは主にステート更新用
            if (event === 'SIGNED_OUT') {
                setIsAdmin(false);
                setUserName(null);
                setSession(null);
                return;
            }

            if (session?.user) {
                const role = session.user.app_metadata?.role;
                setIsAdmin(role === 'admin');
                setUserName(session.user.user_metadata?.display_name || "User");
            } else {
                setIsAdmin(false);
                setUserName(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // ステートをクリア
            setSession(null);
            setIsAdmin(false);
            setUserName(null);

            // 確実にログイン画面へ遷移させる（ハードリダイレクト推奨）
            // Router.pushだとステート残存の可能性があるため
            window.location.href = "/login";
        }
    };

    // ログインページではナビゲーションバーを表示しない
    if (pathname === "/login") return null;

    // セッションがない場合、トップページ以外では表示しない（必要に応じて調整）
    if (!session && pathname !== "/" && pathname !== "/signup") return null;

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href={session ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center gap-2 font-bold text-xl text-emerald-400 group">
                            <span className="text-2xl group-hover:rotate-12 transition-transform">🛡️</span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Blacklist App</span>
                        </Link>
                        {session && (
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-2">
                                    <NavLink href="/dashboard" active={pathname === "/dashboard"}>
                                        ダッシュボード
                                    </NavLink>
                                    <NavLink href="/search" active={pathname === "/search"}>
                                        検索
                                    </NavLink>
                                    <NavLink href="/cases" active={pathname.startsWith("/cases") && pathname !== "/cases/new"}>
                                        一覧
                                    </NavLink>
                                    <NavLink href="/cases/new" active={pathname === "/cases/new"}>
                                        新規登録
                                    </NavLink>
                                    {isAdmin && (
                                        <Link
                                            href="/admin"
                                            className={`ml-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${pathname.startsWith("/admin")
                                                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                : "border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
                                                }`}
                                        >
                                            管理者メニュー
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6 gap-4">
                            {session && userName && (
                                <div className="text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                                    <span className="mr-1 text-slate-500">User:</span>
                                    <span className="text-slate-200 font-medium">{userName}</span>
                                </div>
                            )}
                            {session ? (
                                <button
                                    onClick={handleLogout}
                                    className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded hover:bg-slate-800 transition-colors"
                                >
                                    ログアウト
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    className="btn-primary text-xs px-4 py-2 rounded-full"
                                >
                                    ログイン
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, children, active }: { href: string, children: React.ReactNode, active: boolean }) {
    return (
        <Link
            href={href}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
                ? "bg-slate-800 text-white shadow-inner"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
        >
            {children}
        </Link>
    )
}
