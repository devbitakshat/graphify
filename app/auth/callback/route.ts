import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { safeNext } from "@/lib/auth/safe-next";
import { upsertProfile } from "@/lib/data/repository";
import { authFetch } from "@/lib/supabase/auth-fetch";
import { requireSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next") ?? undefined);
  const { origin } = url;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=confirm`);
  }

  const { url: supabaseUrl, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, anonKey, {
    global: { fetch: authFetch },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=confirm`);
  }

  const email = data.user.email?.toLowerCase();
  if (email) {
    const name =
      (typeof data.user.user_metadata?.name === "string" && data.user.user_metadata.name.trim()) ||
      email.split("@")[0] ||
      "Learner";
    try {
      await upsertProfile({ id: data.user.id, email, name });
    } catch {
      // Session is enough to continue; profile can be created on next request.
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
