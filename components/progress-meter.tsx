export function ProgressMeter({
  understood,
  total,
  nodes,
  compact = false,
}: {
  understood: number;
  total: number;
  nodes?: number;
  compact?: boolean;
}) {
  const percent = total === 0 ? 0 : Math.round((understood / total) * 100);
  if (compact) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-xs text-[var(--muted)]">
          {understood} of {total} understood
          {nodes != null ? ` · ${nodes} node${nodes === 1 ? "" : "s"}` : ""}
        </span>
        <div className="meter w-24 shrink-0" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </div>
        <span className="shrink-0 text-xs text-[var(--muted)]">{percent}%</span>
      </div>
    );
  }
  return (
    <div className="grid gap-1">
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm text-[var(--muted)]">
        <span>
          {understood} of {total} captured understood
          {nodes != null ? ` · ${nodes} node${nodes === 1 ? "" : "s"} on graph` : ""}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
