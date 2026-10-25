export type AuthFailure = {
  message?: string;
  code?: string;
  status?: number;
  name?: string;
};

export function loginFailureMessage(error: AuthFailure | null): string {
  const code = error?.code ?? "";
  const name = error?.name ?? "";
  const message = (error?.message ?? "").toLowerCase();

  if (code === "email_not_confirmed" || message.includes("not confirmed")) {
    return "Confirm your email first, then sign in.";
  }
  if (code === "over_request_rate_limit" || error?.status === 429 || message.includes("rate limit")) {
    return "Too many sign-in attempts. Wait a minute and try again.";
  }
  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }
  if (name === "AuthRetryableFetchError" || error?.status === 0 || message.includes("fetch")) {
    return "Could not reach the sign-in service. Try again.";
  }
  return "Could not sign in. Try again in a moment.";
}
