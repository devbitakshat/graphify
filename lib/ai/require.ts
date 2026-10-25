import { redirect } from "next/navigation";
import { getAiSummary } from "./settings";

/** Learners must pick a model and add their own API key before using study pages. */
export async function requireAiSetup(userId: string, next = "/dashboard") {
  const summary = await getAiSummary(userId);
  if (!summary) redirect(`/settings?next=${encodeURIComponent(next)}`);
  return summary;
}
