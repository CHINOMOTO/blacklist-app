"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RequireAdmin } from "@/components/RequireAdmin";

type AppUser = {
    id: string;
    role: string;
    display_name: string | null;
    companies: {
        id: string;
        name: string;
    } | null;
    is_approved: boolean;
    email?: string;
    created_at?: string;
};

export default function RegisteredUsersPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch("/api/admin/users", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setUsers(data.users || []);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 蜑企勁讖溯・
    const handleDelete = async (userId: string) => {
        if (!confirm("譛ｬ蠖薙↓縺薙・繝ｦ繝ｼ繧ｶ繝ｼ繧貞炎髯､縺励∪縺吶°・歃n窶ｻ謚慕ｨｿ繝・・繧ｿ縺ｯ菫晄戟縺輔ｌ縺ｾ縺吶′縲√Ο繧ｰ繧､繝ｳ縺ｧ縺阪↑縺上↑繧翫∪縺吶・n縺薙・謫堺ｽ懊・蜿悶ｊ豸医○縺ｾ縺帙ｓ縲・)) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            
            if (data.error) throw new Error(data.error);

            setUsers(prev => prev.filter(u => u.id !== userId));
            alert("繝ｦ繝ｼ繧ｶ繝ｼ繧貞炎髯､縺励∪縺励◆縲・);
        } catch (e: any) {
            alert("蜑企勁縺ｫ螟ｱ謨励＠縺ｾ縺励◆: " + e.message);
        }
    };

    return (
        <RequireAdmin>
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                <div className="max-w-5xl w-full">

                    <div className="flex items-center justify-between mb-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">逋ｻ骭ｲ貂医∩繝ｦ繝ｼ繧ｶ繝ｼ荳隕ｧ</h1>
                            <p className="text-slate-400">迴ｾ蝨ｨ繧ｷ繧ｹ繝・Β縺ｫ逋ｻ骭ｲ縺輔ｌ縺ｦ縺・ｋ繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ荳隕ｧ縺ｧ縺・/p>
                        </div>
                        <Link href="/admin" className="btn-secondary text-xs">
                            邂｡逅・・Γ繝九Η繝ｼ縺ｸ謌ｻ繧・                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin h-10 w-10 border-4 border-[#00e5ff] rounded-full border-t-transparent"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="glass-panel p-10 text-center rounded-2xl animate-fade-in">
                            <p className="text-slate-300">逋ｻ骭ｲ繝ｦ繝ｼ繧ｶ繝ｼ縺ｯ縺・∪縺帙ｓ縲・/p>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-fade-in delay-100">
                            {users.map((user) => (
                                <div key={user.id} className="glass-panel rounded-2xl border border-white/10 hover:border-[#00e5ff]/30 transition-all p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* 蟾ｦ蛛ｴ・壹Θ繝ｼ繧ｶ繝ｼ諠・ｱ */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <h3 className="text-white font-bold text-base truncate">
                                                    {user.display_name || "譛ｪ險ｭ螳・}
                                                </h3>
                                                <span className={`shrink-0 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin'
                                                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-400">
                                                <span>{user.companies?.name || "譛ｪ謇螻・}</span>
                                                <span className="text-slate-600">|</span>
                                                <span className="font-mono">{user.email || "窶・}</span>
                                            </div>
                                        </div>

                                        {/* 蜿ｳ蛛ｴ・壽桃菴懊・繧ｿ繝ｳ */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={async () => {
                                                    if (user.role === 'admin') {
                                                        const adminCount = users.filter(u => u.role === 'admin').length;
                                                        if (adminCount <= 1) {
                                                            alert("繧ｨ繝ｩ繝ｼ: 譛蠕後・邂｡逅・・・髯肴ｼ縺ｧ縺阪∪縺帙ｓ縲・n蟆代↑縺上→繧・莠ｺ縺ｮ邂｡逅・・′蟄伜惠縺吶ｋ蠢・ｦ√′縺ゅｊ縺ｾ縺吶・);
                                                            return;
                                                        }
                                                    }

                                                    const newRole = user.role === 'admin' ? 'viewer' : 'admin';
                                                    if (!confirm(`縲・{user.display_name}縲阪・讓ｩ髯舌ｒ縲・{newRole.toUpperCase()}縲代↓螟画峩縺励∪縺吶°・歔)) return;

                                                    try {
                                                        const { data: { session } } = await supabase.auth.getSession();
                                                        const token = session?.access_token;

                                                        const res = await fetch(`/api/admin/users/${user.id}/role`, {
                                                            method: "PATCH",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                                "Authorization": `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify({ role: newRole })
                                                        });
                                                        const data = await res.json();
                                                        
                                                        if (data.error) throw new Error(data.error);

                                                        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                                                        alert("讓ｩ髯舌ｒ譖ｴ譁ｰ縺励∪縺励◆縲・);
                                                    } catch (err: any) {
                                                        alert("譖ｴ譁ｰ縺ｫ螟ｱ謨励＠縺ｾ縺励◆: " + err.message);
                                                    }
                                                }}
                                                className="whitespace-nowrap text-xs text-slate-400 hover:text-white border border-slate-600 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                                                title={user.role === 'admin' ? "荳闊ｬ繝ｦ繝ｼ繧ｶ繝ｼ縺ｫ髯肴ｼ" : "邂｡逅・・↓譏・ｼ"}
                                            >
                                                讓ｩ髯仙､画峩
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="whitespace-nowrap text-xs text-red-400 hover:text-white border border-red-500/30 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors font-bold"
                                            >
                                                蜑企勁
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </RequireAdmin>
    );
}
