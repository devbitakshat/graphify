import Link from "next/link";
import { notFound } from "next/navigation";
import { SpacesIcon } from "@/components/nav-icons";
import { GenerateForm } from "@/components/generate-form";
import { ProgressMeter } from "@/components/progress-meter";
import { SpaceLibrary } from "@/components/space-library";
import { AddConceptForm, DeleteSpaceButton, SettingsForm } from "@/components/space-forms";
import { requireUser } from "@/lib/auth/current-user";
import { getGraphView } from "@/lib/data/repository";

export const metadata = { title: "Learning space" };
export const instant = false;

export default async function Page({ params }: { params: Promise<{ spaceId: string }> }) {
  const user = await requireUser();
  const { spaceId } = await params;
  const graph = await getGraphView(user.id, spaceId);
  if (!graph) notFound();
  const captured = graph.concepts.filter((concept) => concept.origin === "user");
  const added = graph.concepts.filter((concept) => concept.origin === "ai");
  const next = graph.nextConceptIds
    .map((id) => graph.concepts.find((concept) => concept.id === id))
    .filter((concept) => concept != null);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{graph.space.name}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {captured.length} captured · {added.length} added by the graph
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard" className="button button-secondary icon-button" aria-label="Spaces">
            <SpacesIcon />
          </Link>
          <Link href={`/spaces/${graph.space.id}/graph`} className="button">Open graph</Link>
          <DeleteSpaceButton spaceId={graph.space.id} />
        </div>
      </div>
      <div className="mt-4 max-w-md">
        <ProgressMeter
          understood={graph.progress.understood}
          total={graph.progress.total}
          nodes={graph.progress.nodes}
        />
      </div>

      <section id="settings" className="mt-8 max-w-xl scroll-mt-6 rounded-xl border border-[var(--line)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="mt-1 mb-4 text-sm text-[var(--muted)]">Generate uses these limits. It recalculates priorities and AI links.</p>
        <SettingsForm key={graph.space.updatedAt} space={graph.space} />
      </section>

      <SpaceLibrary
        spaceId={graph.space.id}
        captured={captured}
        added={added}
        next={next}
        middle={
          <>
            <section className="mt-8 max-w-xl rounded-xl border border-[var(--line)] bg-[var(--card)] p-5">
              <h2 className="text-lg font-semibold">Add a concept</h2>
              <p className="mt-1 mb-4 text-sm text-[var(--muted)]">Save something you do not understand yet. It will not disappear when you regenerate.</p>
              <AddConceptForm spaceId={graph.space.id} concepts={graph.concepts} />
            </section>

            <section className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--card)] p-5">
              <h2 className="text-lg font-semibold">Save & Generate</h2>
              <div className="mt-3">
                <GenerateForm spaceId={graph.space.id} />
              </div>
              {graph.generation ? <p className="mt-3 text-sm text-[var(--muted)]">{graph.generation.summary}</p> : null}
            </section>
          </>
        }
      />
    </main>
  );
}
