import { Suspense } from "react";
import Link from "next/link";
import { getOptionalUser } from "@/lib/auth/current-user";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16">
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="" width={28} height={28} className="rounded-md" />
        Graphily
      </p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Save what you do not know. See what it depends on.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[var(--muted)]">
        Capture unfamiliar concepts while you study. Graphily turns them into a personal graph: the gaps you wrote down, the prerequisites you are missing, the order to learn them, and a real place to start.
      </p>
      <Suspense fallback={<div className="mt-8 h-10" />}>
        <HomeActions />
      </Suspense>
      <ol className="mt-14 grid gap-4 sm:grid-cols-3">
        <li className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-4">
          <p className="text-sm font-semibold">1. Capture</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Add the terms you actually hit, with the source and a short note.</p>
        </li>
        <li className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-4">
          <p className="text-sm font-semibold">2. Generate</p>
          <p className="mt-2 text-sm text-[var(--muted)]">The graph adds missing prerequisites and named relationships, without dropping your concepts.</p>
        </li>
        <li className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-4">
          <p className="text-sm font-semibold">3. Learn</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Open a node for the explanation, the reason it was added, and verified resources.</p>
        </li>
      </ol>
      <div className="mt-10 rounded-xl border border-[var(--line)] bg-[var(--card)] p-5 text-sm">
        <p className="font-semibold">Relationships mean something</p>
        <ul className="mt-3 grid gap-1 text-[var(--muted)]">
          <li>HTTP is required for REST API</li>
          <li>REST API is a type of API</li>
          <li>Authentication uses JWT</li>
          <li>Caching supports Scalability</li>
          <li>Load balancing is part of System Design</li>
        </ul>
      </div>
    </main>
  );
}

async function HomeActions() {
  const user = await getOptionalUser();
  return (
    <div className="mt-8 flex gap-3">
      {user ? (
        <Link href="/dashboard" className="button">
          Open your spaces
        </Link>
      ) : (
        <>
          <Link href="/signup" className="button">
            Create an account
          </Link>
          <Link href="/login" className="button button-secondary">
            Sign in
          </Link>
        </>
      )}
    </div>
  );
}
