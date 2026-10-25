import type { AiConfig } from "../ai/settings";
import { planWithModel } from "./llm";
import { planWithCurriculum, reconcilePlan, type PlannerInput } from "./plan";

export async function createPlan(input: PlannerInput, config: AiConfig | null) {
  if (!config) {
    return { plan: planWithCurriculum(input), model: "on-device curriculum" };
  }
  const drafted = await planWithModel(config, input);
  return {
    plan: reconcilePlan(drafted, input),
    model: config.model,
  };
}
