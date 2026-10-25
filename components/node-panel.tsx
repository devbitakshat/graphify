"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addRelationshipAction,
  removeConceptAction,
  removeRelationshipAction,
  setStatusAction,
  updateConceptAction,
} from "@/app/actions/concepts";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui";
import {
  priorityLabels,
  priorities,
  relationships,
  statusLabels,
  statuses,
  typeLabels,
  type GraphView,
  addedPath,
} from "@/lib/domain";
import { guidesFor } from "@/lib/graph/timeline";

export function NodePanel({
  graph,
  selectedId,
  onClear,
}: {
  graph: GraphView;
  selectedId: string | null;
  onClear: () => void;
}) {
  const concept = graph.concepts.find((item) => item.id === selectedId) ?? null;
  if (!concept) return null;
  return <Detail conceptId={concept.id} graph={graph} onClear={onClear} />;
}

function TimelineBranch({
  concept,
  index,
  added,
  graph,
  selectedId,
  startedId,
  coveringId,
  onSelect,
}: {
  concept: GraphView["concepts"][number];
  index?: number;
  added: GraphView["concepts"];
  graph: GraphView;
  selectedId: string | null;
  startedId: string;
  coveringId: string;
  onSelect: (conceptId: string) => void;
}) {
  const children = added.filter((item) => item.parentId === concept.id);
  const guides = guidesFor(concept.id, graph.concepts, graph.edges).sort((a, b) => a.title.localeCompare(b.title));
  return (
    <li>
      <button
        type="button"
        className={`text-left ${concept.id === selectedId ? "font-semibold text-[var(--accent)]" : ""}`}
        aria-current={concept.id === selectedId ? "true" : undefined}
        onClick={() => onSelect(concept.id)}
      >
        {index != null ? `${index + 1}. ` : ""}
        {concept.title}
        {concept.id === startedId ? <span className="text-[var(--muted)]"> · Started</span> : null}
        {concept.id === coveringId && concept.id !== startedId ? <span className="text-[var(--muted)]"> · Covering</span> : null}
      </button>
      {children.length > 0 || guides.length > 0 ? (
        <ul className="mt-1 grid gap-2 border-l border-[var(--line)] pl-3">
          {children.map((child) => (
            <TimelineBranch
              key={child.id}
              concept={child}
              added={added}
              graph={graph}
              selectedId={selectedId}
              startedId={startedId}
              coveringId={coveringId}
              onSelect={onSelect}
            />
          ))}
          {guides.map((guide) => (
            <li key={guide.id}>
              <button
                type="button"
                className={`text-left ${guide.id === selectedId ? "font-semibold text-[var(--accent)]" : ""}`}
                onClick={() => onSelect(guide.id)}
              >
                {guide.title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function LearningOrder({
  graph,
  selectedId,
  onSelect,
}: {
  graph: GraphView;
  selectedId: string | null;
  onSelect: (conceptId: string) => void;
}) {
  const added = addedPath(graph.concepts);
  const started = added[0];
  const covering = added[added.length - 1];
  const next = graph.nextConceptIds
    .map((id) => graph.concepts.find((concept) => concept.id === id))
    .filter((concept) => concept != null);
  return (
    <div className="grid gap-5 p-4">
      <p className="text-sm text-[var(--muted)]">
        {graph.space.name} starts the timeline. Captured concepts continue to the right. Select a bubble to reveal related topics. They stay faded until you open them.
      </p>
      {graph.generation ? (
        <p className="text-sm text-[var(--muted)]">
          {graph.generation.summary} Built with {graph.generation.model}.
        </p>
      ) : (
        <p className="text-sm text-[var(--muted)]">Generate a graph to add missing prerequisites and real resources.</p>
      )}
      {started && covering ? (
        <section>
          <h3 className="text-sm font-semibold">Timeline</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Started with {started.title}.</p>
          <p className="text-sm text-[var(--muted)]">Currently covering {covering.title}.</p>
          <ol className="mt-3 grid gap-3 text-sm">
            {added
              .filter((concept) => !concept.parentId || !added.some((other) => other.id === concept.parentId))
              .map((concept, index) => (
                <TimelineBranch
                  key={concept.id}
                  concept={concept}
                  index={index}
                  added={added}
                  graph={graph}
                  selectedId={selectedId}
                  startedId={started.id}
                  coveringId={covering.id}
                  onSelect={onSelect}
                />
              ))}
          </ol>
        </section>
      ) : (
        <p className="text-sm text-[var(--muted)]">Add a concept to start the timeline from {graph.space.name}.</p>
      )}
      <section>
        <h3 className="text-sm font-semibold">Learn next</h3>
        <ul className="mt-2 grid gap-2">
          {next.length === 0 ? <li className="text-sm text-[var(--muted)]">Nothing is ready. Add a concept or mark a prerequisite understood.</li> : null}
          {next.map((concept) => (
            <li key={concept.id}>
              <button
                type="button"
                className={`w-full rounded-md border px-3 py-2 text-left text-sm ${concept.id === selectedId ? "border-[var(--accent)] font-semibold" : "border-[var(--line)]"}`}
                aria-current={concept.id === selectedId ? "true" : undefined}
                onClick={() => onSelect(concept.id)}
              >
                {concept.title}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Detail({
  conceptId,
  graph,
  onClear,
}: {
  conceptId: string;
  graph: GraphView;
  onClear: () => void;
}) {
  const concept = graph.concepts.find((item) => item.id === conceptId);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  if (!concept) return null;

  const prerequisites = graph.edges
    .filter((edge) => edge.relationship === "required for" && edge.targetId === concept.id)
    .map((edge) => graph.concepts.find((item) => item.id === edge.sourceId))
    .filter((item) => item != null);
  const related = graph.edges.filter((edge) => edge.sourceId === concept.id || edge.targetId === concept.id);
  const resources = graph.resources.filter((resource) => resource.conceptId === concept.id);

  async function run(work: () => Promise<{ error: string } | { ok: true } | null>) {
    setError(null);
    setPending(true);
    try {
      const result = await work();
      if (result && "error" in result) setError(result.error);
      else router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            {concept.origin === "user" ? "Captured by you" : "Added by the graph"} · {typeLabels[concept.type]}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{concept.title}</h2>
        </div>
        <button type="button" className="button button-secondary" onClick={onClear}>
          Close
        </button>
      </div>

      {concept.origin === "ai" && concept.prerequisiteReason ? (
        <p className="rounded-md bg-[var(--notice)] px-3 py-2 text-sm">{concept.prerequisiteReason}</p>
      ) : null}

      <section className="grid gap-2 text-sm">
        <h3 className="font-semibold">Explanation</h3>
        <p>{concept.explanation || "No explanation yet. Generate the graph to fill this in."}</p>
        {concept.whyItMatters ? (
          <>
            <h3 className="font-semibold">Why it matters</h3>
            <p>{concept.whyItMatters}</p>
          </>
        ) : null}
        {concept.goalRelationship ? (
          <>
            <h3 className="font-semibold">Relationship to your goal</h3>
            <p>{concept.goalRelationship}</p>
          </>
        ) : null}
        {concept.example ? (
          <>
            <h3 className="font-semibold">Practical example</h3>
            <p>{concept.example}</p>
          </>
        ) : null}
      </section>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[var(--muted)]">Priority</dt>
          <dd>{priorityLabels[concept.priority]}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Status</dt>
          <dd>{statusLabels[concept.status]}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Effort</dt>
          <dd>{concept.effort || "Not estimated"}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Origin</dt>
          <dd>{concept.origin === "user" ? "You" : "AI"}</dd>
        </div>
      </dl>

      <section>
        <h3 className="text-sm font-semibold">Knowledge state</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              className={status === concept.status ? "button" : "button button-secondary"}
              disabled={pending}
              onClick={() => run(() => setStatusAction(concept.id, status))}
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold">Prerequisites</h3>
        <ul className="mt-2 grid gap-2">
          {prerequisites.length === 0 ? <li className="text-sm text-[var(--muted)]">None recorded.</li> : null}
          {prerequisites.map((item) => (
            <li key={item.id} className="text-sm">
              <span className="font-medium">{item.title}</span>
              {item.prerequisiteReason ? <span className="text-[var(--muted)]"> — {item.prerequisiteReason}</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold">Relationships</h3>
        <ul className="mt-2 grid gap-2">
          {related.length === 0 ? <li className="text-sm text-[var(--muted)]">None yet.</li> : null}
          {related.map((edge) => {
            const otherId = edge.sourceId === concept.id ? edge.targetId : edge.sourceId;
            const other = graph.concepts.find((item) => item.id === otherId);
            const outgoing = edge.sourceId === concept.id;
            return (
              <li key={edge.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {outgoing ? concept.title : other?.title} {edge.relationship} {outgoing ? other?.title : concept.title}
                </span>
                <button
                  type="button"
                  className="text-[var(--danger)]"
                  onClick={() => run(() => removeRelationshipAction(edge.id))}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
        <form
          className="mt-3 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            void run(() => addRelationshipAction(graph.space.id, formData));
          }}
        >
          <input type="hidden" name="sourceId" value={concept.id} />
          <Field label="Link this concept">
            <SelectInput name="relationship" defaultValue="required for">
              {relationships.map((relationship) => (
                <option key={relationship} value={relationship}>
                  {relationship}
                </option>
              ))}
            </SelectInput>
          </Field>
          <SelectInput name="targetId" defaultValue="">
            <option value="">Choose a concept</option>
            {graph.concepts
              .filter((item) => item.id !== concept.id)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
          </SelectInput>
          <button type="submit" className="button button-secondary" disabled={pending}>
            Add relationship
          </button>
        </form>
      </section>

      {(concept.sourceUrl || concept.sourceNote) && (
        <section className="text-sm">
          <h3 className="font-semibold">Captured context</h3>
          {concept.sourceNote ? <p className="mt-1">{concept.sourceNote}</p> : null}
          {concept.sourceUrl ? (
            <a className="mt-1 inline-block text-[var(--accent)]" href={concept.sourceUrl} target="_blank" rel="noreferrer">
              {concept.sourceUrl}
            </a>
          ) : null}
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold">Recommended resources</h3>
        <ul className="mt-2 grid gap-3">
          {resources.length === 0 ? (
            <li className="text-sm text-[var(--muted)]">No verified resources yet. Generate the graph to search for some.</li>
          ) : null}
          {resources.map((resource) => (
            <li key={resource.id} className="rounded-md border border-[var(--line)] p-3 text-sm">
              <a className="font-medium text-[var(--accent)]" href={resource.url} target="_blank" rel="noreferrer">
                {resource.title}
              </a>
              <p className="mt-1 text-[var(--muted)]">
                {resource.kind} · {resource.provider}
                {resource.duration ? ` · ${resource.duration}` : ""}
                {resource.isFree ? " · Free" : ""}
              </p>
              <p className="mt-1">{resource.whyRecommended}</p>
            </li>
          ))}
        </ul>
      </section>

      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          formData.set("status", concept.status);
          void run(() => updateConceptAction(concept.id, formData));
        }}
      >
        <h3 className="text-sm font-semibold">Edit</h3>
        <Field label="Name">
          <TextInput name="title" defaultValue={concept.title} required maxLength={120} />
        </Field>
        <Field label="Source URL">
          <TextInput name="url" type="url" defaultValue={concept.sourceUrl} />
        </Field>
        <Field label="Note">
          <TextArea name="note" defaultValue={concept.sourceNote} maxLength={500} />
        </Field>
        <Field label="Parent topic">
          <SelectInput name="parentId" defaultValue={concept.parentId ?? ""}>
            <option value="">Decide for me</option>
            {graph.concepts
              .filter((item) => item.id !== concept.id)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
          </SelectInput>
        </Field>
        <Field label="Priority">
          <SelectInput name="priority" defaultValue={concept.priority}>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <button type="submit" className="button button-secondary" disabled={pending}>
          Save changes
        </button>
      </form>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      {confirming ? (
        <button
          type="button"
          className="button button-danger"
          disabled={pending}
          onClick={() =>
            run(async () => {
              const result = await removeConceptAction(concept.id);
              if (!result || !("error" in result)) onClear();
              return result;
            })
          }
        >
          {concept.origin === "user" ? "Confirm delete" : "Confirm remove"}
        </button>
      ) : (
        <button type="button" className="button button-danger" onClick={() => setConfirming(true)}>
          {concept.origin === "user" ? "Delete captured concept" : "Remove AI concept"}
        </button>
      )}
    </div>
  );
}
