import type { ConceptType, KnowledgeStatus, Priority } from "../domain";
import { normalizeTitle } from "./normalize";
import type { GraphPlan } from "./schema";

export type StoredConcept = {
  id: string;
  title: string;
  normalizedTitle: string;
  type: ConceptType;
  origin: "user" | "ai";
  priority: Priority;
  status: KnowledgeStatus;
  dismissedBy: "user" | null;
  positionX: number | null;
  positionY: number | null;
};

export type StoredEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  origin: "user" | "ai";
  dismissedBy: "user" | null;
};

export type ConceptWrite = {
  id: string;
  mode: "user" | "ai" | "order";
  title: string;
  normalizedTitle: string;
  type: ConceptType;
  priority: Priority;
  explanation: string;
  whyItMatters: string;
  goalRelationship: string;
  example: string;
  effort: string;
  prerequisiteReason: string;
  learningOrder: number;
  positionX: number | null;
  positionY: number | null;
};

export type EdgeWrite = {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
};

export type MergeResult = {
  updates: ConceptWrite[];
  inserts: ConceptWrite[];
  deleteIds: string[];
  deleteEdgeIds: string[];
  edgeInserts: EdgeWrite[];
};

function blankWrite(id: string, mode: ConceptWrite["mode"]): ConceptWrite {
  return {
    id,
    mode,
    title: "",
    normalizedTitle: "",
    type: "captured",
    priority: "should",
    explanation: "",
    whyItMatters: "",
    goalRelationship: "",
    example: "",
    effort: "",
    prerequisiteReason: "",
    learningOrder: 0,
    positionX: null,
    positionY: null,
  };
}

export function mergePlan(
  concepts: StoredConcept[],
  edges: StoredEdge[],
  plan: GraphPlan,
  createId: () => string,
): MergeResult {
  const active = concepts.filter((concept) => concept.dismissedBy !== "user");
  const blockedTitles = new Set(
    concepts.filter((concept) => concept.dismissedBy === "user").map((concept) => concept.normalizedTitle),
  );
  const activeByTitle = new Map(active.map((concept) => [concept.normalizedTitle, concept]));
  const idMap = new Map<string, string>();
  const updates: ConceptWrite[] = [];
  const inserts: ConceptWrite[] = [];
  const keep = new Set<string>();

  const order = new Map(plan.learningOrder.map((planId, index) => [planId, index]));
  for (const node of plan.nodes) {
    const index = order.get(node.id) ?? plan.learningOrder.length;
    const key = normalizeTitle(node.title);
    if (blockedTitles.has(key)) continue;
    const found = activeByTitle.get(key);
    if (found) {
      idMap.set(node.id, found.id);
      keep.add(found.id);
      const write = blankWrite(found.id, found.origin === "user" ? "user" : "ai");
      write.title = found.origin === "user" ? found.title : node.title;
      write.normalizedTitle = found.origin === "user" ? found.normalizedTitle : key;
      write.type = found.origin === "user" ? "captured" : node.type === "captured" ? found.type : node.type;
      write.priority = node.priority;
      write.explanation = node.explanation;
      write.whyItMatters = node.whyItMatters;
      write.goalRelationship = node.goalRelationship;
      write.example = node.example;
      write.effort = node.effort;
      write.prerequisiteReason = found.origin === "user" ? "" : (node.prerequisiteReason ?? "");
      write.learningOrder = index;
      write.positionX = found.positionX;
      write.positionY = found.positionY;
      updates.push(write);
      continue;
    }

    if (node.type === "captured") continue;
    const id = createId();
    idMap.set(node.id, id);
    keep.add(id);
    const write = blankWrite(id, "ai");
    write.title = node.title;
    write.normalizedTitle = key;
    write.type = node.type;
    write.priority = node.priority;
    write.explanation = node.explanation;
    write.whyItMatters = node.whyItMatters;
    write.goalRelationship = node.goalRelationship;
    write.example = node.example;
    write.effort = node.effort;
    write.prerequisiteReason = node.prerequisiteReason ?? "";
    write.learningOrder = index;
    inserts.push(write);
  }

  // Captured concepts stay even when this plan does not mention them.
  let tail = plan.learningOrder.length;
  for (const concept of active) {
    if (concept.origin !== "user" || keep.has(concept.id)) continue;
    const write = blankWrite(concept.id, "order");
    write.title = concept.title;
    write.normalizedTitle = concept.normalizedTitle;
    write.type = concept.type;
    write.priority = concept.priority;
    write.learningOrder = tail;
    write.positionX = concept.positionX;
    write.positionY = concept.positionY;
    tail += 1;
    updates.push(write);
    keep.add(concept.id);
  }

  // Saved suggestions stay even when this plan does not mention them; a new plan only adds or updates.
  const deleteIds: string[] = [];
  const planned = new Set(idMap.values());
  const deleteEdgeIds = edges
    .filter(
      (edge) =>
        edge.origin === "ai" && edge.dismissedBy !== "user" && planned.has(edge.sourceId) && planned.has(edge.targetId),
    )
    .map((edge) => edge.id);
  const blockedEdges = new Set(
    edges
      .filter((edge) => edge.dismissedBy === "user")
      .map((edge) => `${edge.sourceId}|${edge.relationship}|${edge.targetId}`),
  );

  const edgeInserts: EdgeWrite[] = [];
  for (const edge of plan.edges) {
    const sourceId = idMap.get(edge.source);
    const targetId = idMap.get(edge.target);
    if (!sourceId || !targetId || sourceId === targetId) continue;
    if (deleteIds.includes(sourceId) || deleteIds.includes(targetId)) continue;
    const key = `${sourceId}|${edge.relationship}|${targetId}`;
    if (blockedEdges.has(key)) continue;
    const userOwns = edges.some(
      (existing) =>
        existing.origin === "user" &&
        existing.dismissedBy !== "user" &&
        existing.sourceId === sourceId &&
        existing.targetId === targetId &&
        existing.relationship === edge.relationship,
    );
    if (userOwns) continue;
    edgeInserts.push({ id: createId(), sourceId, targetId, relationship: edge.relationship });
  }

  const placed = [...updates, ...inserts];
  const saved = placed.filter((item) => item.positionX != null);
  if (saved.length === 0) {
    [...placed]
      .sort((a, b) => a.learningOrder - b.learningOrder)
      .forEach((item, index) => {
        item.positionX = (index % 4) * 280 + 24;
        item.positionY = Math.floor(index / 4) * 168 + 24;
      });
  } else {
    const originX = Math.max(...saved.map((item) => item.positionX ?? 0)) + 300;
    let row = 0;
    for (const item of placed) {
      if (item.positionX != null) continue;
      item.positionX = originX;
      item.positionY = 24 + row * 168;
      row += 1;
    }
  }

  return { updates, inserts, deleteIds, deleteEdgeIds, edgeInserts };
}
