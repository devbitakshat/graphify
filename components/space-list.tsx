"use client";

import Link from "next/link";
import { useState } from "react";
import { ProgressMeter } from "@/components/progress-meter";
import { depthLabels, goalLabels, levelLabels } from "@/lib/domain";
import type { SpaceSummary } from "@/lib/data/repository";

export function SpaceList({ spaces }: { spaces: SpaceSummary[] }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = spaces.filter((space) => {
    if (!needle) return true;
    const detail = [
      space.name,
      goalLabels[space.goal],
      levelLabels[space.level],
      depthLabels[space.depth],
      space.timeAvailable,
    ]
      .join(" ")
      .toLowerCase();
    return detail.includes(needle);
  });

  return (
    <>
      <label className="mt-6 grid max-w-md gap-1 text-sm">
        <span className="font-medium">Search spaces</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search learning spaces"
          className="w-full rounded-md border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </label>
      {shown.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">No learning spaces match that search.</p>
      ) : (
        <ul className="mt-8 grid gap-4">
          {shown.map((space) => (
            <li key={space.id}>
              <Link href={`/spaces/${space.id}`} className="block rounded-xl border border-[var(--line)] bg-[var(--card)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{space.name}</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {goalLabels[space.goal]} · {levelLabels[space.level]} · {depthLabels[space.depth]} · {space.timeAvailable}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressMeter understood={space.understood} total={space.total} nodes={space.nodes} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
