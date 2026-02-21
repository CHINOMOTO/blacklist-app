// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (typeof window !== "undefined") {
    // クライアントサイドのみ警告を出す（SSG/SSRでは警告しない）
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Supabase Environment Variables are missing!");
    }
}

export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder");
