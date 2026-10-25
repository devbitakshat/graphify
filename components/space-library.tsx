"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { priorityLabels, statusLabels, typeLabels, type GraphConcept } from "@/lib/domain";

export function SpaceLibrary({
  spaceId,
  captured,
  added,
  next,
  middle,
}: {
  spaceId: string;
  captured: GraphConcept[];
  added: GraphConcept[];
  next: GraphConcept[];
  middle: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = (concept: GraphConcept) => !needle || concept.title.toLowerCase().includes(needle);
  const shownNext = next.filter(matches);
  const shownCaptured = captured.filter(matches);
  const shownAdded = added.filter(matches);
  const nothingMatches = needle.length > 0 && shownNext.length + shownCaptured.length + shownAdded.length === 0;

  return (
    <>
      <label className="mt-6 grid max-w-md gap-1 text-sm">
        <span className="font-medium">Search topics</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search this learning space"
          className="w-full rounded-md border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </label>

      {shownNext.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-sm font-semibold">Learn next</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {shownNext.map((concept) => (
              <li key={concept.id}>
                <Link href={`/spaces/${spaceId}/graph?concept=${concept.id}`} className="button button-secondary">
                  {concept.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {middle}

      {nothingMatches ? <p className="mt-8 text-sm text-[var(--muted)]">No topics match that search.</p> : null}
      <ConceptGroup
        title="Captured by you"
        spaceId={spaceId}
        concepts={shownCaptured}
        empty={needle ? "" : "Optional — generate from the space topic first, or add a concept you want to understand."}
      />
      <ConceptGroup
        title="Added by the graph"
        spaceId={spaceId}
        concepts={shownAdded}
        empty={needle ? "" : "Generate a graph to see topic suggestions and missing prerequisites."}
      />
    </>
  );
}

function ConceptGroup({
  title,
  spaceId,
  concepts,
  empty,
}: {
  title: string;
  spaceId: string;
  concepts: GraphConcept[];
  empty: string;
}) {
  if (concepts.length === 0 && !empty) return null;
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      {concepts.length === 0 ? <p className="mt-2 text-sm text-[var(--muted)]">{empty}</p> : null}
      <ul className="mt-3 grid gap-2">
        {concepts.map((concept) => (
          <li key={concept.id} className="rounded-lg border border-[var(--line)] bg-[var(--card)] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Link href={`/spaces/${spaceId}/graph?concept=${concept.id}`} className="font-medium">
                  {concept.title}
                </Link>
                <p className="text-sm text-[var(--muted)]">
                  {typeLabels[concept.type]} · {priorityLabels[concept.priority]} · {statusLabels[concept.status]}
                </p>
              </div>
            </div>
            {concept.prerequisiteReason ? <p className="mt-2 text-sm">{concept.prerequisiteReason}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
