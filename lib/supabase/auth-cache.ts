import { createHash } from "node:crypto";

export type AuthIdentity = {
  id: string;
  email: string;
  name: string;
};

type Entry = {
  user: AuthIdentity;
  expiresAtMs: number;
};

const verified = new Map<string, Entry>();

function tokenKey(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

export function identityOf(user: {
  id: string;
  email?: string | null;
  user_metadata?: { name?: unknown };
}): AuthIdentity | null {
  const email = user.email?.toLowerCase();
  if (!email) return null;
  const metaName = user.user_metadata?.name;
  const name = (typeof metaName === "string" && metaName.trim()) || email.split("@")[0] || "Learner";
  return { id: user.id, email, name };
}

export function cachedAuthUser(token: string) {
  const hit = verified.get(tokenKey(token));
  if (!hit || hit.expiresAtMs <= Date.now()) {
    if (hit) verified.delete(tokenKey(token));
    return null;
  }
  return hit.user;
}

export function rememberAuthUser(token: string, user: AuthIdentity, tokenExpiresAtMs: number) {
  if (tokenExpiresAtMs < Date.now() + 60_000) return;
  verified.set(tokenKey(token), { user, expiresAtMs: Date.now() + 60_000 });
  if (verified.size > 20) {
    const oldest = verified.keys().next().value;
    if (oldest) verified.delete(oldest);
  }
}
