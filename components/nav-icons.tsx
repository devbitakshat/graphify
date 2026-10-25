export function SpacesIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.5" y="1.5" width="5.2" height="5.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.3" y="1.5" width="5.2" height="5.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1.5" y="9.3" width="5.2" height="5.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.3" y="9.3" width="5.2" height="5.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ViewModeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        d="M2 8c1.6-2.6 3.6-3.8 6-3.8S12.4 5.4 14 8c-1.6 2.6-3.6 3.8-6 3.8S3.6 10.6 2 8z"
      />
      <circle cx="8" cy="8" r="1.5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
      {active ? null : (
        <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M3.5 12.5 12.5 3.5" />
      )}
    </svg>
  );
}

export function SimplifyIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.5" d="M5 4.5h6M5 11.5h6M4.5 5.2v5.6M11.5 5.2v5.6" />
      <circle cx="4.5" cy="4.5" r="1.35" fill="currentColor" />
      <circle cx="11.5" cy="4.5" r="1.35" fill="currentColor" />
      <circle cx="4.5" cy="11.5" r="1.35" fill="currentColor" />
      <circle cx="11.5" cy="11.5" r="1.35" fill="currentColor" />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.5" d="M1.5 4h13M1.5 8h13M1.5 12h13" />
      <circle cx="5" cy="4" r="1.6" fill="currentColor" />
      <circle cx="11" cy="8" r="1.6" fill="currentColor" />
      <circle cx="7" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

