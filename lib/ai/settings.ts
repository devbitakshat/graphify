import { dbOne, dbQuery } from "../db/client";
import { decryptSecret, encryptSecret } from "./crypto";
import { aiProviders, isAiProvider, type AiProvider } from "./providers";

export type AiConfig = {
  provider: AiProvider;
  baseUrl: string;
  model: string;
  apiKey: string;
};

export type AiSummary = {
  provider: AiProvider;
  model: string;
  keyHint: string;
};

type SettingsRow = {
  provider: string;
  model: string;
  api_key_ciphertext: string;
  api_key_hint: string;
};

async function settingsRow(userId: string) {
  return dbOne<SettingsRow>(
    "select provider, model, api_key_ciphertext, api_key_hint from ai_settings where user_id = $1",
    [userId],
  );
}

export function keyHint(apiKey: string) {
  return apiKey.length > 8 ? `…${apiKey.slice(-4)}` : "…";
}

export async function getAiSummary(userId: string): Promise<AiSummary | null> {
  const row = await settingsRow(userId);
  if (!row || !isAiProvider(row.provider)) return null;
  return { provider: row.provider, model: row.model, keyHint: row.api_key_hint };
}

/** Decrypted settings for model calls. Null when the user has no usable key. */
export async function getAiConfig(userId: string): Promise<AiConfig | null> {
  const row = await settingsRow(userId);
  if (!row || !isAiProvider(row.provider)) return null;
  try {
    return {
      provider: row.provider,
      baseUrl: aiProviders[row.provider].baseUrl,
      model: row.model,
      apiKey: decryptSecret(row.api_key_ciphertext),
    };
  } catch {
    return null;
  }
}

export async function saveAiSettings(userId: string, input: { provider: AiProvider; model: string; apiKey: string }) {
  await dbQuery(
    `insert into ai_settings (user_id, provider, model, api_key_ciphertext, api_key_hint)
     values ($1, $2, $3, $4, $5)
     on conflict (user_id) do update
     set provider = excluded.provider, model = excluded.model, api_key_ciphertext = excluded.api_key_ciphertext,
         api_key_hint = excluded.api_key_hint, updated_at = now()`,
    [userId, input.provider, input.model, encryptSecret(input.apiKey), keyHint(input.apiKey)],
  );
}
