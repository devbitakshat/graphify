"use server";

import { redirect } from "next/navigation";
import { getOptionalUser, requireUser } from "@/lib/auth/current-user";
import { saveFocusSuggestions, type SuggestionDraft } from "@/lib/data/repository";
import { readString } from "@/lib/forms";
import { generateSpaceGraph } from "@/lib/graph/persist";
import { revalidateSpace } from "@/lib/revalidate-space";

export type GraphState = { error: string } | null;

export async function generateGraphAction(_state: GraphState, formData: FormData): Promise<GraphState> {
  const user = await requireUser();
  const spaceId = readString(formData, "spaceId");
  try {
    await generateSpaceGraph(user.id, spaceId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Graph generation failed." };
  }
  revalidateSpace(spaceId);
  redirect(`/spaces/${spaceId}/graph`);
}

export async function persistSuggestionsAction(
  spaceId: string,
  focusId: string,
  pages = 1,
  focusTitle = "",
  extras: SuggestionDraft[] = [],
) {
  const user = await getOptionalUser();
  if (!user) return { saved: 0 };
  try {
    const saved = await saveFocusSuggestions(user.id, spaceId, focusId, pages, focusTitle, extras);
    if (saved > 0) revalidateSpace(spaceId);
    return { saved };
  } catch {
    return { saved: 0 };
  }
}
