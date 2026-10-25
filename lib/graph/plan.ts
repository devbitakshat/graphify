import {
  priorityLabels,
  relationships,
  type Depth,
  type Goal,
  type Level,
  type Priority,
} from "../domain";
import { curriculum, curriculumEdges, type CurriculumEdge, type CurriculumNode } from "./curriculum";
import { normalizeTitle, titleKey } from "./normalize";
import { graphPlanSchema, type GraphPlan, type PlanEdge, type PlanNode } from "./schema";
import { studyNeighbors, studyTopic } from "./topics";

export type PlannerInput = {
  spaceName: string;
  goal: Goal;
  level: Level;
  depth: Depth;
  timeAvailable: string;
  captured: { title: string; note: string }[];
};

const seedsByPhrase = new Map<string, CurriculumNode>();
for (const node of curriculum) {
  seedsByPhrase.set(normalizeTitle(node.title), node);
  for (const synonym of node.synonyms ?? []) seedsByPhrase.set(normalizeTitle(synonym), node);
}

export function exactSeed(title: string) {
  return seedsByPhrase.get(normalizeTitle(title)) ?? null;
}

export function matchCurriculum(title: string) {
  return exactSeed(title) ?? findMention(title);
}

export function expansionBudget(input: Pick<PlannerInput, "goal" | "level" | "depth" | "timeAvailable">) {
  let extra = input.depth === "overview" ? 5 : input.depth === "practitioner" ? 12 : 18;
  const hours = Number(input.timeAvailable.match(/\d+/)?.[0]);
  if (Number.isFinite(hours) && hours <= 3) extra = Math.min(extra, 4);
  else if (Number.isFinite(hours) && hours <= 8) extra = Math.min(extra, 8);
  if (input.goal === "curiosity" && input.depth === "overview") extra = Math.min(extra, 4);
  if (input.level === "advanced" && input.depth === "overview") extra = Math.min(extra, 4);
  return extra;
}

function depthRank(depth: Depth) {
  if (depth === "overview") return 0;
  if (depth === "practitioner") return 1;
  return 2;
}

function allowsLevel(node: CurriculumNode, level: Level) {
  if (node.onlyLevels && !node.onlyLevels.includes(level)) return false;
  if (node.skipLevels?.includes(level)) return false;
  return true;
}

function priorityRank(priority: Priority) {
  if (priority === "must") return 0;
  if (priority === "should") return 1;
  if (priority === "nice") return 2;
  return 3;
}

function goalRelationship(input: PlannerInput, priority: Priority) {
  const article = input.goal === "interview" || input.goal === "exam" ? "an" : "a";
  return `For ${article} ${input.goal} goal at ${input.level} level (${input.depth}, ${input.timeAvailable}), this is ${priorityLabels[priority].toLowerCase()}.`;
}

