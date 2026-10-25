"use client";

import { useActionState, useState } from "react";
import { saveAiSettingsAction, type AiSettingsState } from "@/app/actions/ai-settings";
import { Field, SelectInput, SubmitButton, TextInput } from "@/components/ui";
import { aiProviderIds, aiProviders, type AiProvider } from "@/lib/ai/providers";
import type { AiSummary } from "@/lib/ai/settings";

export function AiSettingsForm({ current, nextPath }: { current: AiSummary | null; nextPath: string }) {
  const [state, action] = useActionState(saveAiSettingsAction, null as AiSettingsState);
  const [provider, setProvider] = useState<AiProvider>(current?.provider ?? "openai");
  const [model, setModel] = useState(current?.model ?? aiProviders.openai.models[0]);
  const info = aiProviders[provider];
  const keepsKey = current?.provider === provider;

  function chooseProvider(value: AiProvider) {
    setProvider(value);
    setModel(value === current?.provider ? current.model : aiProviders[value].models[0]);
  }

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={nextPath} />
      <Field label="Provider">
        <SelectInput name="provider" value={provider} onChange={(event) => chooseProvider(event.target.value as AiProvider)}>
          {aiProviderIds.map((id) => (
            <option key={id} value={id}>
              {aiProviders[id].label}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Preferred model">
        <TextInput
          name="model"
          list="ai-model-suggestions"
          value={model}
          onChange={(event) => setModel(event.target.value)}
          required
          maxLength={120}
          autoComplete="off"
          spellCheck={false}
        />
        <datalist id="ai-model-suggestions">
          {info.models.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </Field>
      <Field label="API key">
        <TextInput
          name="apiKey"
          type="password"
          placeholder={keepsKey ? `Saved key ${current?.keyHint}. Leave blank to keep it.` : "Paste your API key"}
          required={!keepsKey}
          maxLength={400}
          autoComplete="off"
          spellCheck={false}
        />
      </Field>
      <p className="text-xs text-[var(--muted)]">
        Get a key from{" "}
        <a href={info.keyUrl} target="_blank" rel="noreferrer" className="text-[var(--accent)]">
          {info.label}
        </a>
        . The key is encrypted before it is stored and is only used for your own graphs and definitions.
      </p>
      {state?.error ? <p className="text-sm text-[var(--danger)]">{state.error}</p> : null}
      <SubmitButton pendingLabel="Checking key…">{current ? "Save settings" : "Save and continue"}</SubmitButton>
    </form>
  );
}
