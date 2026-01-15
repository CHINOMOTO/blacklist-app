// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase Environment Variables are missing!");
} else {
    console.log("Supabase Client initializing...", {
        url: supabaseUrl ? "Set" : "Missing",
        key: supabaseAnonKey ? "Set" : "Missing"
    });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
