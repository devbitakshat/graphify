import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { HeaderSettings } from "@/components/header-settings";
import { getOptionalUser } from "@/lib/auth/current-user";

export async function LearnHeader() {
  const user = await getOptionalUser();
  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--line)] bg-[var(--card)] px-4 py-3 sm:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="" width={24} height={24} className="rounded-md" />
        Graphily
      </Link>
      <div className="flex items-center gap-3 text-sm">
        {user ? <span className="hidden text-[var(--muted)] sm:inline">{user.email}</span> : null}
        <HeaderSettings />
        {user ? (
          <Link href="/settings" className="button button-secondary">
            AI model
          </Link>
        ) : null}
        <form action={logout}>
          <button type="submit" className="button button-secondary">
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
