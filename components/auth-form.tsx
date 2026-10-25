"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, signup, type AuthState } from "@/app/actions/auth";
import { Field, SubmitButton, TextInput } from "@/components/ui";

export function AuthForm({ mode, nextPath }: { mode: "login" | "signup"; nextPath: string }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction] = useActionState(action, null as AuthState);
  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="next" value={nextPath} />
      {mode === "signup" ? (
        <Field label="Name">
          <TextInput name="name" autoComplete="name" required maxLength={80} />
        </Field>
      ) : null}
      <Field label="Email">
        <TextInput name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password">
        <TextInput name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} />
      </Field>
      {state && "error" in state ? <p className="text-sm text-[var(--danger)]">{state.error}</p> : null}
      {state && "message" in state ? <p className="text-sm text-[var(--muted)]">{state.message}</p> : null}
      <SubmitButton pendingLabel={mode === "login" ? "Signing in…" : "Creating account…"}>
        {mode === "login" ? "Sign in" : "Create account"}
      </SubmitButton>
      <p className="text-sm text-[var(--muted)]">
        {mode === "login" ? (
          <>
            New here? <Link href="/signup" className="text-[var(--accent)]">Create an account</Link>
          </>
        ) : (
          <>
            Already have an account? <Link href="/login" className="text-[var(--accent)]">Sign in</Link>
          </>
        )}
      </p>
    </form>
  );
}
