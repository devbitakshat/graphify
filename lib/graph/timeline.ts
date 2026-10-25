export function spaceNodeId(spaceId: string) {
  return `space:${spaceId}`;
}

type TimelineEdge = {
  sourceId: string;
  targetId: string;
  relationship?: string;
};

export function guidesFor<T extends { id: string; origin: "user" | "ai" }>(
  capturedId: string,
  concepts: T[],
  edges: TimelineEdge[],
) {
  const linked = new Set<string>();
  for (const edge of edges) {
    if (edge.sourceId === capturedId) linked.add(edge.targetId);
    if (edge.targetId === capturedId) linked.add(edge.sourceId);
  }
  return concepts
    .filter((concept) => linked.has(concept.id) && concept.origin !== "user")
    .sort((a, b) => a.id.localeCompare(b.id));
}

