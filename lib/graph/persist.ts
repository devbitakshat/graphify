import { randomUUID } from "node:crypto";
import {
  appendGenerationNote,
  applyGraphMerge,
  getGraphView,
  getSpaceForUser,
  loadMergeState,
  replaceConceptResources,
} from "../data/repository";
import { getAiConfig } from "../ai/settings";
import { findResources } from "../resources/search";
import { createPlan } from "./create-plan";
import { mergePlan } from "./merge";
import { summarizePlan } from "./plan";

export async function generateSpaceGraph(userId: string, spaceId: string) {
  const space = await getSpaceForUser(userId, spaceId);
  if (!space) throw new Error("Learning space not found.");
  const current = await getGraphView(userId, spaceId);
  if (!current) throw new Error("Learning space not found.");
  const captured = current.concepts.filter((concept) => concept.origin === "user");

  const { plan, model } = await createPlan(
    {
      spaceName: space.name,
      goal: space.goal,
      level: space.level,
      depth: space.depth,
      timeAvailable: space.timeAvailable,
      captured: captured.map((concept) => ({ title: concept.title, note: concept.sourceNote })),
    },
    await getAiConfig(userId),
  );
  if (plan.nodes.length === 0) {
    throw new Error(
      "No map yet for this topic. Add a concept to seed the graph, or add your AI key in settings for topics outside the built-in curriculum.",
    );
  }
  const state = await loadMergeState(spaceId);
  const merged = mergePlan(state.concepts, state.edges, plan, () => randomUUID());
  const summary = summarizePlan(plan, captured.length);
  const generationId = await applyGraphMerge(userId, spaceId, merged, { model, summary, plan });

  const updated = await getGraphView(userId, spaceId);
  const results = await findResources(
    (updated?.concepts ?? []).map((concept) => ({
      id: concept.id,
      title: concept.title,
      priority: concept.priority,
      type: concept.type,
      learningOrder: concept.learningOrder,
    })),
    space.resourcePreference,
    space.level,
  );
  let failed = 0;
  for (const result of results) {
    if (!result.ok) {
      failed += 1;
      continue;
    }
    await replaceConceptResources(result.conceptId, result.resources);
  }
  const finalSummary = failed
    ? `${summary} ${failed} concept search${failed === 1 ? "" : "es"} failed, so those concepts kept any previous links.`
    : summary;
  if (failed) await appendGenerationNote(generationId, finalSummary);
  return { summary: finalSummary, model };
}
