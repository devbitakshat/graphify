import Link from "next/link";
import { notFound } from "next/navigation";
import { SpacesIcon } from "@/components/nav-icons";
import { KnowledgeGraph } from "@/components/knowledge-graph";
import { ProgressMeter } from "@/components/progress-meter";
import { GenerateForm } from "@/components/generate-form";
import { requireUser } from "@/lib/auth/current-user";
import { getGraphView } from "@/lib/data/repository";

export const metadata = { title: "Knowledge graph" };
/** Auth + DB reads; allow blocking so Suspense does not stick on soft nav. */
export const instant = false;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ spaceId: string }>;
  searchParams: Promise<{ concept?: string }>;
}) {
  const user = await requireUser();
  const { spaceId } = await params;
  const { concept } = await searchParams;
  const graph = await getGraphView(user.id, spaceId);
  if (!graph) notFound();

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--background)] px-4 py-1">
        <Link href="/dashboard" className="button button-secondary button-small icon-button" aria-label="Spaces" data-hint="Spaces">
          <SpacesIcon />
        </Link>
        <Link
          href={`/spaces/${graph.space.id}`}
          className="button button-secondary button-small"
          data-hint="Open learning space"
        >
          {graph.space.name}
        </Link>
        <div className="min-w-0 max-w-md flex-1">
          <ProgressMeter
            compact
            understood={graph.progress.understood}
            total={graph.progress.total}
            nodes={graph.progress.nodes}
          />
        </div>
        <div className="ml-auto">
          <GenerateForm spaceId={graph.space.id} compact />
        </div>
      </div>
      <KnowledgeGraph graph={graph} initialSelectedId={concept ?? null} />
    </main>
  );
}
