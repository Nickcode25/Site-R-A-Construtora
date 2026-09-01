import { createClient } from "@supabase/supabase-js";

const defaultSupabaseUrl = "https://ohicrkhbzbmuzocucnfv.supabase.co";
const defaultSupabasePublishableKey = "sb_publishable_lDj-SggkbsvdUyhELLWuUw_dgXWtCdo";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || defaultSupabaseUrl;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || defaultSupabasePublishableKey;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});
