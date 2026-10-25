import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

process.env.PGLITE_DIR = mkdtempSync(path.join(tmpdir(), "gapmap-ai-"));
process.env.ALLOW_PGLITE = "1";
process.env.AI_KEY_SECRET = "test-secret-that-is-long-enough-for-aes-256";
delete process.env.DATABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_URL;

test("api keys are sealed and tampering is rejected", async () => {
  const { decryptSecret, encryptSecret } = await import("./crypto");
  const sealed = encryptSecret("sk-live-abcdef123456");
  assert.ok(!sealed.includes("sk-live"));
  assert.notEqual(encryptSecret("sk-live-abcdef123456"), sealed);
  assert.equal(decryptSecret(sealed), "sk-live-abcdef123456");
  const parts = sealed.split(":");
  parts[3] = Buffer.from("other").toString("base64");
  assert.throws(() => decryptSecret(parts.join(":")));
});

test("each user gets only their own model settings", async () => {
  const { createUser } = await import("../data/repository");
  const { getAiConfig, getAiSummary, saveAiSettings } = await import("./settings");
  const { dbOne } = await import("../db/client");

  const owner = await createUser({ email: `byok-${Date.now()}@example.com`, name: "Owner" });
  const other = await createUser({ email: `byok-other-${Date.now()}@example.com`, name: "Other" });
  assert.equal(await getAiSummary(owner.id), null);
  assert.equal(await getAiConfig(owner.id), null);

  await saveAiSettings(owner.id, { provider: "groq", model: "openai/gpt-oss-20b", apiKey: "gsk_owner_key_9876" });
  assert.deepEqual(await getAiSummary(owner.id), { provider: "groq", model: "openai/gpt-oss-20b", keyHint: "…9876" });
  const config = await getAiConfig(owner.id);
  assert.equal(config?.apiKey, "gsk_owner_key_9876");
  assert.equal(config?.baseUrl, "https://api.groq.com/openai/v1");
  assert.equal(await getAiConfig(other.id), null);

  const stored = await dbOne<{ api_key_ciphertext: string }>("select api_key_ciphertext from ai_settings where user_id = $1", [owner.id]);
  assert.ok(stored && !stored.api_key_ciphertext.includes("gsk_owner"));

  await saveAiSettings(owner.id, { provider: "openai", model: "gpt-4o-mini", apiKey: "sk-new-key-1111" });
  assert.equal((await getAiConfig(owner.id))?.model, "gpt-4o-mini");
  assert.equal((await getAiConfig(owner.id))?.apiKey, "sk-new-key-1111");
});
