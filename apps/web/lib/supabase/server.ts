import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const cookieHandlers = async () => {
  const cookieStore = await cookies();
  return {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
        );
      } catch {
        // Server Components では set できない場合があるが問題なし
      }
    },
  };
};

// Server Components / Route Handlers 用（anon key）
export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: await cookieHandlers() }
  );
}

// 管理操作用（service role key - 管理画面のみ使用）
export async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: await cookieHandlers() }
  );
}
