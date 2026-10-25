const BASE64_PREFIX = "base64-";

export function authCookieName(supabaseUrl: string) {
  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  return `sb-${projectRef}-auth-token`;
}

function combine(cookies: Array<{ name: string; value: string }>, key: string) {
  const direct = cookies.find((cookie) => cookie.name === key)?.value;
  if (direct) return direct;
  const parts: string[] = [];
  for (let index = 0; ; index += 1) {
    const part = cookies.find((cookie) => cookie.name === `${key}.${index}`)?.value;
    if (!part) break;
    parts.push(part);
  }
  return parts.length > 0 ? parts.join("") : null;
}

function decode(value: string) {
  if (!value.startsWith(BASE64_PREFIX)) return value;
  return Buffer.from(value.slice(BASE64_PREFIX.length), "base64url").toString("utf8");
}

export function accessTokenFromCookies(
  cookies: Array<{ name: string; value: string }>,
  supabaseUrl: string,
) {
  try {
    const joined = combine(cookies, authCookieName(supabaseUrl));
    if (!joined) return null;
    const parsed = JSON.parse(decode(joined)) as { access_token?: unknown; expires_at?: unknown };
    if (typeof parsed.access_token !== "string" || parsed.access_token.length === 0) return null;
    const expiresAtMs = typeof parsed.expires_at === "number" ? parsed.expires_at * 1000 : 0;
    return { token: parsed.access_token, expiresAtMs };
  } catch {
    return null;
  }
}
