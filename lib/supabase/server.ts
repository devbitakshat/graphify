import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { authFetch } from "./auth-fetch";
import { requireSupabaseEnv } from "./env";

export async function createSupabaseServerClient(options?: { persist?: "best-effort" | "required" }) {
  const persist = options?.persist ?? "best-effort";
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    global: { fetch: authFetch },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options: cookieOptions } of cookiesToSet) {
            cookieStore.set(name, value, cookieOptions);
          }
        } catch (error) {
          // Page renders cannot always write cookies; the proxy refreshes the session.
          // Sign-in must keep the session or the next page looks logged out.
          if (persist === "required") throw error;
        }
      },
    },
  });
}
