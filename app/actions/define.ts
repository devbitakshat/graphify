"use server";

import { getAiConfig } from "@/lib/ai/settings";
import { getOptionalUser } from "@/lib/auth/current-user";
import { getSpaceForUser, saveConceptBrief } from "@/lib/data/repository";
import { isCatalogCopy } from "@/lib/graph/brief";
import { defineWithModel } from "@/lib/graph/llm";

export async function defineTopicAction(
  spaceId: string,
  title: string,
): Promise<{ definition: string; more: string } | { error: string }> {
  const cleanTitle = title.replace(/\s+/g, " ").trim().slice(0, 120);
  if (!cleanTitle) return { error: "Missing topic." };
  // Return a normal result when the session is missing. redirect() here would
  // answer a background request with the login page and crash the graph.
  const user = await getOptionalUser();
  if (!user) return { error: "Sign in again to load this definition." };
  const space = await getSpaceForUser(user.id, spaceId);
  if (!space) return { error: "Learning space not found." };

  try {
    const brief = await defineWithModel(await getAiConfig(user.id), {
      title: cleanTitle,
      spaceName: space.name,
      level: space.level,
    });
    if (!isCatalogCopy(cleanTitle, brief.definition)) {
      await saveConceptBrief(user.id, spaceId, cleanTitle, brief.definition, brief.more);
    }
    return brief;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not write a definition." };
  }
}
