"use server";

import { redirect } from "next/navigation";
import { aiProviders, isAiProvider, isModelName } from "@/lib/ai/providers";
import { getAiConfig, saveAiSettings } from "@/lib/ai/settings";
import { requireUser } from "@/lib/auth/current-user";
import { safeNext } from "@/lib/auth/safe-next";
import { readString } from "@/lib/forms";
import { verifyModelAccess } from "@/lib/graph/llm";

export type AiSettingsState = { error: string } | null;

export async function saveAiSettingsAction(_state: AiSettingsState, formData: FormData): Promise<AiSettingsState> {
  const user = await requireUser();
  const provider = readString(formData, "provider");
  const model = readString(formData, "model");
  const typedKey = readString(formData, "apiKey");
  const next = safeNext(readString(formData, "next"));

  if (!isAiProvider(provider)) return { error: "Choose a provider." };
  if (!isModelName(model)) return { error: "Enter a model name, for example gpt-4o-mini." };
  if (typedKey.length > 400 || /\s/.test(typedKey)) return { error: "That API key does not look right." };

  let apiKey = typedKey;
  if (!apiKey) {
    const current = await getAiConfig(user.id);
    if (!current || current.provider !== provider) return { error: "Paste your API key." };
    apiKey = current.apiKey;
  }

  const problem = await verifyModelAccess({ provider, baseUrl: aiProviders[provider].baseUrl, model, apiKey });
  if (problem) return { error: problem };

  try {
    await saveAiSettings(user.id, { provider, model, apiKey });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save your settings." };
  }
  redirect(next);
}
