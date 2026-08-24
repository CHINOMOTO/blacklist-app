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
    is_approved: boolean; // boolean
    email?: string; // join縺ｧ蜿悶▲縺ｦ縺上ｋ縺ｮ縺ｯ髮｣縺励＞縺後∥uth縺九ｉ縺ｯ蜿悶ｌ縺ｪ縺・・縺ｧ縺ゅ″繧峨ａ繧九°縲∝挨騾泌叙蠕・
    // note: Supabase縺ｧauth.users縺ｨpublic繝・・繝悶Ν繧男oin縺吶ｋ縺ｮ縺ｯ繧ｻ繧ｭ繝･繝ｪ繝・ぅ荳企屮縺励＞縺ｮ縺ｧ縲・
    // 縺薙％縺ｧ縺ｯpublic.app_users縺ｮ諠・ｱ縺縺代〒陦ｨ遉ｺ縺吶ｋ縲・mail縺悟ｿ・ｦ√↑繧右dge Function縺悟ｿ・ｦ√・
    created_at?: string;
};

export default function AdminUsersPage() {
    const [pendingUsers, setPendingUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingUsers = async () => {
        setLoading(true);
        // 譛ｪ謇ｿ隱・is_approved = false)縺ｮ繝ｦ繝ｼ繧ｶ繝ｼ繧貞叙蠕・
        const { data, error } = await supabase
            .from("app_users")
            .select(`
        id,
        role,
        display_name,
        is_approved,
        companies ( id, name )
      `)
            .eq("is_approved", false);

        if (error) {
            console.error(error);
        } else {
            setPendingUsers((data as any) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApprove = async (userId: string) => {
        const { error } = await supabase
            .from("app_users")
            .update({ is_approved: true })
            .eq("id", userId);

        if (!error) {
            // 繝ｪ繧ｹ繝医°繧牙炎髯､縺励※譖ｴ譁ｰ
            setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
        } else {
            alert("謇ｿ隱阪↓螟ｱ謨励＠縺ｾ縺励◆: " + error.message);
        }
    };

    return (
        <RequireAdmin>
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
                <div className="max-w-5xl w-full">

                    <div className="flex items-center justify-between mb-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">譁ｰ隕上Θ繝ｼ繧ｶ繝ｼ謇ｿ隱・/h1>
                            <p className="text-slate-400">譁ｰ隕丞茜逕ｨ逕ｳ隲九・遒ｺ隱阪→謇ｿ隱阪ｒ陦後＞縺ｾ縺・/p>
                        </div>
                        <Link href="/admin" className="btn-secondary text-xs">
                            邂｡逅・・Γ繝九Η繝ｼ縺ｸ謌ｻ繧・
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin h-10 w-10 border-4 border-[#00e5ff] rounded-full border-t-transparent"></div>
                        </div>
                    ) : pendingUsers.length === 0 ? (
                        <div className="glass-panel p-10 text-center rounded-2xl animate-fade-in">
                            <span className="text-4xl mb-4 block">総</span>
                            <p className="text-slate-300">迴ｾ蝨ｨ縲∵悴謇ｿ隱阪・繝ｦ繝ｼ繧ｶ繝ｼ縺ｯ縺・∪縺帙ｓ縲・/p>
                        </div>
                    ) : (
                        <div className="grid gap-4 animate-fade-in delay-100">
                            {pendingUsers.map((user) => (
                                <div key={user.id} className="glass-panel p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 card-hover">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white">{user.display_name || "蜷咲┌縺・}</h3>
                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded border border-yellow-500/30">
                                                PENDING
                                            </span>
                                        </div>
                                        <div className="text-slate-400 text-sm flex items-center gap-2">
                                            <span className="text-slate-500">謇螻・</span>
                                            {user.companies?.name || "譛ｪ謇螻・}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => {
                                                if (confirm("縺薙・繝ｦ繝ｼ繧ｶ繝ｼ繧呈価隱阪＠縺ｾ縺吶°・・)) handleApprove(user.id);
                                            }}
                                            className="btn-primary flex-grow md:flex-grow-0 whitespace-nowrap"
                                        >
                                            謇ｿ隱阪☆繧・
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm("譛ｬ蠖薙↓縺薙・逕ｳ隲九ｒ蜊ｴ荳具ｼ亥炎髯､・峨＠縺ｾ縺吶°・歃n窶ｻ縺薙・謫堺ｽ懊・蜿悶ｊ豸医○縺ｾ縺帙ｓ縲・)) {
                                                    const { error } = await supabase
                                                        .from("app_users")
                                                        .delete()
                                                        .eq("id", user.id);

                                                    if (!error) {
                                                        setPendingUsers((prev) => prev.filter((u) => u.id !== user.id));
                                                    } else {
                                                        alert("蜊ｴ荳九↓螟ｱ謨励＠縺ｾ縺励◆: " + error.message);
                                                    }
                                                }
                                            }}
                                            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-bold whitespace-nowrap"
                                        >
                                            蜊ｴ荳・
                                        </button>
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
