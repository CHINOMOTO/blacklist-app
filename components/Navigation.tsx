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
        const fetchNotifications = async (userId: string) => {
            const { count: userCount } = await supabase
                .from("app_users")
                .select("*", { count: "exact", head: true })
                .eq("is_approved", false);
            const { count: caseCount } = await supabase
                .from("blacklist_cases")
                .select("*", { count: "exact", head: true })
                .eq("status", "pending");
            setNotificationCount((userCount || 0) + (caseCount || 0));
        };

        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            if (session?.user) {
                const role = session.user.app_metadata?.role;
                const isUserAdmin = role === 'admin';
                setIsAdmin(isUserAdmin);

                if (isUserAdmin) {
                    fetchNotifications(session.user.id);
                }
            } else {
                setIsAdmin(false);
                setUserName(null);
                setNotificationCount(0);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            if (event === 'SIGNED_OUT') {
                setIsAdmin(false);
                setUserName(null);
                setSession(null);
                setNotificationCount(0);
                return;
            }

            if (session?.user) {
                const role = session.user.app_metadata?.role;
                const isUserAdmin = role === 'admin';
                setIsAdmin(isUserAdmin);

                if (isUserAdmin) {
                    fetchNotifications(session.user.id);
                }
            } else {
                setIsAdmin(false);
                setUserName(null);
                setNotificationCount(0);
            }
        });

        return () => subscription.unsubscribe();
    }, [pathname]); // pathnameが変わるたびにも再チェック（通知数更新のため）

    // 会社名+登録名を取得する（認証フローとは独立、ユーザーIDが変わった時だけ実行）
    useEffect(() => {
        if (!session?.user?.id) return;
        let cancelled = false;

        const fetchDisplayName = async () => {
            try {
                const { data: appUser } = await supabase
                    .from("app_users")
                    .select("display_name, company_id")
                    .eq("id", session.user.id)
                    .maybeSingle();
                if (cancelled || !appUser) return;
                const displayName = (appUser.display_name as string) || "User";
                if (!appUser.company_id) {
                    setUserName(displayName);
                    return;
                }
                const { data: company } = await supabase
                    .from("companies")
                    .select("name")
                    .eq("id", appUser.company_id)
                    .maybeSingle();
                if (cancelled) return;
                const companyName = (company as { name: string } | null)?.name;
                setUserName(companyName ? `${companyName} ${displayName}` : displayName);
            } catch {
                // エラーが起きても何もしない（既存のdisplay_nameが表示される）
            }
        };

        fetchDisplayName();
        return () => { cancelled = true; };
    }, [session?.user?.id]); // ユーザーIDが変わった時のみ実行

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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // ログイン・サインアップページではナビゲーションバーを表示しない（セッションがあっても非表示）
    if (pathname === "/" || pathname === "/signup" || pathname === "/login") return null;

    // セッションがない場合は表示しない
    if (!session) return null;

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-[#00e5ff]/20 bg-black/90 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <Link href={session ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center gap-2 font-bold text-xl text-[#00e5ff] group tracking-widest uppercase" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="text-2xl group-hover:rotate-45 transition-transform duration-300">⌖</span>
                            <span className="drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]">SCOUTER</span>
                        </Link>

                        {/* Mobile menu button */}
                        {session && (
                            <div className="flex md:hidden">
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="p-2 rounded-md text-[#00e5ff] hover:bg-[#00e5ff]/10 focus:outline-none"
                                >
                                    <span className="sr-only">Open main menu</span>
                                    {isMobileMenuOpen ? (
                                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

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

            {/* Mobile menu */}
            {session && isMobileMenuOpen && (
                <div className="md:hidden border-t border-[#00e5ff]/20 bg-black/95 backdrop-blur-xl animate-fade-in">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {userName && (
                            <div className="px-3 py-2 text-xs font-mono tracking-wider text-[#00e5ff]/60 border-b border-[#00e5ff]/10 mb-2">
                                LOGGED IN AS: <span className="text-[#00e5ff] font-bold ml-2">{userName}</span>
                            </div>
                        )}
                        <MobileNavLink href="/dashboard" active={pathname === "/dashboard"} onClick={() => setIsMobileMenuOpen(false)}>
                            ダッシュボード
                        </MobileNavLink>
                        <MobileNavLink href="/search" active={pathname === "/search"} onClick={() => setIsMobileMenuOpen(false)}>
                            検索
                        </MobileNavLink>
                        <MobileNavLink href="/cases" active={pathname.startsWith("/cases") && pathname !== "/cases/new"} onClick={() => setIsMobileMenuOpen(false)}>
                            登録データ一覧
                        </MobileNavLink>
                        <MobileNavLink href="/cases/new" active={pathname === "/cases/new"} onClick={() => setIsMobileMenuOpen(false)}>
                            新規登録
                        </MobileNavLink>
                        {isAdmin && (
                            <MobileNavLink href="/admin" active={pathname.startsWith("/admin")} onClick={() => setIsMobileMenuOpen(false)} isSpecial>
                                管理メニュー {notificationCount > 0 && `(${notificationCount})`}
                            </MobileNavLink>
                        )}
                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                handleLogout();
                            }}
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-4 border-t border-red-500/20 pt-4"
                        >
                            ログアウト
                        </button>
                    </div>
                </div>
            )}
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

function MobileNavLink({ href, children, active, onClick, isSpecial }: { href: string, children: React.ReactNode, active: boolean, onClick: () => void, isSpecial?: boolean }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${active
                ? "bg-[#00e5ff]/20 text-[#00e5ff]"
                : "text-slate-300 hover:bg-[#00e5ff]/10 hover:text-[#00e5ff]"
                } ${isSpecial ? "border border-[#00e5ff]/50 text-[#00e5ff]" : ""}`}
        >
            {children}
        </Link>
    );
}
