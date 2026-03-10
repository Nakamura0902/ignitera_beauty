// generateStaticParams 用（ビルド時・リクエストスコープ外）
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
