"use client";

import { useActionState } from "react";
import { generateGraphAction, type GraphState } from "@/app/actions/graph";
import { SubmitButton } from "@/components/ui";

export function GenerateForm({ spaceId, compact = false }: { spaceId: string; compact?: boolean }) {
  const [state, action] = useActionState(generateGraphAction, null as GraphState);
  if (compact) {
    return (
      <form action={action} className="flex items-center gap-2">
        <input type="hidden" name="spaceId" value={spaceId} />
        {state?.error ? (
          <p className="max-w-56 truncate text-xs text-[var(--danger)]" title={state.error}>
            {state.error}
          </p>
        ) : null}
        <SubmitButton small pendingLabel="Saving…">
          Save &amp; suggest
        </SubmitButton>
      </form>
    );
  }
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="spaceId" value={spaceId} />
      <SubmitButton pendingLabel="Saving…">Save &amp; suggest</SubmitButton>
      {state?.error ? <p className="text-sm text-[var(--danger)]">{state.error}</p> : null}
    </form>
  );
}
