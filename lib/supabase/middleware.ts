import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cachedAuthUser, identityOf, rememberAuthUser, type AuthIdentity } from "./auth-cache";
import { authFetch } from "./auth-fetch";
import { requireSupabaseEnv } from "./env";
import { accessTokenFromCookies } from "./session-cookie";

export async function updateSession(request: NextRequest): Promise<{ response: NextResponse; user: AuthIdentity | null }> {
  const { url, anonKey } = requireSupabaseEnv();
  const presented = accessTokenFromCookies(request.cookies.getAll(), url);
  if (presented && presented.expiresAtMs - Date.now() > 60_000) {
    const known = cachedAuthUser(presented.token);
    if (known) return { response: NextResponse.next({ request }), user: known };
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    global: { fetch: authFetch },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const identity = user ? identityOf(user) : null;
  const fresh = accessTokenFromCookies(request.cookies.getAll(), url);
  if (identity && fresh) rememberAuthUser(fresh.token, identity, fresh.expiresAtMs);

  return { response, user: identity };
}
