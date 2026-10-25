import type { Depth, Relationship } from "../domain";
import { curriculumEdges } from "./curriculum";
import { matchCurriculum } from "./plan";

export type RelateNode = {
  id: string;
  title: string;
  learningOrder: number | null;
};

export type RelateEdge = {
  sourceId: string;
  targetId: string;
  relationship: string;
  dismissed?: boolean;
};

export type ProposedEdge = {
  sourceId: string;
  targetId: string;
  relationship: Relationship;
};

function depthRank(depth: Depth) {
  if (depth === "overview") return 0;
  if (depth === "practitioner") return 1;
  return 2;
}

function edgeKey(sourceId: string, relationship: string, targetId: string) {
  return `${sourceId}|${relationship}|${targetId}`;
}

export function relateConcept(input: {
  conceptId: string;
  concepts: RelateNode[];
  edges: RelateEdge[];
  depth: Depth;
}): { edges: ProposedEdge[]; learningOrder: Array<{ id: string; learningOrder: number }> } {
  const focus = input.concepts.find((concept) => concept.id === input.conceptId);
  const idsByTitle = new Map<string, string[]>();
  for (const concept of input.concepts) {
    const title = matchCurriculum(concept.title)?.title;
    if (!title) continue;
    const ids = idsByTitle.get(title) ?? [];
    ids.push(concept.id);
    idsByTitle.set(title, ids);
  }

  const focusTitle = focus ? matchCurriculum(focus.title)?.title : null;
  const neighborIds = new Set<string>();
  if (focusTitle) {
    neighborIds.add(input.conceptId);
    for (const edge of curriculumEdges) {
      if (depthRank(input.depth) < depthRank(edge.minDepth)) continue;
      if (edge.source !== focusTitle && edge.target !== focusTitle) continue;
      for (const id of [...(idsByTitle.get(edge.source) ?? []), ...(idsByTitle.get(edge.target) ?? [])]) {
        neighborIds.add(id);
      }
    }
  }

  const neighborTitles = new Set<string>();
  for (const [title, ids] of idsByTitle) {
    if (ids.some((id) => neighborIds.has(id))) neighborTitles.add(title);
  }

  const blocked = new Set(input.edges.map((edge) => edgeKey(edge.sourceId, edge.relationship, edge.targetId)));
  const fresh: ProposedEdge[] = [];
  const seen = new Set<string>();
  for (const edge of curriculumEdges) {
    if (depthRank(input.depth) < depthRank(edge.minDepth)) continue;
    if (!neighborTitles.has(edge.source) || !neighborTitles.has(edge.target)) continue;
    for (const sourceId of idsByTitle.get(edge.source) ?? []) {
      for (const targetId of idsByTitle.get(edge.target) ?? []) {
        if (sourceId === targetId || !neighborIds.has(sourceId) || !neighborIds.has(targetId)) continue;
        const key = edgeKey(sourceId, edge.relationship, targetId);
        if (blocked.has(key) || seen.has(key)) continue;
        seen.add(key);
        fresh.push({ sourceId, targetId, relationship: edge.relationship });
      }
    }
  }

  const active = [
    ...input.edges.filter((edge) => !edge.dismissed),
    ...fresh,
  ];
  return { edges: fresh, learningOrder: orderConcepts(input.concepts, active) };
}

function orderConcepts(concepts: RelateNode[], edges: Array<{ sourceId: string; targetId: string; relationship: string }>) {
  const index = new Map(concepts.map((concept, position) => [concept.id, position]));
  const byId = new Map(concepts.map((concept) => [concept.id, concept]));
  const rank = (id: string) => {
    const node = byId.get(id);
    if (node?.learningOrder != null) return node.learningOrder;
    return 100000 + (index.get(id) ?? 0);
  };
  const incoming = new Map<string, Set<string>>();
  const outgoing = new Map<string, string[]>();
  for (const concept of concepts) {
    incoming.set(concept.id, new Set());
    outgoing.set(concept.id, []);
  }

  for (const edge of edges) {
    let before: string | null = null;
    let after: string | null = null;
    if (edge.relationship === "required for" || edge.relationship === "uses") {
      before = edge.sourceId;
      after = edge.targetId;
    } else if (edge.relationship === "is a type of") {
      before = edge.targetId;
      after = edge.sourceId;
    }
    if (!before || !after || before === after || !incoming.has(before) || !incoming.has(after)) continue;
    incoming.get(after)?.add(before);
    outgoing.get(before)?.push(after);
  }

  const indegree = new Map<string, number>();
  for (const concept of concepts) indegree.set(concept.id, incoming.get(concept.id)?.size ?? 0);
  const ready = concepts.filter((concept) => indegree.get(concept.id) === 0);
  const ordered: string[] = [];
  const seen = new Set<string>();

  while (ready.length > 0) {
    ready.sort((a, b) => rank(a.id) - rank(b.id) || a.title.localeCompare(b.title));
    const next = ready.shift();
    if (!next || seen.has(next.id)) continue;
    seen.add(next.id);
    ordered.push(next.id);
    for (const after of outgoing.get(next.id) ?? []) {
      incoming.get(after)?.delete(next.id);
      const remaining = [...(incoming.get(after) ?? [])].filter((id) => !seen.has(id)).length;
      indegree.set(after, remaining);
      if (remaining === 0) {
        const node = byId.get(after);
        if (node) ready.push(node);
      }
    }
  }

  const rest = concepts
    .filter((concept) => !seen.has(concept.id))
    .sort((a, b) => rank(a.id) - rank(b.id) || a.title.localeCompare(b.title));
  ordered.push(...rest.map((concept) => concept.id));
  return ordered.map((id, learningOrder) => ({ id, learningOrder }));
}
