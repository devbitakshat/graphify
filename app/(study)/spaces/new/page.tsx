import { NewSpaceForm } from "@/components/space-forms";
import { requireAiSetup } from "@/lib/ai/require";
import { requireUser } from "@/lib/auth/current-user";

export const metadata = { title: "New learning space" };
export const instant = false;

export default async function Page() {
  const user = await requireUser();
  await requireAiSetup(user.id, "/spaces/new");
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">New learning space</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Level sets how many related topics appear under each concept you capture: 2 for beginner, 4 for intermediate, and 6 for advanced. Depth limits how advanced those topics are.
      </p>
      <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--card)] p-5">
        <NewSpaceForm />
      </div>
    </main>
  );
}
