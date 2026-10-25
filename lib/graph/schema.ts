import { z } from "zod";

export const graphPlanSchema = z.object({
  nodes: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        title: z.string().min(1).max(120),
        type: z.enum(["captured", "prerequisite", "suggested", "project"]),
        priority: z.enum(["must", "should", "nice", "out_of_scope"]),
        explanation: z.string().max(500),
        whyItMatters: z.string().max(400),
        goalRelationship: z.string().max(400),
        example: z.string().max(400),
        effort: z.string().max(80),
        prerequisiteReason: z.string().max(400).optional(),
      }),
    )
    .max(80),
  edges: z
    .array(
      z.object({
        source: z.string().min(1).max(80),
        target: z.string().min(1).max(80),
        relationship: z.string().min(1).max(40),
      }),
    )
    .max(200),
  learningOrder: z.array(z.string().min(1).max(80)).max(80),
});

export type GraphPlan = z.infer<typeof graphPlanSchema>;
export type PlanNode = GraphPlan["nodes"][number];
export type PlanEdge = GraphPlan["edges"][number];

export function clampPlanInput(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const record = value as { nodes?: unknown; edges?: unknown; learningOrder?: unknown };
  if (Array.isArray(record.nodes)) {
    record.nodes = record.nodes.map((node) => {
      if (!node || typeof node !== "object") return node;
      const item = node as Record<string, unknown>;
      for (const [key, max] of [
        ["id", 80],
        ["title", 120],
        ["explanation", 500],
        ["whyItMatters", 400],
        ["goalRelationship", 400],
        ["example", 400],
        ["effort", 80],
        ["prerequisiteReason", 400],
      ] as const) {
        if (typeof item[key] === "string") item[key] = item[key].slice(0, max);
      }
      return item;
    });
  }
  if (Array.isArray(record.edges)) {
    record.edges = record.edges.map((edge) => {
      if (!edge || typeof edge !== "object") return edge;
      const item = edge as Record<string, unknown>;
      if (typeof item.relationship === "string") item.relationship = item.relationship.slice(0, 40);
      return item;
    });
  }
  return record;
}
