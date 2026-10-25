import assert from "node:assert/strict";
import test from "node:test";
import { accessTokenFromCookies, authCookieName } from "./session-cookie";

const url = "https://exampleproject.supabase.co";

test("reads an access token from the Supabase auth cookie", () => {
  const name = authCookieName(url);
  const value = JSON.stringify({ access_token: "token-a", expires_at: 1_900_000_000 });
  const found = accessTokenFromCookies([{ name, value }], url);
  assert.equal(found?.token, "token-a");
  assert.equal(found?.expiresAtMs, 1_900_000_000_000);
});

test("joins chunked base64 auth cookies", () => {
  const name = authCookieName(url);
  const encoded = `base64-${Buffer.from(
    JSON.stringify({ access_token: "token-b", expires_at: 1_800_000_000 }),
    "utf8",
  ).toString("base64url")}`;
  const found = accessTokenFromCookies(
    [
      { name: `${name}.0`, value: encoded.slice(0, 12) },
      { name: `${name}.1`, value: encoded.slice(12) },
    ],
    url,
  );
  assert.equal(found?.token, "token-b");
});
