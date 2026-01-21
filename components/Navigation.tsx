"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Navigation() {
    const pathname = usePathname() || "";
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            if (session?.user) {
                const role = session.user.app_metadata?.role;
                setIsAdmin(role === 'admin');

                if (role === 'admin') {
                    const { count: userCount } = await supabase
                        .from("app_users")
                        .select("*", { count: "exact", head: true })
                        .eq("is_approved", false);
                    const { count: caseCount } = await supabase
                        .from("blacklist_cases")
                        .select("*", { count: "exact", head: true })
                        .eq("status", "pending");
                    setNotificationCount((userCount || 0) + (caseCount || 0));
                }

                // 表示名は user_metadata から取得（app_usersテーブルは見ない）
                setUserName(session.user.user_metadata?.display_name || "User");
            } else {
                setIsAdmin(false);
                setUserName(null);
                setNotificationCount(0);
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
            window.location.href = "/";
        }
    };

    // ログインページではナビゲーションバーを表示しない
    if (pathname === "/login") return null;

    // セッションがない場合、トップページ以外では表示しない（必要に応じて調整）
    if (!session && pathname !== "/" && pathname !== "/signup") return null;

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-[#00e5ff]/20 bg-black/90 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href={session ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center gap-2 font-bold text-xl text-[#00e5ff] group tracking-widest uppercase">
                            <span className="text-2xl group-hover:rotate-45 transition-transform duration-300">⌖</span>
                            <span className="drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]">SCOUTER</span>
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
                                        登録データ一覧
                                    </NavLink>
                                    <NavLink href="/cases/new" active={pathname === "/cases/new"}>
                                        新規登録
                                    </NavLink>
                                    {isAdmin && (
                                        <div className="relative inline-block">
                                            <Link
                                                href="/admin"
                                                className={`ml-2 px-3 py-1.5 rounded-none text-sm font-bold border transition-all uppercase tracking-wider ${pathname.startsWith("/admin")
                                                    ? "bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_10px_rgba(0,255,65,0.3)]"
                                                    : "border-[#00e5ff]/30 text-[#00e5ff]/70 hover:bg-[#00e5ff]/10 hover:text-[#00e5ff]"
                                                    }`}
                                            >
                                                管理メニュー
                                            </Link>
                                            {notificationCount > 0 && (
                                                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-pulse ring-2 ring-black">
                                                    {notificationCount}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6 gap-4">
                            {session && userName && (
                                <div className="text-xs text-[#00e5ff]/80 bg-[#00e5ff]/10 px-3 py-1 border border-[#00e5ff]/30 font-mono tracking-wider">
                                    <span className="mr-1 opacity-50">ユーザー:</span>
                                    <span className="font-bold">{userName}</span>
                                </div>
                            )}
                            {session && (
                                <button
                                    onClick={handleLogout}
                                    className="text-[#00e5ff]/70 hover:text-[#00e5ff] text-xs px-3 py-1.5 border border-transparent hover:border-[#00e5ff]/30 hover:bg-[#00e5ff]/10 transition-all tracking-wider uppercase"
                                >
                                    ログアウト
                                </button>
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
            className={`px-3 py-2 rounded-none text-sm font-bold tracking-wider transition-all duration-200 border-b-2 ${active
                ? "border-[#00e5ff] text-[#00e5ff] bg-[#00e5ff]/10 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "border-transparent text-[#00e5ff]/60 hover:text-[#00e5ff] hover:bg-[#00e5ff]/5"
                }`}
        >
            {children}
        </Link>
    )
}