function capturedPriority(goal: Goal): Priority {
  return goal === "curiosity" ? "should" : "must";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findMention(title: string) {
  const normalized = normalizeTitle(title);
  let best: CurriculumNode | null = null;
  let bestLength = 0;
  for (const node of curriculum) {
    const phrases = [node.title, ...(node.synonyms ?? [])];
    for (const phrase of phrases) {
      const normalizedPhrase = normalizeTitle(phrase);
      if (normalizedPhrase.length < 3 || normalizedPhrase === normalized) continue;
      const pattern = new RegExp(`(?:^| )${escapeRegExp(normalizedPhrase)}(?: |$)`);
      if (pattern.test(normalized) && normalizedPhrase.length > bestLength) {
        best = node;
        bestLength = normalizedPhrase.length;
      }
    }
  }
  return best;
}

function nodeTypeFor(edge: CurriculumEdge, missingIsSource: boolean, seed: CurriculumNode): PlanNode["type"] {
  if (edge.relationship === "required for" && missingIsSource) return "prerequisite";
  if (edge.relationship === "is a type of" && !missingIsSource) return "prerequisite";
  if (edge.relationship === "part of" && missingIsSource && seed.priority === "must") return "prerequisite";
  return "suggested";
}

type BuiltNode = PlanNode & { captured: boolean };

function stripCapture(node: BuiltNode): PlanNode {
  return {
    id: node.id,
    title: node.title,
    type: node.type,
    priority: node.priority,
    explanation: node.explanation,
    whyItMatters: node.whyItMatters,
    goalRelationship: node.goalRelationship,
    example: node.example,
    effort: node.effort,
    prerequisiteReason: node.prerequisiteReason,
  };
}

function orderNodes(nodes: BuiltNode[], edges: PlanEdge[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();
  for (const node of nodes) {
    incoming.set(node.id, []);
    outgoing.set(node.id, []);
  }

  for (const edge of edges) {
    let before: string | null = null;
    let after: string | null = null;
    if (edge.relationship === "required for" || edge.relationship === "uses") {
      before = edge.source;
      after = edge.target;
    } else if (edge.relationship === "is a type of") {
      before = edge.target;
      after = edge.source;
    }
    if (!before || !after || !byId.has(before) || !byId.has(after) || before === after) continue;
    incoming.get(after)?.push(before);
    outgoing.get(before)?.push(after);
  }

  const indegree = new Map<string, number>();
  for (const node of nodes) indegree.set(node.id, new Set(incoming.get(node.id)).size);
  const ready = nodes.filter((node) => indegree.get(node.id) === 0);
  const ordered: string[] = [];
  const seen = new Set<string>();

  while (ready.length > 0) {
    ready.sort((a, b) => {
      if (a.captured !== b.captured) return a.captured ? -1 : 1;
      const priority = priorityRank(a.priority) - priorityRank(b.priority);
      if (priority !== 0) return priority;
      return a.title.localeCompare(b.title);
    });
    const next = ready.shift();
    if (!next || seen.has(next.id)) continue;
    seen.add(next.id);
    ordered.push(next.id);
    for (const after of outgoing.get(next.id) ?? []) {
      const priors = new Set(incoming.get(after));
      priors.delete(next.id);
      incoming.set(after, [...priors]);
      const remaining = [...priors].filter((id) => !seen.has(id)).length;
      indegree.set(after, remaining);
      if (remaining === 0) {
        const node = byId.get(after);
        if (node) ready.push(node);
      }
    }
  }

  for (const node of [...nodes].sort((a, b) => a.title.localeCompare(b.title))) {
    if (!seen.has(node.id)) ordered.push(node.id);
  }

  const projects = ordered.filter((id) => byId.get(id)?.type === "project");
  return [...ordered.filter((id) => byId.get(id)?.type !== "project"), ...projects];
}

export function planWithCurriculum(input: PlannerInput): GraphPlan {
  const budget = expansionBudget(input);
  const nodes = new Map<string, BuiltNode>();
  const capturedKeys = new Set<string>();
  const virtualKeys = new Set<string>();

  function findNode(title: string) {
    const seed = seedsByPhrase.get(normalizeTitle(title)) ?? curriculum.find((node) => node.title === title);
    const phrases = new Set<string>([normalizeTitle(title)]);
    if (seed) {
      phrases.add(normalizeTitle(seed.title));
      for (const synonym of seed.synonyms ?? []) phrases.add(normalizeTitle(synonym));
    }
    for (const node of nodes.values()) {
      if (phrases.has(normalizeTitle(node.title))) return node;
      const nodeSeed = exactSeed(node.title);
      if (seed && nodeSeed?.title === seed.title) return node;
    }
    return undefined;
  }

  function addCaptured(title: string, note: string) {
    const key = normalizeTitle(title);
    if (!key || nodes.has(key)) return;
    const seed = exactSeed(title);
    const priority = capturedPriority(input.goal);
    const node: BuiltNode = {
      id: titleKey(title),
      title,
      type: "captured",
      priority,
      explanation: (
        seed?.explanation ??
        `You captured “${title}” while studying${note ? `: ${note}` : ""}. It stays in the graph even when no deeper prerequisite is added.`
      ).slice(0, 500),
      whyItMatters: seed?.whyItMatters ?? `This is a gap you chose to track in ${input.spaceName}.`,
      goalRelationship: goalRelationship(input, priority),
      example:
        seed?.example ??
        `Explain ${title} in two sentences and point at one example from the material you were reading.`,
      effort: seed?.effort ?? "1–2 hours",
      prerequisiteReason: "",
      captured: true,
    };
    nodes.set(key, node);
    capturedKeys.add(key);
  }

  function addVirtualSeed(title: string) {
    const key = normalizeTitle(title);
    if (!key || nodes.has(key)) return;
    const seed = exactSeed(title) ?? findMention(title);
    const topic = studyTopic(title);
    const node: BuiltNode = {
      id: titleKey(seed?.title ?? title),
      title: seed?.title ?? title,
      type: "captured",
      priority: "should",
      explanation: (seed?.explanation ?? topic?.summary ?? `A starting point for ${title}.`).slice(0, 500),
      whyItMatters: seed?.whyItMatters ?? `This is the topic of ${input.spaceName}.`,
      goalRelationship: goalRelationship(input, "should"),
      example: seed?.example ?? `Explain ${title} in two sentences.`,
      effort: seed?.effort ?? "1–2 hours",
      prerequisiteReason: "",
      captured: true,
    };
    nodes.set(key, node);
    if (seed) nodes.set(normalizeTitle(seed.title), node);
    capturedKeys.add(key);
    if (seed) capturedKeys.add(normalizeTitle(seed.title));
    virtualKeys.add(key);
    if (seed) virtualKeys.add(normalizeTitle(seed.title));
  }

  for (const captured of input.captured) addCaptured(captured.title, captured.note);
  if (input.captured.length === 0) addVirtualSeed(input.spaceName);

  let aiCount = 0;
  const pendingEdges: PlanEdge[] = [];

  function addCurriculumNode(seed: CurriculumNode, edge: CurriculumEdge, missingIsSource: boolean) {
    if (findNode(seed.title) || aiCount >= budget || !allowsLevel(seed, input.level)) return;
    const type = nodeTypeFor(edge, missingIsSource, seed);
    const node: BuiltNode = {
      id: titleKey(seed.title),
      title: seed.title,
      type,
      priority: seed.priority,
      explanation: seed.explanation,
      whyItMatters: seed.whyItMatters,
      goalRelationship: goalRelationship(input, seed.priority),
      example: seed.example,
      effort: seed.effort,
      prerequisiteReason: edge.reason,
      captured: false,
    };
    nodes.set(normalizeTitle(seed.title), node);
    aiCount += 1;
  }

  const seedTitles =
    input.captured.length > 0
      ? input.captured.map((captured) => captured.title)
      : [input.spaceName];

  for (const title of seedTitles) {
    if (exactSeed(title) || aiCount >= budget) continue;
    const mention = findMention(title);
    if (!mention || !allowsLevel(mention, input.level) || findNode(mention.title)) continue;
    addCurriculumNode(
      mention,
      {
        source: mention.title,
        target: title,
        relationship: "required for",
        reason: `“${title}” treats ${mention.title} as already understood.`,
        minDepth: "overview",
      },
      true,
    );
    const source = findNode(mention.title);
    const target = findNode(title);
    if (source && target) {
      pendingEdges.push({ source: source.id, target: target.id, relationship: "required for" });
    }
  }

  const capturedSeedTitles = new Set(
    seedTitles.map((title) => exactSeed(title)?.title).filter((title): title is string => Boolean(title)),
  );

  let guard = 0;
  while (aiCount < budget && guard < 40) {
    guard += 1;
    let best: { score: number; seed: CurriculumNode; edge: CurriculumEdge; missingIsSource: boolean } | null = null;

    for (const edge of curriculumEdges) {
      if (depthRank(input.depth) < depthRank(edge.minDepth)) continue;
      const sourceNode = findNode(edge.source);
      const targetNode = findNode(edge.target);
      if (Boolean(sourceNode) === Boolean(targetNode)) continue;
      const missingTitle = sourceNode ? edge.target : edge.source;
      const seed = curriculum.find((node) => node.title === missingTitle);
      if (!seed || !allowsLevel(seed, input.level) || findNode(seed.title)) continue;

      const anchorTitle = sourceNode ? edge.source : edge.target;
      const anchorCaptured =
        capturedSeedTitles.has(anchorTitle) || capturedKeys.has(normalizeTitle(anchorTitle));
      const missingIsSource = !sourceNode;
      if (!anchorCaptured && input.depth === "overview") continue;
      if (!anchorCaptured && edge.relationship !== "required for") continue;
      if (input.depth !== "advanced" && edge.relationship === "supports") continue;
      if (input.depth === "overview") {
        const directPrerequisite = edge.relationship === "required for" && missingIsSource && anchorCaptured;
        const parent = edge.relationship === "is a type of" && !missingIsSource && anchorCaptured;
        if (!directPrerequisite && !parent) continue;
      }

      let score = anchorCaptured ? 0 : 20;
      if (edge.relationship === "required for" && missingIsSource) score += 0;
      else if (edge.relationship === "is a type of" && !missingIsSource) score += 1;
      else if (edge.relationship === "uses" && !missingIsSource) score += 3;
      else if (edge.relationship === "part of" && missingIsSource) score += 4;
      else if (edge.relationship === "is a type of" && missingIsSource) score += 6;
      else if (edge.relationship === "required for") score += 8;
      else score += 10;
      score += priorityRank(seed.priority);

      if (!best || score < best.score) best = { score, seed, edge, missingIsSource };
    }

    if (!best) break;
    addCurriculumNode(best.seed, best.edge, best.missingIsSource);
  }

  for (const edge of curriculumEdges) {
    if (depthRank(input.depth) < depthRank(edge.minDepth)) continue;
    const source = findNode(edge.source);
    const target = findNode(edge.target);
    if (!source || !target) continue;
    pendingEdges.push({ source: source.id, target: target.id, relationship: edge.relationship });
  }

  const bySeed = new Map<string, BuiltNode[]>();
  for (const node of nodes.values()) {
    if (!node.captured) continue;
    const seed = exactSeed(node.title);
    if (!seed) continue;
    const group = bySeed.get(seed.title) ?? [];
    group.push(node);
    bySeed.set(seed.title, group);
  }
  for (const group of bySeed.values()) {
    if (group.length < 2) continue;
    for (const other of group.slice(1)) {
      pendingEdges.push({ source: group[0].id, target: other.id, relationship: "same as" });
    }
  }

  if (
    input.depth !== "overview" &&
    input.captured.length > 0 &&
    (input.goal === "project" || input.goal === "interview") &&
    aiCount < budget
  ) {
    const anchor =
      findNode("System Design") ??
      [...nodes.values()].find((node) => node.captured && !virtualKeys.has(normalizeTitle(node.title)));
    if (anchor) {
      const project: BuiltNode = {
        id: `project-${titleKey(input.spaceName)}`,
        title: `Practice: ${input.spaceName}`.slice(0, 120),
        type: "project",
        priority: "should",
        explanation: `A small build that connects the gaps you captured in ${input.spaceName}. Do it after the must-know prerequisites.`,
        whyItMatters: "Building one path shows whether the separate concepts actually fit together.",
        goalRelationship: goalRelationship(input, "should"),
        example: `Sketch one request path for ${anchor.title} and mark where each captured gap appears.`,
        effort: "2–4 hours",
        prerequisiteReason: `Practice is useful only after ${anchor.title} and its prerequisites are in place.`,
        captured: false,
      };
      nodes.set(normalizeTitle(project.title), project);
      pendingEdges.push({ source: project.id, target: anchor.id, relationship: "demonstrates" });
    }
  }

  if (virtualKeys.size > 0) {
    for (const neighbor of studyNeighbors(input.spaceName)) {
      if (aiCount >= budget || findNode(neighbor.title)) continue;
      const type = neighbor.kind === "parent" ? "prerequisite" : "suggested";
      const priority = neighbor.kind === "parent" ? "must" : "should";
      const node: BuiltNode = {
        id: titleKey(neighbor.title),
        title: neighbor.title,
        type,
        priority,
        explanation: neighbor.summary.slice(0, 500),
        whyItMatters:
          neighbor.kind === "parent"
            ? `${neighbor.title} is a foundation for ${input.spaceName}.`
            : `${neighbor.title} is a useful part of ${input.spaceName}.`,
        goalRelationship: goalRelationship(input, priority),
        example: `Explain how ${neighbor.title} relates to ${input.spaceName}.`,
        effort: "1–2 hours",
        prerequisiteReason:
          neighbor.kind === "parent" ? `${input.spaceName} builds on ${neighbor.title}.` : "",
        captured: false,
      };
      nodes.set(normalizeTitle(neighbor.title), node);
      aiCount += 1;
      const anchor = findNode(input.spaceName);
      if (anchor) {
        pendingEdges.push({
          source: neighbor.kind === "parent" ? node.id : anchor.id,
          target: neighbor.kind === "parent" ? anchor.id : node.id,
          relationship: neighbor.kind === "parent" ? "required for" : "part of",
        });
      }
    }
  }

  const virtualIds = new Set(
    [...nodes.values()].filter((node) => virtualKeys.has(normalizeTitle(node.title))).map((node) => node.id),
  );
  for (const key of virtualKeys) nodes.delete(key);

  const dedupedEdges: PlanEdge[] = [];
  const seenEdges = new Set<string>();
  for (const edge of pendingEdges) {
    if (virtualIds.has(edge.source) || virtualIds.has(edge.target)) continue;
    const key = `${edge.source}|${edge.relationship}|${edge.target}`;
    if (edge.source === edge.target || seenEdges.has(key)) continue;
    seenEdges.add(key);
    dedupedEdges.push(edge);
  }

  const built = [...nodes.values()].filter(
    (node, index, list) => list.findIndex((other) => other.id === node.id) === index,
  );
  const draft: GraphPlan = {
    nodes: built.map(stripCapture),
    edges: dedupedEdges,
    learningOrder: orderNodes(built, dedupedEdges),
  };
  const parsed = graphPlanSchema.safeParse(draft);
  if (!parsed.success) {
    throw new Error("The on-device planner produced a graph that failed validation.");
  }
  return reconcilePlan(parsed.data, input);
}

export function reconcilePlan(plan: GraphPlan, input: PlannerInput): GraphPlan {
  const budget = expansionBudget(input);
  const allowed = new Set<string>(relationships);
  const nodes = plan.nodes.map((node) => ({ ...node, prerequisiteReason: node.prerequisiteReason ?? "" }));

  for (const captured of input.captured) {
    const match = nodes.find((node) => normalizeTitle(node.title) === normalizeTitle(captured.title));
    if (match) {
      match.title = captured.title;
      match.type = "captured";
      if (!match.explanation) {
        match.explanation = `You captured “${captured.title}” while studying.`;
      }
    } else {
      nodes.push({
        id: titleKey(captured.title),
        title: captured.title,
        type: "captured",
        priority: capturedPriority(input.goal),
        explanation: `You captured “${captured.title}” while studying. It stays in the graph.`,
        whyItMatters: `This is a gap you chose to track in ${input.spaceName}.`,
        goalRelationship: goalRelationship(input, capturedPriority(input.goal)),
        example: `Explain ${captured.title} using the note you saved with it.`,
        effort: "1–2 hours",
        prerequisiteReason: "",
      });
    }
  }

  // Without user captures, treat model "captured" nodes as suggestions so merge can persist them.
  // Keep one overview node titled like the space so the space bubble can show a topic brief.
  if (input.captured.length === 0) {
    for (const node of nodes) {
      if (node.type === "captured") node.type = "suggested";
    }
    const spaceKey = normalizeTitle(input.spaceName);
    let overview = nodes.find((node) => normalizeTitle(node.title) === spaceKey);
    if (!overview) {
      overview = {
        id: titleKey(input.spaceName),
        title: input.spaceName,
        type: "suggested",
        priority: "should",
        explanation: `A starting map for learning ${input.spaceName}. Open the faded related topics to explore.`,
        whyItMatters: `This is the topic of your learning space.`,
        goalRelationship: goalRelationship(input, "should"),
        example: `Explain ${input.spaceName} in two sentences.`,
        effort: "30–60 min",
        prerequisiteReason: "",
      };
      nodes.push(overview);
    } else {
      overview.title = input.spaceName;
      overview.type = "suggested";
      if (!overview.explanation.trim()) {
        overview.explanation = `A starting map for learning ${input.spaceName}.`;
      }
    }
  }

  const capturedKeys = new Set(input.captured.map((captured) => normalizeTitle(captured.title)));
  const spaceKey = normalizeTitle(input.spaceName);
  const locked = nodes.filter((node) => capturedKeys.has(normalizeTitle(node.title)) || node.type === "captured");
  const lockedIds = new Set(locked.map((node) => node.id));
  const overview =
    input.captured.length === 0 ? nodes.find((node) => normalizeTitle(node.title) === spaceKey) : undefined;
  const extras = nodes
    .filter((node) => !lockedIds.has(node.id))
    .filter((node) => normalizeTitle(node.title) !== spaceKey)
    .sort((a, b) => {
      const typeRank = (node: PlanNode) => {
        if (node.priority === "out_of_scope") return 6;
        if (node.type === "prerequisite" && node.priority === "must") return 0;
        if (node.type === "prerequisite") return 1;
        if (node.priority === "must") return 2;
        if (node.type === "project") return 4;
        return 3;
      };
      return typeRank(a) - typeRank(b);
    })
    .slice(0, budget);

  const kept = [...locked, ...(overview && !lockedIds.has(overview.id) ? [overview] : []), ...extras];
  for (const node of kept) {
    if (node.type === "prerequisite" && !node.prerequisiteReason.trim()) {
      node.prerequisiteReason =
        input.captured.length === 0
          ? `${node.title} helps you start ${input.spaceName}.`
          : `${node.title} was added because a captured concept depends on it.`;
    }
  }
  const keptIds = new Set(kept.map((node) => node.id));
  const edges = plan.edges
    .map((edge) => ({ ...edge, relationship: edge.relationship.toLowerCase() }))
    .filter(
      (edge) =>
        allowed.has(edge.relationship) &&
        keptIds.has(edge.source) &&
        keptIds.has(edge.target) &&
        edge.source !== edge.target,
    );

  const built: BuiltNode[] = kept.map((node) => ({
    ...node,
    captured: capturedKeys.has(normalizeTitle(node.title)) || node.type === "captured",
  }));
  const reconciled: GraphPlan = {
    nodes: built.map(stripCapture),
    edges,
    learningOrder: orderNodes(built, edges),
  };
  const parsed = graphPlanSchema.safeParse(reconciled);
  if (!parsed.success) {
    throw new Error("The graph did not match the required shape, so nothing was saved.");
  }
  return parsed.data;
}

export function summarizePlan(plan: GraphPlan, capturedCount: number) {
  const prerequisites = plan.nodes.filter((node) => node.type === "prerequisite").length;
  const suggested = plan.nodes.filter((node) => node.type === "suggested").length;
  const projects = plan.nodes.filter((node) => node.type === "project").length;
  const projectText = projects ? ` Includes ${projects} practice node.` : "";
  if (capturedCount === 0) {
    return `Started from the space topic. Added ${prerequisites} prerequisite${prerequisites === 1 ? "" : "s"} and ${suggested} suggested concept${suggested === 1 ? "" : "s"}.${projectText}`;
  }
  return `Kept ${capturedCount} captured concept${capturedCount === 1 ? "" : "s"}. Added ${prerequisites} prerequisite${prerequisites === 1 ? "" : "s"} and ${suggested} suggested concept${suggested === 1 ? "" : "s"}.${projectText}`;
}
