"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { addConceptAction, type ConceptState } from "@/app/actions/concepts";
import { createSpaceAction, deleteSpaceAction, updateSpaceAction, type SpaceState } from "@/app/actions/spaces";
import { SettingsIcon } from "@/components/nav-icons";
import { Field, SelectInput, SubmitButton, TextArea, TextInput } from "@/components/ui";
import {
  depthLabels,
  depths,
  goalLabels,
  goals,
  levelLabels,
  levels,
  preferenceLabels,
  preferences,
  statusLabels,
  statuses,
  timeOptions,
  type GraphConcept,
  type GraphView,
} from "@/lib/domain";

export function SettingsForm({ space }: { space: GraphView["space"] }) {
  const [state, action] = useActionState(updateSpaceAction, null as SpaceState);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="spaceId" value={space.id} />
      <Field label="Name">
        <TextInput name="name" defaultValue={space.name} required maxLength={80} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Goal">
          <SelectInput name="goal" defaultValue={space.goal}>
            {goals.map((goal) => (
              <option key={goal} value={goal}>
                {goalLabels[goal]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Level">
          <SelectInput name="level" defaultValue={space.level}>
            {levels.map((level) => (
              <option key={level} value={level}>
                {levelLabels[level]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Depth">
          <SelectInput name="depth" defaultValue={space.depth}>
            {depths.map((depth) => (
              <option key={depth} value={depth}>
                {depthLabels[depth]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Time available">
          <SelectInput name="timeAvailable" defaultValue={space.timeAvailable}>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>
      <Field label="Resource preference">
        <SelectInput name="resourcePreference" defaultValue={space.resourcePreference}>
          {preferences.map((preference) => (
            <option key={preference} value={preference}>
              {preferenceLabels[preference]}
            </option>
          ))}
        </SelectInput>
      </Field>
      {state?.error ? <p className="text-sm text-[var(--danger)]">{state.error}</p> : null}
      <SubmitButton pendingLabel="Saving…">Save settings</SubmitButton>
    </form>
  );
}

export function SettingsButton({ spaceId, compact = false }: { spaceId: string; compact?: boolean }) {
  return (
    <Link
      href={`/spaces/${spaceId}#settings`}
      className={
        compact ? "button button-secondary button-small icon-button" : "button button-secondary icon-button"
      }
      aria-label="Settings"
      data-hint="Settings"
    >
      <SettingsIcon />
    </Link>
  );
}

export function AddConceptForm({
  spaceId,
  concepts,
  stacked = false,
  defaultParentId = "",
}: {
  spaceId: string;
  concepts: GraphConcept[];
  stacked?: boolean;
  defaultParentId?: string;
}) {
  const [state, action] = useActionState(addConceptAction, null as ConceptState);
  const formKey = state && "ok" in state ? state.savedAt : 0;
  const parentId = defaultParentId && concepts.some((concept) => concept.id === defaultParentId) ? defaultParentId : "";

  return (
    <form action={action} className="grid gap-3" key={`${formKey}:${parentId}`}>
      <input type="hidden" name="spaceId" value={spaceId} />
      <Field label="Concept">
        <TextInput name="title" placeholder="e.g. Types of APIs" required maxLength={120} />
      </Field>
      <Field label="Source URL">
        <TextInput name="url" type="url" placeholder="https://" />
      </Field>
      <Field label="Note">
        <TextArea name="note" maxLength={500} placeholder="Where you saw it, and what was confusing" />
      </Field>
      <div className={stacked ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
        <Field label="Parent topic">
          <SelectInput name="parentId" defaultValue={parentId}>
            <option value="">Decide for me</option>
            {concepts.map((concept) => (
              <option key={concept.id} value={concept.id}>
                {concept.title}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Knowledge state">
          <SelectInput name="status" defaultValue="unfamiliar">
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>
      {state && "error" in state ? <p className="text-sm text-[var(--danger)]">{state.error}</p> : null}
      <SubmitButton pendingLabel="Adding…">Add concept</SubmitButton>
    </form>
  );
}

export function NewSpaceForm() {
  const [state, action] = useActionState(createSpaceAction, null as SpaceState);
  return (
    <form action={action} className="grid gap-3">
      <Field label="Name">
        <TextInput name="name" placeholder="Backend Development" required maxLength={80} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Goal">
          <SelectInput name="goal" defaultValue="interview">
            {goals.map((goal) => (
              <option key={goal} value={goal}>{goalLabels[goal]}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Level">
          <SelectInput name="level" defaultValue="beginner">
            {levels.map((level) => (
              <option key={level} value={level}>{levelLabels[level]}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Depth">
          <SelectInput name="depth" defaultValue="practitioner">
            {depths.map((depth) => (
              <option key={depth} value={depth}>{depthLabels[depth]}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Time available">
          <SelectInput name="timeAvailable" defaultValue="15 hours">
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </SelectInput>
        </Field>
      </div>
      <Field label="Resource preference">
        <SelectInput name="resourcePreference" defaultValue="any">
          {preferences.map((preference) => (
            <option key={preference} value={preference}>{preferenceLabels[preference]}</option>
          ))}
        </SelectInput>
      </Field>
      {state?.error ? <p className="text-sm text-[var(--danger)]">{state.error}</p> : null}
      <SubmitButton pendingLabel="Creating…">Create learning space</SubmitButton>
    </form>
  );
}

export function DeleteSpaceButton({ spaceId }: { spaceId: string }) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button type="button" className="button button-danger" onClick={() => setArmed(true)}>
        Delete space
      </button>
    );
  }
  return (
    <form action={deleteSpaceAction}>
      <input type="hidden" name="spaceId" value={spaceId} />
      <SubmitButton pendingLabel="Deleting…" variant="danger">Confirm delete</SubmitButton>
    </form>
  );
}
