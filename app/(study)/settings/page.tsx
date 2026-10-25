import Link from "next/link";
import { AiSettingsForm } from "@/components/ai-settings-form";
import { aiProviders } from "@/lib/ai/providers";
import { getAiSummary } from "@/lib/ai/settings";
import { requireUser } from "@/lib/auth/current-user";
import { safeNext } from "@/lib/auth/safe-next";

export const metadata = { title: "AI settings" };
export const instant = false;

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const nextPath = safeNext(params.next);
  const user = await requireUser();
  const current = await getAiSummary(user.id);
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">{current ? "AI settings" : "Connect your AI model"}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {current
          ? `Graphs and definitions use ${aiProviders[current.provider].label} · ${current.model}.`
          : "Graphily builds graphs and definitions with your own model. Pick a provider and model, then paste your API key to create learning spaces."}
      </p>
      <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--card)] p-5">
        <AiSettingsForm current={current} nextPath={nextPath} />
      </div>
      {current ? (
        <Link href={nextPath} className="mt-4 inline-block text-sm text-[var(--accent)]">
          Back
        </Link>
      ) : null}
    </main>
  );
}
