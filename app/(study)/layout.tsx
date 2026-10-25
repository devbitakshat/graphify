import { Suspense } from "react";
import { LearnHeader } from "@/components/learn-header";

/** Study routes read auth cookies; allow blocking soft navigations. */
export const instant = false;

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <Suspense fallback={<div className="h-14 shrink-0 border-b border-[var(--line)] bg-[var(--card)]" />}>
        <LearnHeader />
      </Suspense>
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">{children}</div>
    </div>
  );
}
