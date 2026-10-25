"use server";

import { redirect } from "next/navigation";
import { loginFailureMessage } from "@/lib/auth/login-error";
import { safeNext } from "@/lib/auth/safe-next";
import { getSiteUrl } from "@/lib/auth/site-url";
import { upsertProfile } from "@/lib/data/repository";
import { identityOf, rememberAuthUser } from "@/lib/supabase/auth-cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthState = { error: string } | { message: string } | null;

function read(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function rememberSession(user: { id: string; email?: string | null; user_metadata?: { name?: unknown } }, session: { access_token?: string; expires_at?: number } | null) {
  const identity = identityOf(user);
  if (!identity || !session?.access_token || !session.expires_at) return;
  rememberAuthUser(session.access_token, identity, session.expires_at * 1000);
}

export async function signup(_state: AuthState, formData: FormData): Promise<AuthState> {
  const name = read(formData, "name");
  const email = read(formData, "email").toLowerCase();
  const password = read(formData, "password");
  const next = safeNext(read(formData, "next"));
  if (name.length < 1 || name.length > 80) return { error: "Enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email." };
  if (password.length < 8 || password.length > 200) return { error: "Use a password of at least 8 characters." };

  const siteUrl = await getSiteUrl();
  const emailRedirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

  const supabase = await createSupabaseServerClient({ persist: "required" });
  let data;
  let error;
  try {
    ({ data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo,
      },
    }));
  } catch {
    return { error: "Could not create the account. Try again." };
  }
  if (error) {
    return { error: error.message };
  }
  if (!data.user) {
    return { error: "Could not create the account." };
  }

  if (!data.session) {
    return {
      message: "Check your email for a confirmation link. After you confirm, you can sign in.",
    };
  }

  try {
    await upsertProfile({ id: data.user.id, email, name });
  } catch (profileError) {
    return {
      error: profileError instanceof Error ? profileError.message : "Could not create the account.",
    };
  }

  rememberSession(data.user, data.session);
  redirect(next);
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = read(formData, "email").toLowerCase();
  const password = read(formData, "password");
  const next = safeNext(read(formData, "next"));
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createSupabaseServerClient({ persist: "required" });
  let data;
  let error;
  try {
    ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
  } catch {
    return { error: "Could not keep you signed in. Try again." };
  }
  if (error || !data.user || !data.session) {
    if (error && error.code !== "invalid_credentials") {
      console.error(`Sign-in failed: ${error.name} ${error.status ?? ""} ${error.message}`);
    }
    return { error: loginFailureMessage(error) };
  }

  const name =
    (typeof data.user.user_metadata?.name === "string" && data.user.user_metadata.name.trim()) ||
    email.split("@")[0] ||
    "Learner";
  try {
    await upsertProfile({ id: data.user.id, email, name });
  } catch (profileError) {
    return {
      error:
        profileError instanceof Error
          ? profileError.message
          : "Signed in, but could not load your profile. Check DATABASE_URL.",
    };
  }

  rememberSession(data.user, data.session);
  redirect(next);
}

export async function logout() {
  try {
    const supabase = await createSupabaseServerClient({ persist: "required" });
    await supabase.auth.signOut();
  } catch {
    // Leave the page even if the session cookie could not be cleared.
  }
  redirect("/");
}
