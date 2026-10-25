import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { findUserById, upsertProfile } from "../data/repository";
import { cachedAuthUser, identityOf, rememberAuthUser, type AuthIdentity } from "../supabase/auth-cache";
import { requireSupabaseEnv } from "../supabase/env";
import { createSupabaseServerClient } from "../supabase/server";
import { accessTokenFromCookies } from "../supabase/session-cookie";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

const profiles = new Map<string, { user: CurrentUser; until: number }>();

function cachedProfile(id: string) {
  const hit = profiles.get(id);
  if (!hit || hit.until <= Date.now()) {
    if (hit) profiles.delete(id);
    return null;
  }
  return hit.user;
}

function rememberProfile(user: CurrentUser) {
  profiles.set(user.id, { user, until: Date.now() + 5 * 60_000 });
}

async function presentedToken() {
  const jar = await cookies();
  const { url } = requireSupabaseEnv();
  return accessTokenFromCookies(jar.getAll(), url);
}

async function profileFor(identity: AuthIdentity) {
  const cached = cachedProfile(identity.id);
  if (cached) return cached;
  const existing = await findUserById(identity.id);
  const profile = existing
    ? { id: existing.id, name: existing.name, email: existing.email }
    : await upsertProfile(identity);
  const user = { id: profile.id, name: profile.name, email: profile.email };
  rememberProfile(user);
  return user;
}

function bubblePrerender(error: unknown) {
  if (typeof error !== "object" || error === null || !("digest" in error)) return;
  const digest = (error as { digest?: unknown }).digest;
  if (digest === "HANGING_PROMISE_REJECTION" || (typeof digest === "string" && digest.startsWith("NEXT_"))) {
    throw error;
  }
}

async function userFromIdentity(identity: AuthIdentity): Promise<CurrentUser> {
  try {
    return await profileFor(identity);
  } catch (error) {
    bubblePrerender(error);
    return { id: identity.id, name: identity.name, email: identity.email };
  }
}

export const getOptionalUser = cache(async (): Promise<CurrentUser | null> => {
  // Supabase JWT validation uses Date.now(); defer until a real request.
  await connection();
  try {
    const presented = await presentedToken();
    if (presented && presented.expiresAtMs - Date.now() > 60_000) {
      const known = cachedAuthUser(presented.token);
      if (known) return userFromIdentity(known);
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const identity = user ? identityOf(user) : null;
    if (!identity) return null;
    const fresh = await presentedToken();
    if (fresh) rememberAuthUser(fresh.token, identity, fresh.expiresAtMs);
    return userFromIdentity(identity);
  } catch (error) {
    bubblePrerender(error);
    return null;
  }
});

export async function requireUser() {
  const user = await getOptionalUser();
  if (!user) redirect("/login");
  return user;
}
