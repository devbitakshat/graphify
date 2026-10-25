"use client";

import { useParams } from "next/navigation";
import { SettingsButton } from "@/components/space-forms";

export function HeaderSettings() {
  const params = useParams<{ spaceId?: string }>();
  const spaceId = typeof params?.spaceId === "string" ? params.spaceId : null;
  if (!spaceId) return null;
  return <SettingsButton spaceId={spaceId} />;
}
