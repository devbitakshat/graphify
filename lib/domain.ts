export const goals = ["interview", "project", "career", "exam", "curiosity"] as const;
export const levels = ["beginner", "intermediate", "advanced"] as const;
export const depths = ["overview", "practitioner", "advanced"] as const;
export const preferences = ["any", "video", "article", "documentation", "course"] as const;
export const conceptTypes = [
  "captured",
  "prerequisite",
  "suggested",
  "mastered",
  "resource",
  "project",
] as const;
export const priorities = ["must", "should", "nice", "out_of_scope"] as const;
export const statuses = ["unfamiliar", "partial", "learn_later", "understood"] as const;
export const relationships = [
  "required for",
  "is a type of",
  "uses",
  "supports",
  "part of",
  "same as",
  "demonstrates",
] as const;
export const timeOptions = ["2 hours", "6 hours", "15 hours", "40 hours"] as const;

export type Goal = (typeof goals)[number];
export type Level = (typeof levels)[number];
export type Depth = (typeof depths)[number];
export type Preference = (typeof preferences)[number];
export type ConceptType = (typeof conceptTypes)[number];
export type Priority = (typeof priorities)[number];
export type KnowledgeStatus = (typeof statuses)[number];
export type Relationship = (typeof relationships)[number];

export const goalLabels: Record<Goal, string> = {
  interview: "Interview",
  project: "Project",
  career: "Career",
  exam: "Exam",
  curiosity: "Curiosity",
};

export const levelLabels: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const depthLabels: Record<Depth, string> = {
  overview: "Overview",
  practitioner: "Practitioner",
  advanced: "Advanced",
};

export const preferenceLabels: Record<Preference, string> = {
  any: "Any format",
  video: "Video",
  article: "Article",
  documentation: "Documentation",
  course: "Course",
};

export const typeLabels: Record<ConceptType, string> = {
  captured: "Captured",
  prerequisite: "Prerequisite",
  suggested: "Suggested",
  mastered: "Mastered",
  resource: "Resource",
  project: "Project",
};

export const priorityLabels: Record<Priority, string> = {
  must: "Must know",
  should: "Should know",
  nice: "Nice to know",
  out_of_scope: "Out of scope",
};

export const statusLabels: Record<KnowledgeStatus, string> = {
  unfamiliar: "Unfamiliar",
  partial: "Partial",
  learn_later: "Learn later",
  understood: "Understood",
};

export function isOneOf<T extends string>(values: readonly T[], value: string): value is T {
  return (values as readonly string[]).includes(value);
}

export function addedPath(concepts: GraphConcept[]) {
  return concepts
    .filter((concept) => concept.origin === "user" && concept.captureOrder != null)
    .sort((a, b) => (a.captureOrder ?? 0) - (b.captureOrder ?? 0) || a.title.localeCompare(b.title));
}

export type GraphConcept = {
  id: string;
  title: string;
  type: ConceptType;
  origin: "user" | "ai";
  priority: Priority;
  status: KnowledgeStatus;
  explanation: string;
  whyItMatters: string;
  goalRelationship: string;
  example: string;
  effort: string;
  prerequisiteReason: string;
  learningOrder: number | null;
  captureOrder: number | null;
  sourceUrl: string;
  sourceNote: string;
  parentId: string | null;
  positionX: number | null;
  positionY: number | null;
};

export type GraphEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  origin: "user" | "ai";
};

export type GraphResource = {
  id: string;
  conceptId: string;
  title: string;
  url: string;
  kind: string;
  provider: string;
  whyRecommended: string;
  duration: string;
  isFree: boolean;
};

export type GraphView = {
  revision: string;
  space: {
    id: string;
    name: string;
    goal: Goal;
    level: Level;
    depth: Depth;
    timeAvailable: string;
    resourcePreference: Preference;
    updatedAt: string;
  };
  concepts: GraphConcept[];
  edges: GraphEdge[];
  resources: GraphResource[];
  generation: {
    model: string;
    summary: string;
    createdAt: string;
  } | null;
  progress: {
    /** User-captured concepts marked understood. */
    understood: number;
    /** User-captured concepts in scope (excludes out_of_scope / project / resource). */
    total: number;
    /** All in-scope concepts on the graph (captures + AI). */
    nodes: number;
  };
  nextConceptIds: string[];
};
