import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getOptionalUser } from "@/lib/auth/current-user";
import { safeNext } from "@/lib/auth/safe-next";

export const metadata = { title: "Sign in" };
export const instant = false;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNext(params.next);
  const user = await getOptionalUser();
  if (user) redirect(nextPath);
  return (
    <main className="mx-auto grid w-full max-w-md flex-1 content-center px-6 py-16">
      <div className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        {params.error === "confirm" ? (
          <p className="mt-3 text-sm text-[var(--danger)]">
            Email confirmation failed. Request a new link or sign in if you already confirmed.
          </p>
        ) : null}
        <div className="mt-6">
          <AuthForm mode="login" nextPath={nextPath} />
        </div>
      </div>
    </main>
  );
}
