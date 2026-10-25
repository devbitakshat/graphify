import Link from "next/link";
import { SpaceList } from "@/components/space-list";
import { requireAiSetup } from "@/lib/ai/require";
import { requireUser } from "@/lib/auth/current-user";
import { listSpaces } from "@/lib/data/repository";

export const metadata = { title: "Dashboard" };
export const instant = false;

export default async function Page() {
  const user = await requireUser();
  await requireAiSetup(user.id);
  const spaces = await listSpaces(user.id);
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Learning spaces</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Each space keeps the concepts you capture and the graph built from them.</p>
        </div>
        <Link href="/spaces/new" className="button">New space</Link>
      </div>
      {spaces.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-[var(--line)] bg-[var(--card)] p-8">
          <p className="font-medium">No learning spaces yet.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Create one for a course, a job search, or a project you are studying.</p>
        </div>
      ) : (
        <SpaceList spaces={spaces} />
      )}
    </main>
  );
}
