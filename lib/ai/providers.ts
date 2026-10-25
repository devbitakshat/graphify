export const aiProviders = {
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4o"],
    keyUrl: "https://platform.openai.com/api-keys",
  },
  groq: {
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    models: ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "llama-3.3-70b-versatile"],
    keyUrl: "https://console.groq.com/keys",
  },
  gemini: {
    label: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    models: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"],
    keyUrl: "https://aistudio.google.com/apikey",
  },
  openrouter: {
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    models: ["openai/gpt-4o-mini", "anthropic/claude-sonnet-4", "google/gemini-2.5-flash"],
    keyUrl: "https://openrouter.ai/keys",
  },
} as const;

export type AiProvider = keyof typeof aiProviders;

export const aiProviderIds = Object.keys(aiProviders) as AiProvider[];

export function isAiProvider(value: string): value is AiProvider {
  return Object.hasOwn(aiProviders, value);
}

export function isModelName(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,119}$/.test(value);
}
