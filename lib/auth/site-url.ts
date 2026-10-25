import { headers } from "next/headers";

/** Public origin for auth emails and redirects (local, Netlify, or custom). */
export async function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const netlify = process.env.URL?.trim().replace(/\/$/, "");
  if (netlify) return netlify;

  const h = await headers();
  const origin = h.get("origin")?.trim().replace(/\/$/, "");
  if (origin) return origin;

  const host = (h.get("x-forwarded-host") || h.get("host") || "").trim();
  const proto = (h.get("x-forwarded-proto") || "http").split(",")[0]?.trim() || "http";
  if (host) return `${proto}://${host}`.replace(/\/$/, "");

  return "http://localhost:3000";
}
