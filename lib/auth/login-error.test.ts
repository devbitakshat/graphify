import assert from "node:assert/strict";
import test from "node:test";
import { authFetch } from "../supabase/auth-fetch";
import { loginFailureMessage } from "./login-error";

test("only a rejected password is described as incorrect", () => {
  assert.equal(loginFailureMessage({ code: "invalid_credentials" }), "Email or password is incorrect.");
  assert.equal(
    loginFailureMessage({ code: "email_not_confirmed", message: "Email not confirmed" }),
    "Confirm your email first, then sign in.",
  );
  assert.equal(
    loginFailureMessage({ code: "over_request_rate_limit", status: 429 }),
    "Too many sign-in attempts. Wait a minute and try again.",
  );
  assert.equal(
    loginFailureMessage({ name: "AuthRetryableFetchError", status: 0, message: "fetch failed" }),
    "Could not reach the sign-in service. Try again.",
  );
  assert.equal(loginFailureMessage({ message: "something else" }), "Could not sign in. Try again in a moment.");
});

test("authFetch retries once when the connection drops", async () => {
  const original = globalThis.fetch;
  const originalWarn = console.warn;
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    if (calls === 1) throw new TypeError("fetch failed");
    return new Response("ok");
  }) as typeof fetch;
  console.warn = () => {};
  try {
    const response = await authFetch("https://example.test/auth", { method: "POST", body: "{}" });
    assert.equal(await response.text(), "ok");
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = original;
    console.warn = originalWarn;
  }
});

test("authFetch marks the request so Next does not cancel it", async () => {
  const original = globalThis.fetch;
  const patched = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const internal = (init as { next?: { internal?: boolean } } | undefined)?.next?.internal === true;
    if (!internal) throw new Error("fetch failed");
    return new Response("ok");
  }) as typeof fetch & { _nextOriginalFetch?: typeof fetch };
  patched._nextOriginalFetch = (async () => {
    throw new Error("fetch failed");
  }) as typeof fetch;
  globalThis.fetch = patched;
  try {
    const response = await authFetch("https://example.test/auth", { signal: AbortSignal.abort() });
    assert.equal(await response.text(), "ok");
  } finally {
    globalThis.fetch = original;
  }
});
