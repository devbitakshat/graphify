import type { ConceptType, Depth, KnowledgeStatus, Level, Priority, Relationship } from "../domain";
import { isCatalogCopy } from "./brief";
import { curriculum, curriculumEdges, type CurriculumNode } from "./curriculum";
import { titleKey, normalizeTitle } from "./normalize";
import { exactSeed, matchCurriculum } from "./plan";
import { relatedTopicBudget } from "./related";
import { spaceNodeId } from "./timeline";
import { studyNeighbors, studyTopic } from "./topics";

const TYPE_LIST_CAP = 8;

export type MeshConcept = {
  id: string;
  title: string;
  type: ConceptType;
  origin: "user" | "ai";
  priority: Priority;
  status: KnowledgeStatus;
  explanation: string;
  whyItMatters: string;
  prerequisiteReason: string;
  captureOrder: number | null;
  parentId?: string | null;
};

export type MeshEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  origin: "user" | "ai";
};

export type OpenedSuggestion = {
  id: string;
  anchorId: string;
  title: string;
};

export type MeshFilters = {
  type: "all" | ConceptType;
  priority: "all" | Priority;
  hideUnderstood: boolean;
};

export type MeshNode = {
  id: string;
  title: string;
  type: ConceptType;
  origin: "user" | "ai" | "space";
  priority: Priority;
  status: KnowledgeStatus;
  role: "space" | "captured" | "related";
  faded: boolean;
  pathLabel: string;
  summary: string;
  description: string;
  relationship: string;
  conceptId: string | null;
  anchorId: string | null;
  captureNumber: number | null;
  x: number;
  y: number;
  width: number;
  height: number;
  diameter: number;
};

export type MeshLink = {
  id: string;
  source: string;
  target: string;
  label?: string;
  faded: boolean;
  origin: "user" | "ai";
  kind: "timeline" | "mesh";
};

export type ShowMore =
  | { action: "expand"; focusId: string }
  | { action: "parent"; parentId: string; parentTitle: string };

type MeshSuggestion = {
  title: string;
  relationship: Relationship;
  type: "prerequisite" | "suggested";
  priority: Priority;
  explanation: string;
  whyItMatters: string;
  focusIsSource: boolean;
};

const childRank = [
  "abstraction",
  "encapsulation",
  "inheritance",
  "polymorphism",
  "class",
  "object",
  "method",
  "interface",
  "composition",
  "variable",
  "function",
  "conditional",
  "loop",
  "array",
  "dictionary",
  "linked list",
  "stack",
  "queue",
  "tree",
  "graph",
  "sorting",
  "bubble sort",
  "selection sort",
  "insertion sort",
  "merge sort",
  "quicksort",
  "heap sort",
  "searching",
  "binary search",
  "recursion",
  "python",
  "data structures",
  "algorithms",
];

const TIMELINE_GAP = 72;
const SEPARATION = 36;
const LANE_CLEARANCE = 168;
const NEAR_CLEARANCE = 56;
const MAX_DRIFT = 72;

function nodeSize(title: string, role: "space" | "captured" | "related") {
  const diameter = bubbleDiameter(title, role);
  return { diameter, width: diameter, height: diameter };
}

export function bubbleDiameter(title: string, role: "space" | "captured" | "related") {
  const text = title.trim();
  const words = text.length > 0 ? text.split(/\s+/) : [""];
  const longest = words.reduce((max, word) => Math.max(max, word.length), 1);
  const chars = Math.max(text.length, 1);
  const lines = Math.max(1, Math.ceil(chars / (longest > 12 ? 10 : 8)));
  const widest = Math.max(longest, Math.ceil(chars / lines));
  const textSpan = Math.max(widest * 11, lines * 22);
  const padding = role === "space" ? 84 : role === "captured" ? 62 : 54;
  const min = role === "space" ? 176 : role === "captured" ? 112 : 104;
  const size = Math.min(340, Math.max(min, textSpan + padding));
  if (size >= 340) return 340;
  return size % 2 === 0 ? size : size + 1;
}

function depthRank(depth: Depth) {
  if (depth === "overview") return 0;
  if (depth === "practitioner") return 1;
  return 2;
}

function prefersStudy(title: string) {
  const study = studyTopic(title);
  if (!study) return false;
  const seed = exactSeed(title);
  if (!seed) return true;
  if (normalizeTitle(seed.title) === normalizeTitle(study.title)) return false;
  const normalized = normalizeTitle(title);
  return normalized === normalizeTitle(study.title) || (study.aliases ?? []).some((alias) => normalizeTitle(alias) === normalized);
}

function clip(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 220 ? `${clean.slice(0, 217).trimEnd()}…` : clean;
}

function priorityRank(priority: Priority) {
  if (priority === "must") return 0;
  if (priority === "should") return 1;
  if (priority === "nice") return 2;
  return 3;
}

function allowsLevel(node: Pick<CurriculumNode, "onlyLevels" | "skipLevels">, level: Level) {
  if (node.onlyLevels && !node.onlyLevels.includes(level)) return false;
  if (node.skipLevels?.includes(level)) return false;
  return true;
}

function levelNudge(node: Pick<CurriculumNode, "onlyLevels">, level: Level) {
  if (level === "beginner" && node.onlyLevels?.length === 1 && node.onlyLevels[0] === "beginner") return -2;
  return 0;
}

type Candidate = MeshSuggestion & { score: number; hop: 0 | 1 };

function curriculumIndex(title: string) {
  const index = curriculum.findIndex((node) => node.title === title);
  return index === -1 ? curriculum.length : index;
}

function byFit(a: Candidate, b: Candidate) {
  return (
    a.score - b.score ||
    priorityRank(a.priority) - priorityRank(b.priority) ||
    curriculumIndex(a.title) - curriculumIndex(b.title) ||
    a.title.localeCompare(b.title)
  );
}

function pickMix(candidates: Candidate[], level: Level) {
  const budget = relatedTopicBudget(level);
  const prereqCap = level === "beginner" ? 1 : level === "intermediate" ? 2 : 3;
  const unique: Candidate[] = [];
  const seen = new Set<string>();
  for (const candidate of [...candidates].sort(byFit)) {
    const key = normalizeTitle(candidate.title);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(candidate);
  }
  const directPrereqs = unique.filter((item) => item.hop === 0 && item.type === "prerequisite");
  const rest = unique.filter((item) => item.hop !== 0 || item.type !== "prerequisite");
  const prereqCount =
    rest.length === 0 ? Math.min(budget, directPrereqs.length) : Math.min(prereqCap, directPrereqs.length, Math.max(0, budget - 1));
  const chosen = [...directPrereqs.slice(0, prereqCount), ...rest.slice(0, budget - prereqCount)];
  for (const extra of directPrereqs.slice(prereqCount)) {
    if (chosen.length >= budget) break;
    chosen.push(extra);
  }
  return chosen.slice(0, budget).map((candidate) => ({
    title: candidate.title,
    relationship: candidate.relationship,
    type: candidate.type,
    priority: candidate.priority,
    explanation: candidate.explanation,
    whyItMatters: candidate.whyItMatters,
    focusIsSource: candidate.focusIsSource,
  }));
}

function curriculumCandidates(title: string, level: Level, depth: Depth, taken: Set<string>): Candidate[] {
  const focus = matchCurriculum(title);
  if (!focus) return [];
  const candidates: Candidate[] = [];
  const directTitles = new Set<string>();

  for (const edge of curriculumEdges) {
    if (depthRank(depth) < depthRank(edge.minDepth)) continue;
    const focusIsSource = edge.source === focus.title;
    const focusIsTarget = edge.target === focus.title;
    if (!focusIsSource && !focusIsTarget) continue;
    const otherTitle = focusIsSource ? edge.target : edge.source;
    const other = curriculum.find((node) => node.title === otherTitle);
    if (!other || !allowsLevel(other, level) || taken.has(normalizeTitle(other.title))) continue;
    const otherIsSource = !focusIsSource;
    let score = 8;
    if (edge.relationship === "required for" && otherIsSource) score = 0;
    else if (edge.relationship === "is a type of" && focusIsSource) score = 1;
    else if (edge.relationship === "uses" && focusIsSource) score = 3;
    else if (edge.relationship === "part of" && otherIsSource) score = 4;
    else if (edge.relationship === "supports" && otherIsSource) score = 5;
    const type = score === 0 || (edge.relationship === "is a type of" && focusIsSource) ? "prerequisite" : "suggested";
    directTitles.add(other.title);
    candidates.push({
      score: score + levelNudge(other, level),
      hop: 0,
      title: other.title,
      relationship: edge.relationship,
      type,
      priority: other.priority,
      explanation: other.explanation,
      whyItMatters: other.whyItMatters,
      focusIsSource,
    });
  }

  const bridges = candidates.filter((item) => item.hop === 0 && item.type === "prerequisite").map((item) => item.title);
  for (const bridge of bridges) {
    for (const edge of curriculumEdges) {
      if (depthRank(depth) < depthRank(edge.minDepth)) continue;
      if (edge.source !== bridge && edge.target !== bridge) continue;
      const otherTitle = edge.source === bridge ? edge.target : edge.source;
      if (otherTitle === focus.title || directTitles.has(otherTitle) || taken.has(normalizeTitle(otherTitle))) continue;
      const other = curriculum.find((node) => node.title === otherTitle);
      if (!other || !allowsLevel(other, level)) continue;
      const otherIsSource = edge.source === other.title;
      const kind =
        edge.relationship === "is a type of" && otherIsSource
          ? "part of"
          : edge.relationship === "part of" && otherIsSource
            ? "part of"
            : edge.relationship === "required for" && otherIsSource
              ? "supports"
              : edge.relationship === "uses" && edge.source === bridge
                ? "uses"
                : null;
      if (!kind) continue;
      directTitles.add(other.title);
      candidates.push({
        score: (kind === "part of" ? 2 : 5) + levelNudge(other, level),
        hop: 1,
        title: other.title,
        relationship: kind,
        type: kind === "supports" ? "prerequisite" : "suggested",
        priority: other.priority,
        explanation: other.explanation,
        whyItMatters: other.whyItMatters,
        focusIsSource: kind === "uses",
      });
    }
  }

  return candidates;
}

function withoutRank(candidate: Candidate): MeshSuggestion {
  return {
    title: candidate.title,
    relationship: candidate.relationship,
    type: candidate.type,
    priority: candidate.priority,
    explanation: candidate.explanation,
    whyItMatters: candidate.whyItMatters,
    focusIsSource: candidate.focusIsSource,
  };
}

function curriculumCatalog(title: string, level: Level, depth: Depth, taken: Set<string>): MeshSuggestion[] | null {
  const candidates = curriculumCandidates(title, level, depth, taken);
  if (candidates.length === 0) return null;
  const first = pickMix(candidates, level);
  if (first.length === 0) return [];
  const seen = new Set(first.map((item) => normalizeTitle(item.title)));
  const rest = [...candidates]
    .sort(byFit)
    .filter((item) => !seen.has(normalizeTitle(item.title)))
    .map(withoutRank);
  return [...first, ...rest];
}

function studyCatalog(title: string, taken: Set<string>): MeshSuggestion[] {
  const neighbors = studyNeighbors(title).filter((neighbor) => !taken.has(normalizeTitle(neighbor.title)));
  const children = neighbors
    .filter((neighbor) => neighbor.kind === "child")
    .sort((a, b) => {
      const ar = childRank.indexOf(a.title);
      const br = childRank.indexOf(b.title);
      return (ar === -1 ? 99 : ar) - (br === -1 ? 99 : br) || a.title.localeCompare(b.title);
    });
  const parents = neighbors.filter((neighbor) => {
    if (neighbor.kind !== "parent") return false;
    if (children.length === 0) return true;
    const topic = studyTopic(neighbor.title);
    return Boolean(topic && topic.parents.length > 0);
  });
  return [...children, ...parents].map((neighbor) => ({
    title: neighbor.title,
    relationship: neighbor.kind === "parent" ? "required for" : "part of",
    type: neighbor.kind === "parent" ? "prerequisite" : "suggested",
    priority: neighbor.kind === "parent" ? "must" : "should",
    explanation: neighbor.summary,
    whyItMatters:
      neighbor.kind === "parent"
        ? `${neighbor.title} is a foundation for ${title}.`
        : `${neighbor.title} explains ${title}.`,
    focusIsSource: false,
  }));
}

function suggestionCatalog(input: {
  title: string;
  level: Level;
  depth: Depth;
  takenTitles: string[];
}): MeshSuggestion[] {
  const taken = new Set(input.takenTitles.map((title) => normalizeTitle(title)));
  taken.add(normalizeTitle(input.title));
  if (!prefersStudy(input.title)) {
    const fromCurriculum = curriculumCatalog(input.title, input.level, input.depth, taken);
    if (fromCurriculum) return fromCurriculum;
  }
  return studyCatalog(input.title, taken);
}

function suggestionLimit(input: {
  title: string;
  level: Level;
  depth: Depth;
  takenTitles: string[];
  pages?: number;
}, pages: number) {
  const budget = relatedTopicBudget(input.level) * pages;
  if (!prefersStudy(input.title)) return budget;
  const taken = new Set(input.takenTitles.map((title) => normalizeTitle(title)));
  taken.add(normalizeTitle(input.title));
  const children = studyNeighbors(input.title).filter(
    (neighbor) => neighbor.kind === "child" && !taken.has(normalizeTitle(neighbor.title)),
  );
  if (children.length === 0 || children.length > TYPE_LIST_CAP) return budget;
  const base = relatedTopicBudget(input.level);
  return Math.max(budget, children.length + base * (pages - 1));
}

export function suggestionsFor(input: {
  title: string;
  level: Level;
  depth: Depth;
  takenTitles: string[];
  pages?: number;
}): MeshSuggestion[] {
  const pages = input.pages == null || !Number.isFinite(input.pages) ? 1 : Math.max(1, Math.floor(input.pages));
  return suggestionCatalog(input).slice(0, suggestionLimit(input, pages));
}

function passes(concept: { type: ConceptType; priority: Priority; status: KnowledgeStatus }, filters: MeshFilters) {
  if (filters.hideUnderstood && concept.status === "understood") return false;
  if (filters.type !== "all" && concept.type !== filters.type) return false;
  if (filters.priority !== "all" && concept.priority !== filters.priority) return false;
  return true;
}

function conceptCopy(concept: MeshConcept, spaceName: string) {
  const explanation = concept.explanation.trim();
  const why = concept.whyItMatters.trim();
  const reason = concept.prerequisiteReason.trim();
  const model = explanation.length > 0 && !isCatalogCopy(concept.title, explanation);
  const written = studyTopic(concept.title)?.summary || matchCurriculum(concept.title)?.explanation || "";
  const summary = clip(model ? explanation : written || explanation || `${concept.title} is a topic in ${spaceName}.`);
  const description = clip(
    (model && why && !isCatalogCopy(concept.title, why) ? why : "") ||
      [why, reason].find((text) => text.length > 0 && !text.startsWith("You captured") && text !== summary) ||
      "",
  );
  return { summary, description };
}

type Draft = {
  id: string;
  title: string;
  type: ConceptType;
  origin: "user" | "ai" | "space";
  priority: Priority;
  status: KnowledgeStatus;
  role: "space" | "captured" | "related";
  faded: boolean;
  pathLabel: string;
  summary: string;
  description: string;
  relationship: string;
  focusIsSource: boolean;
  conceptId: string | null;
  anchorId: string | null;
  captureNumber: number | null;
  width: number;
  height: number;
  diameter: number;
};

function studyLink(aTitle: string, bTitle: string) {
  const topicA = studyTopic(aTitle);
  const topicB = studyTopic(bTitle);
  if (!topicA || !topicB) return null;
  if (topicB.parents.includes(topicA.title)) {
    return { sourceTitle: topicA.title, targetTitle: topicB.title, relationship: "required for" as const };
  }
  if (topicA.parents.includes(topicB.title)) {
    return { sourceTitle: topicB.title, targetTitle: topicA.title, relationship: "required for" as const };
  }
  return null;
}

function curriculumLink(aTitle: string, bTitle: string, depth: Depth) {
  const left = matchCurriculum(aTitle);
  const right = matchCurriculum(bTitle);
  if (!left || !right || left.title === right.title) return null;
  const edge = curriculumEdges.find(
    (item) =>
      depthRank(depth) >= depthRank(item.minDepth) &&
      ((item.source === left.title && item.target === right.title) ||
        (item.source === right.title && item.target === left.title)),
  );
  if (!edge) return null;
  return { sourceTitle: edge.source, targetTitle: edge.target, relationship: edge.relationship };
}

function linkBetween(aTitle: string, bTitle: string, depth: Depth) {
  if (normalizeTitle(aTitle) === normalizeTitle(bTitle)) return null;
  const study = studyLink(aTitle, bTitle);
  if (prefersStudy(aTitle) || prefersStudy(bTitle)) return study;
  return curriculumLink(aTitle, bTitle, depth) ?? study;
}

type Body = { id: string; cx: number; cy: number; r: number; w: number; h: number; fixed: boolean };

function separate(bodies: Body[], movable: Set<string>) {
  let moved = false;
  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      const a = bodies[i];
      const b = bodies[j];
      const aMove = movable.has(a.id) && !a.fixed;
      const bMove = movable.has(b.id) && !b.fixed;
      if (!aMove && !bMove) continue;
      let dx = b.cx - a.cx;
      let dy = b.cy - a.cy;
      let dist = Math.hypot(dx, dy);
      if (dist < 0.01) {
        dx = 0;
        dy = 1;
        dist = 1;
      }
      const min = a.r + b.r + SEPARATION;
      if (dist >= min) continue;
      const overlap = min - dist;
      dx /= dist;
      dy /= dist;
      if (aMove && bMove) {
        a.cx -= (dx * overlap) / 2;
        a.cy -= (dy * overlap) / 2;
        b.cx += (dx * overlap) / 2;
        b.cy += (dy * overlap) / 2;
      } else if (aMove) {
        a.cx -= dx * overlap;
        a.cy -= dy * overlap;
      } else {
        b.cx += dx * overlap;
        b.cy += dy * overlap;
      }
      moved = true;
    }
  }
  return moved;
}

function relax(bodies: Body[], movable: Set<string>) {
  const home = new Map(bodies.map((body) => [body.id, { cx: body.cx, cy: body.cy }]));
  for (let step = 0; step < 80; step += 1) {
    let moved = separate(bodies, movable);
    holdOffRail(bodies, movable);
    for (const body of bodies) {
      if (!movable.has(body.id) || body.fixed) continue;
      const origin = home.get(body.id);
      if (!origin) continue;
      const dx = body.cx - origin.cx;
      const dy = body.cy - origin.cy;
      const dist = Math.hypot(dx, dy);
      if (dist <= MAX_DRIFT) continue;
      body.cx = origin.cx + (dx / dist) * MAX_DRIFT;
      body.cy = origin.cy + (dy / dist) * MAX_DRIFT;
      moved = true;
    }
    if (!moved) break;
  }
  holdOffRail(bodies, movable);
}

function relaxReadable(bodies: Body[], movable: Set<string>) {
  for (let cycle = 0; cycle < 10; cycle += 1) {
    let moved = false;
    for (let step = 0; step < 50; step += 1) {
      if (!separate(bodies, movable)) break;
      moved = true;
    }
    const nudged = holdOffRail(bodies, movable);
    if (!moved && !nudged) break;
  }
}

function holdOffRail(bodies: Body[], movable: Set<string>) {
  let moved = false;
  for (const body of bodies) {
    if (!movable.has(body.id) || body.fixed) continue;
    const limit = LANE_CLEARANCE + body.r;
    if (Math.abs(body.cy) >= limit) continue;
    body.cy = (body.cy < 0 ? -1 : 1) * limit;
    moved = true;
  }
  return moved;
}

function placeAnchored(bodies: Map<string, Body>, items: Draft[], reachBoost: number, timelineEnd: number, timelineIds: Set<string>) {
  const groups = new Map<string, Draft[]>();
  for (const item of items) {
    const anchorId = item.anchorId ?? "";
    const list = groups.get(anchorId) ?? [];
    list.push(item);
    groups.set(anchorId, list);
  }
  const waiting = new Set(groups.keys());
  for (let pass = 0; pass < groups.size + 1 && waiting.size > 0; pass += 1) {
    let progress = false;
    for (const anchorId of [...waiting]) {
      const anchor = bodies.get(anchorId);
      if (!anchor) continue;
      const group = [...(groups.get(anchorId) ?? [])].sort((a, b) => a.title.localeCompare(b.title));
      const span = Math.max(...group.map((item) => item.diameter)) + SEPARATION;
      const clearance = timelineIds.has(anchor.id) ? LANE_CLEARANCE + reachBoost : NEAR_CLEARANCE;
      group.forEach((item, index) => {
        const r = item.diameter / 2;
        const side = index % 2 === 0 ? 1 : -1;
        const column = Math.floor(index / 2);
        const columns = Math.ceil(group.length / 2);
        bodies.set(item.id, {
          id: item.id,
          cx: anchor.cx + (column - (columns - 1) / 2) * span,
          cy: anchor.cy + side * (anchor.r + r + clearance),
          r,
          w: item.width,
          h: item.height,
          fixed: false,
        });
      });
      waiting.delete(anchorId);
      progress = true;
    }
    if (!progress) break;
  }
  let x = timelineEnd + 48;
  for (const anchorId of waiting) {
    for (const item of groups.get(anchorId) ?? []) {
      const r = item.diameter / 2;
      bodies.set(item.id, { id: item.id, cx: x + r, cy: LANE_CLEARANCE + r, r, w: item.width, h: item.height, fixed: false });
      x += item.diameter + SEPARATION;
    }
  }
}

export function arrangeReadable(nodes: MeshNode[]): Record<string, { x: number; y: number }> {
  const present = new Set(nodes.map((node) => node.id));
  const bodies = new Map<string, Body>();
  for (const node of nodes) {
    bodies.set(node.id, {
      id: node.id,
      cx: node.x + node.width / 2,
      cy: node.y + node.height / 2,
      r: Math.max(node.width, node.height) / 2,
      w: node.width,
      h: node.height,
      fixed: node.role !== "related",
    });
  }
  const groups = new Map<string, MeshNode[]>();
  for (const node of nodes) {
    if (node.role !== "related") continue;
    const anchorId = node.anchorId && present.has(node.anchorId) ? node.anchorId : "";
    const list = groups.get(anchorId) ?? [];
    list.push(node);
    groups.set(anchorId, list);
  }
  const pending = new Set(groups.keys());
  for (let pass = 0; pass < groups.size + 2 && pending.size > 0; pass += 1) {
    let progress = false;
    for (const anchorId of [...pending]) {
      if (anchorId && !bodies.has(anchorId)) continue;
      const anchor = anchorId ? bodies.get(anchorId) : undefined;
      const group = [...(groups.get(anchorId) ?? [])].sort((a, b) => a.title.localeCompare(b.title));
      const span = Math.max(...group.map((node) => Math.max(node.width, node.height))) + SEPARATION;
      const columns = Math.ceil(group.length / 2);
      const origin = anchor ?? { cx: 0, cy: 0, r: 0, fixed: true };
      const clearance = !anchor || anchor.fixed ? LANE_CLEARANCE : NEAR_CLEARANCE;
      group.forEach((node, index) => {
        const body = bodies.get(node.id);
        if (!body) return;
        const side = index % 2 === 0 ? 1 : -1;
        const column = Math.floor(index / 2);
        body.cx = origin.cx + (column - (columns - 1) / 2) * span;
        body.cy = origin.cy + side * (origin.r + body.r + clearance);
      });
      pending.delete(anchorId);
      progress = true;
    }
    if (!progress) break;
  }
  relaxReadable([...bodies.values()], new Set(nodes.filter((node) => node.role === "related").map((node) => node.id)));
  const positions: Record<string, { x: number; y: number }> = {};
  for (const node of nodes) {
    if (node.role !== "related") continue;
    const body = bodies.get(node.id);
    if (!body) continue;
    positions[node.id] = { x: Math.round(body.cx - body.w / 2), y: Math.round(body.cy - body.h / 2) };
  }
  return positions;
}

function layout(timeline: Draft[], opened: Draft[], faded: Draft[]) {
  const bodies = new Map<string, Body>();
  const timelineIds = new Set(timeline.map((item) => item.id));
  let cursor = 0;
  for (const item of timeline) {
    const r = item.width / 2;
    bodies.set(item.id, {
      id: item.id,
      cx: cursor + r,
      cy: 0,
      r,
      w: item.width,
      h: item.height,
      fixed: true,
    });
    cursor += item.width + TIMELINE_GAP;
  }
  placeAnchored(bodies, opened, 0, cursor, timelineIds);
  relax([...bodies.values()], new Set(opened.map((item) => item.id)));
  for (const item of opened) {
    const body = bodies.get(item.id);
    if (body) body.fixed = true;
  }
  placeAnchored(bodies, faded, faded.length > 0 && opened.length > 0 ? 36 : 0, cursor, timelineIds);
  relax([...bodies.values()], new Set(faded.map((item) => item.id)));
  return bodies;
}

export function buildMesh(input: {
  spaceId: string;
  spaceName: string;
  level: Level;
  depth: Depth;
  concepts: MeshConcept[];
  edges: MeshEdge[];
  selectedId: string | null;
  opened: readonly OpenedSuggestion[];
  kept?: readonly OpenedSuggestion[];
  filters: MeshFilters;
  suggestionPages?: Readonly<Record<string, number>>;
}): { nodes: MeshNode[]; links: MeshLink[]; showMore: ShowMore | null } {
  const filters = input.filters;
  const users = input.concepts
    .filter((concept) => concept.origin === "user" && passes(concept, filters))
    .sort((a, b) => (a.captureOrder ?? 9999) - (b.captureOrder ?? 9999) || a.title.localeCompare(b.title));
  const userIds = new Set(users.map((concept) => concept.id));
  const conceptIds = new Set(input.concepts.map((concept) => concept.id));
  const parentOf = (concept: MeshConcept) => {
    if (!concept.parentId || concept.parentId === spaceNodeId(input.spaceId)) return null;
    if (userIds.has(concept.parentId) || conceptIds.has(concept.parentId)) return concept.parentId;
    return null;
  };
  const roots = users.filter((concept) => !parentOf(concept));
  const branches = users.filter((concept) => parentOf(concept));
  const userTitles = new Set(users.map((concept) => normalizeTitle(concept.title)));
  const opened = input.opened.filter((item) => !userTitles.has(normalizeTitle(item.title)));
  const kept = (input.kept ?? []).filter((item) => !userTitles.has(normalizeTitle(item.title)));
  const baseId = spaceNodeId(input.spaceId);
  const taken = users.map((concept) => concept.title);

  const focusFromSelection = (): { id: string; title: string } | null => {
    if (input.selectedId === baseId) return { id: baseId, title: input.spaceName };
    if (!input.selectedId) return null;
    const user = users.find((concept) => concept.id === input.selectedId);
    if (user) return { id: user.id, title: user.title };
    const stored = input.concepts.find((concept) => concept.id === input.selectedId && passes(concept, filters));
    if (stored) return { id: stored.id, title: stored.title };
    const openedHit = opened.find((item) => item.id === input.selectedId);
    if (openedHit) return { id: openedHit.id, title: openedHit.title };
    return null;
  };

  const mainTopic = (): { id: string; title: string } => {
    const aroundSpace = suggestionsFor({
      title: input.spaceName,
      level: input.level,
      depth: input.depth,
      takenTitles: taken,
    });
    if (aroundSpace.length > 0) return { id: baseId, title: input.spaceName };
    if (roots[0]) return { id: roots[0].id, title: roots[0].title };
    return { id: baseId, title: input.spaceName };
  };

  function pageCount(id: string) {
    const raw = input.suggestionPages?.[id];
    if (typeof raw !== "number" || !Number.isFinite(raw)) return 1;
    return Math.max(1, Math.floor(raw));
  }

  const focus = focusFromSelection() ?? mainTopic();
  const focusPages = pageCount(focus.id);
  const focusTaken = focus.id === baseId ? taken : [...taken, input.spaceName];
  const focusSuggestions = suggestionsFor({
    title: focus.title,
    level: input.level,
    depth: input.depth,
    takenTitles: focusTaken,
    pages: focusPages,
  });

  const byId = new Map(input.concepts.map((concept) => [concept.id, concept]));
  const drafts = new Map<string, Draft>();
  const started = roots[0];
  const covering = roots[roots.length - 1];

  const spaceKey = normalizeTitle(input.spaceName);
  const topicOverview = input.concepts.find(
    (concept) => concept.origin === "ai" && normalizeTitle(concept.title) === spaceKey && passes(concept, filters),
  );
  const overviewExplanation = topicOverview?.explanation.trim() ?? "";
  const overviewWhy = topicOverview?.whyItMatters.trim() ?? "";
  const modelOverview = overviewExplanation.length > 0 && !isCatalogCopy(input.spaceName, overviewExplanation);
  const spaceBrief =
    (modelOverview ? overviewExplanation : "") ||
    studyTopic(input.spaceName)?.summary ||
    matchCurriculum(input.spaceName)?.explanation ||
    overviewExplanation ||
    `${input.spaceName} is the base of this timeline. Related topics stay faded until you open them.`;
  const spaceWhy =
    (modelOverview && overviewWhy && !isCatalogCopy(input.spaceName, overviewWhy) ? overviewWhy : "") ||
    matchCurriculum(input.spaceName)?.whyItMatters ||
    overviewWhy;
  drafts.set(baseId, {
    id: baseId,
    title: input.spaceName,
    type: "captured",
    origin: "space",
    priority: "should",
    status: "unfamiliar",
    role: "space",
    faded: false,
    pathLabel: "Start",
    summary: clip(spaceBrief),
    description: clip(spaceWhy && spaceWhy !== spaceBrief ? spaceWhy : ""),
    relationship: "",
    focusIsSource: false,
    conceptId: topicOverview?.id ?? null,
    anchorId: null,
    captureNumber: null,
    ...nodeSize(input.spaceName, "space"),
  });

  users.forEach((concept, index) => {
    const copy = conceptCopy(concept, input.spaceName);
    const parentId = parentOf(concept);
    const pathLabel = !parentId && concept.id === covering?.id && concept.id !== started?.id ? "Now" : "";
    drafts.set(concept.id, {
      id: concept.id,
      title: concept.title,
      type: concept.type,
      origin: "user",
      priority: concept.priority,
      status: concept.status,
      role: "captured",
      faded: false,
      pathLabel,
      summary: copy.summary,
      description: copy.description,
      relationship: parentId ? "part of" : "",
      focusIsSource: false,
      conceptId: concept.id,
      anchorId: parentId,
      captureNumber: index + 1,
      ...nodeSize(concept.title, "captured"),
    });
  });

  function openedMatch(title: string, id: string) {
    return opened.find((item) => item.id === id || normalizeTitle(item.title) === normalizeTitle(title));
  }

  function addSuggestion(suggestion: MeshSuggestion, anchorId: string) {
    if (userTitles.has(normalizeTitle(suggestion.title)) || normalizeTitle(suggestion.title) === normalizeTitle(input.spaceName)) return;
    const existing = input.concepts.find((concept) => normalizeTitle(concept.title) === normalizeTitle(suggestion.title));
    if (existing?.origin === "user") return;
    if (existing && !passes(existing, filters)) return;
    if (!existing && !passes({ type: suggestion.type, priority: suggestion.priority, status: "unfamiliar" }, filters)) return;
    const id = existing?.id ?? `suggest:${titleKey(suggestion.title)}`;
    if (drafts.has(id) && drafts.get(id)?.role !== "related") return;
    const openedItem = openedMatch(suggestion.title, id);
    const solid = openedItem != null;
    if (!solid && anchorId !== focus.id) return;
    const copy = existing
      ? conceptCopy(existing, input.spaceName)
      : { summary: clip(suggestion.explanation), description: clip(suggestion.whyItMatters) };
    const prior = drafts.get(id);
    drafts.set(id, {
      id,
      title: existing?.title ?? suggestion.title,
      type: existing?.type ?? suggestion.type,
      origin: "ai",
      priority: existing?.priority ?? suggestion.priority,
      status: existing?.status ?? "unfamiliar",
      role: "related",
      faded: !solid,
      pathLabel: "",
      summary: prior?.summary || copy.summary,
      description: copy.description,
      relationship: suggestion.relationship,
      focusIsSource: suggestion.focusIsSource,
      conceptId: existing?.id ?? null,
      anchorId: solid ? (openedItem?.anchorId ?? prior?.anchorId ?? anchorId) : anchorId,
      captureNumber: null,
      ...nodeSize(existing?.title ?? suggestion.title, "related"),
    });
  }

  for (const suggestion of focusSuggestions) addSuggestion(suggestion, focus.id);

  // Persisted AI concepts (e.g. after Generate on an unknown topic) are not in the
  // built-in curriculum, so suggestionsFor alone leaves the canvas empty. Surface
  // them as faded neighbors around the current focus.
  const suggestionBudget = relatedTopicBudget(input.level) * focusPages;
  function relatedCount() {
    return [...drafts.values()].filter((draft) => draft.role === "related").length;
  }
  const storedAi = input.concepts
    .filter((concept) => concept.origin === "ai" && passes(concept, filters))
    .filter((concept) => normalizeTitle(concept.title) !== spaceKey)
    .filter((concept) => !userTitles.has(normalizeTitle(concept.title)))
    .sort(
      (a, b) =>
        priorityRank(a.priority) - priorityRank(b.priority) || a.title.localeCompare(b.title),
    );
  for (const concept of storedAi) {
    const already = [...drafts.values()].some(
      (draft) =>
        draft.role === "related" &&
        (draft.conceptId === concept.id || normalizeTitle(draft.title) === normalizeTitle(concept.title)),
    );
    if (already) continue;
    const openedItem = openedMatch(concept.title, concept.id);
    if (!openedItem && relatedCount() >= suggestionBudget) continue;
    const linkedToFocus =
      focus.id === baseId ||
      input.edges.some(
        (edge) =>
          (edge.sourceId === concept.id && edge.targetId === focus.id) ||
          (edge.targetId === concept.id && edge.sourceId === focus.id),
      );
    if (!openedItem && focus.id !== baseId && !linkedToFocus) continue;
    const edge = input.edges.find(
      (item) =>
        item.sourceId === concept.id ||
        item.targetId === concept.id ||
        item.sourceId === focus.id ||
        item.targetId === focus.id,
    );
    const relationship = (
      edge && ["required for", "is a type of", "uses", "supports", "part of", "same as", "demonstrates"].includes(edge.relationship)
        ? edge.relationship
        : concept.type === "prerequisite"
          ? "required for"
          : "part of"
    ) as MeshSuggestion["relationship"];
    const type: MeshSuggestion["type"] = concept.type === "prerequisite" ? "prerequisite" : "suggested";
    addSuggestion(
      {
        title: concept.title,
        relationship,
        type,
        priority: concept.priority,
        explanation: concept.explanation.trim() || `${concept.title} relates to ${input.spaceName}.`,
        whyItMatters: concept.whyItMatters.trim() || concept.prerequisiteReason.trim(),
        focusIsSource: edge ? edge.sourceId === focus.id || edge.sourceId === baseId : false,
      },
      focus.id,
    );
  }

  for (const item of opened) {
    const existingDraft =
      drafts.get(item.id) ??
      [...drafts.values()].find((draft) => normalizeTitle(draft.title) === normalizeTitle(item.title));
    if (existingDraft) {
      if (existingDraft.role === "related") {
        existingDraft.faded = false;
        existingDraft.anchorId = item.anchorId;
      }
      continue;
    }
    const anchorTitle =
      item.anchorId === baseId
        ? input.spaceName
        : (byId.get(item.anchorId)?.title ?? opened.find((entry) => entry.id === item.anchorId)?.title ?? "");
    const suggestion =
      (anchorTitle
        ? suggestionsFor({
            title: anchorTitle,
            level: input.level,
            depth: input.depth,
            takenTitles: focusTaken,
          }).find((entry) => normalizeTitle(entry.title) === normalizeTitle(item.title))
        : null) ?? null;
    const existing = input.concepts.find((concept) => concept.id === item.id || normalizeTitle(concept.title) === normalizeTitle(item.title));
    if (existing?.origin === "user") continue;
    if (existing && !passes(existing, filters)) continue;
    const copy = existing
      ? conceptCopy(existing, input.spaceName)
      : {
          summary: clip(suggestion?.explanation || `${item.title} is a related topic in ${input.spaceName}.`),
          description: clip(suggestion?.whyItMatters ?? ""),
        };
    drafts.set(item.id, {
      id: item.id,
      title: existing?.title ?? item.title,
      type: existing?.type ?? suggestion?.type ?? "suggested",
      origin: "ai",
      priority: existing?.priority ?? suggestion?.priority ?? "should",
      status: existing?.status ?? "unfamiliar",
      role: "related",
      faded: false,
      pathLabel: "",
      summary: copy.summary,
      description: copy.description,
      relationship: suggestion?.relationship ?? "",
      focusIsSource: suggestion?.focusIsSource ?? false,
      conceptId: existing?.id ?? null,
      anchorId: item.anchorId,
      captureNumber: null,
      ...nodeSize(existing?.title ?? item.title, "related"),
    });
  }

  for (const item of kept) {
    if (openedMatch(item.title, item.id)) continue;
    const existingDraft =
      drafts.get(item.id) ??
      [...drafts.values()].find((draft) => normalizeTitle(draft.title) === normalizeTitle(item.title));
    if (existingDraft) continue;
    const anchorTitle =
      item.anchorId === baseId
        ? input.spaceName
        : (byId.get(item.anchorId)?.title ?? opened.find((entry) => entry.id === item.anchorId)?.title ?? "");
    const suggestion =
      (anchorTitle
        ? suggestionsFor({
            title: anchorTitle,
            level: input.level,
            depth: input.depth,
            takenTitles: focusTaken,
          }).find((entry) => normalizeTitle(entry.title) === normalizeTitle(item.title))
        : null) ?? null;
    const existing = input.concepts.find((concept) => concept.id === item.id || normalizeTitle(concept.title) === normalizeTitle(item.title));
    if (existing?.origin === "user") continue;
    if (existing && !passes(existing, filters)) continue;
    const copy = existing
      ? conceptCopy(existing, input.spaceName)
      : {
          summary: clip(suggestion?.explanation || `${item.title} is a related topic in ${input.spaceName}.`),
          description: clip(suggestion?.whyItMatters ?? ""),
        };
    drafts.set(item.id, {
      id: item.id,
      title: existing?.title ?? item.title,
      type: existing?.type ?? suggestion?.type ?? "suggested",
      origin: "ai",
      priority: existing?.priority ?? suggestion?.priority ?? "should",
      status: existing?.status ?? "unfamiliar",
      role: "related",
      faded: true,
      pathLabel: "",
      summary: copy.summary,
      description: copy.description,
      relationship: suggestion?.relationship ?? "",
      focusIsSource: suggestion?.focusIsSource ?? false,
      conceptId: existing?.id ?? null,
      anchorId: item.anchorId,
      captureNumber: null,
      ...nodeSize(existing?.title ?? item.title, "related"),
    });
  }

  // Every saved suggestion stays on the canvas, faded beside the node it links to.
  for (const concept of storedAi) {
    if (concept.id === focus.id) continue;
    const already = [...drafts.values()].some(
      (draft) => draft.conceptId === concept.id || normalizeTitle(draft.title) === normalizeTitle(concept.title),
    );
    if (already) continue;
    const links = input.edges.filter((edge) => edge.sourceId === concept.id || edge.targetId === concept.id);
    const otherOf = (edge: MeshEdge) => (edge.sourceId === concept.id ? edge.targetId : edge.sourceId);
    const anchorEdge =
      links.find((edge) => drafts.get(otherOf(edge))?.role === "captured") ??
      links.find((edge) => drafts.has(otherOf(edge))) ??
      null;
    const anchorId = anchorEdge ? otherOf(anchorEdge) : baseId;
    const copy = conceptCopy(concept, input.spaceName);
    drafts.set(concept.id, {
      id: concept.id,
      title: concept.title,
      type: concept.type,
      origin: "ai",
      priority: concept.priority,
      status: concept.status,
      role: "related",
      faded: true,
      pathLabel: "",
      summary: copy.summary,
      description: copy.description,
      relationship: anchorEdge?.relationship ?? (concept.type === "prerequisite" ? "required for" : "part of"),
      focusIsSource: anchorEdge ? anchorEdge.targetId === concept.id : false,
      conceptId: concept.id,
      anchorId,
      captureNumber: null,
      ...nodeSize(concept.title, "related"),
    });
  }

  if (!drafts.has(focus.id)) {
    const concept = byId.get(focus.id);
    if (concept && concept.origin !== "user" && passes(concept, filters)) {
      const copy = conceptCopy(concept, input.spaceName);
      const anchorEdge = input.edges.find((edge) => edge.sourceId === concept.id || edge.targetId === concept.id);
      const otherId = anchorEdge ? (anchorEdge.sourceId === concept.id ? anchorEdge.targetId : anchorEdge.sourceId) : null;
      const anchorId = otherId && (otherId === baseId || users.some((user) => user.id === otherId)) ? otherId : (users[0]?.id ?? baseId);
      drafts.set(concept.id, {
        id: concept.id,
        title: concept.title,
        type: concept.type,
        origin: "ai",
        priority: concept.priority,
        status: concept.status,
        role: "related",
        faded: false,
        pathLabel: "",
        summary: copy.summary,
        description: copy.description,
        relationship: "",
        focusIsSource: false,
        conceptId: concept.id,
        anchorId,
        captureNumber: null,
        ...nodeSize(concept.title, "related"),
      });
    }
  }

  function listedSuggestions(title: string, focusId: string, pages: number) {
    const takenTitles = focusId === baseId ? taken : [...taken, input.spaceName];
    return suggestionsFor({
      title,
      level: input.level,
      depth: input.depth,
      takenTitles,
      pages,
    }).filter(
      (suggestion) =>
        passes({ type: suggestion.type, priority: suggestion.priority, status: "unfamiliar" }, filters) &&
        !userTitles.has(normalizeTitle(suggestion.title)) &&
        normalizeTitle(suggestion.title) !== spaceKey,
    );
  }

  function suggestionTitles(focusId: string, title: string, pages: number) {
    const listed = listedSuggestions(title, focusId, pages);
    const titles = new Set(listed.map((item) => normalizeTitle(item.title)));
    const limit = relatedTopicBudget(input.level) * pages;
    let related = listed.length;
    for (const concept of storedAi) {
      const key = normalizeTitle(concept.title);
      if (titles.has(key)) continue;
      const openedItem = openedMatch(concept.title, concept.id);
      const linkedToFocus =
        focusId === baseId ||
        input.edges.some(
          (edge) =>
            (edge.sourceId === concept.id && edge.targetId === focusId) ||
            (edge.targetId === concept.id && edge.sourceId === focusId),
        );
      if (!openedItem && focusId !== baseId && !linkedToFocus) continue;
      if (!openedItem && related >= limit) continue;
      titles.add(key);
      related += 1;
    }
    return titles;
  }

  function parentIdOf(id: string) {
    if (id === baseId) return null;
    const draft = drafts.get(id);
    if (draft?.role === "space") return null;
    if (draft?.anchorId && draft.anchorId !== id && drafts.has(draft.anchorId)) return draft.anchorId;
    return drafts.has(baseId) ? baseId : null;
  }

  let showMore: ShowMore | null = null;
  const visible = new Set(
    [...drafts.values()].filter((draft) => draft.role === "related").map((draft) => normalizeTitle(draft.title)),
  );
  const focusNext = suggestionTitles(focus.id, focus.title, focusPages + 1);
  if ([...focusNext].some((title) => !visible.has(title))) {
    showMore = { action: "expand", focusId: focus.id };
  } else {
    const seen = new Set<string>([focus.id]);
    let cursor: string | null = focus.id;
    while (cursor && !showMore) {
      const parentId = parentIdOf(cursor);
      if (!parentId || seen.has(parentId)) break;
      seen.add(parentId);
      const parent = drafts.get(parentId);
      if (!parent) break;
      const pages = pageCount(parentId);
      const parentTitles = suggestionTitles(parentId, parent.title, pages);
      const parentHasHidden = [...parentTitles].some((title) => !visible.has(title));
      const parentHasNext = suggestionTitles(parentId, parent.title, pages + 1).size > parentTitles.size;
      if (parentTitles.size > 0 && (parentHasNext || parentHasHidden)) {
        showMore = { action: "parent", parentId, parentTitle: parent.title };
      }
      cursor = parentId;
    }
  }

  const timeline = [drafts.get(baseId)!, ...roots.map((concept) => drafts.get(concept.id)!)];
  const related = [...drafts.values()].filter((draft) => draft.role === "related");
  const children = branches.map((concept) => drafts.get(concept.id)!);
  const bodies = layout(
    timeline,
    [...related.filter((draft) => !draft.faded), ...children],
    related.filter((draft) => draft.faded),
  );

  const nodes: MeshNode[] = [...drafts.values()].map((draft) => {
    const body = bodies.get(draft.id);
    const x = body ? Math.round(body.cx - body.w / 2) : 0;
    const y = body ? Math.round(body.cy - body.h / 2) : 0;
    return {
      id: draft.id,
      title: draft.title,
      type: draft.type,
      origin: draft.origin,
      priority: draft.priority,
      status: draft.status,
      role: draft.role,
      faded: draft.faded,
      pathLabel: draft.pathLabel,
      summary: draft.summary,
      description: draft.description,
      relationship: draft.relationship,
      conceptId: draft.conceptId,
      anchorId: draft.anchorId,
      captureNumber: draft.captureNumber,
      x,
      y,
      width: body?.w ?? draft.width,
      height: body?.h ?? draft.height,
      diameter: draft.diameter,
    };
  });

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const titleToId = new Map<string, string>();
  for (const node of nodes) titleToId.set(normalizeTitle(node.title), node.id);

  const links: MeshLink[] = [];
  const pairs = new Set<string>();
  function addLink(source: string, target: string, label: string | undefined, origin: "user" | "ai", kind: "timeline" | "mesh") {
    if (!source || !target || source === target || !nodeById.has(source) || !nodeById.has(target)) return;
    const key = source < target ? `${source}|${target}` : `${target}|${source}`;
    if (pairs.has(key)) return;
    pairs.add(key);
    const faded = Boolean(nodeById.get(source)?.faded || nodeById.get(target)?.faded);
    links.push({
      id: `${kind}:${source}:${target}`,
      source,
      target,
      label,
      faded,
      origin,
      kind,
    });
  }

  for (const edge of input.edges) {
    addLink(edge.sourceId, edge.targetId, edge.relationship, edge.origin, "mesh");
  }

  for (const draft of [...related, ...children]) {
    if (!draft.anchorId) continue;
    const source = draft.focusIsSource ? draft.anchorId : draft.id;
    const target = draft.focusIsSource ? draft.id : draft.anchorId;
    addLink(source, target, draft.relationship || undefined, draft.origin === "user" ? "user" : "ai", "mesh");
  }

  const titles = nodes.map((node) => ({ id: node.id, title: node.title }));
  for (let i = 0; i < titles.length; i += 1) {
    for (let j = i + 1; j < titles.length; j += 1) {
      const linked = linkBetween(titles[i].title, titles[j].title, input.depth);
      if (!linked) continue;
      const sourceId = titleToId.get(normalizeTitle(linked.sourceTitle));
      const targetId = titleToId.get(normalizeTitle(linked.targetTitle));
      if (!sourceId || !targetId) continue;
      addLink(sourceId, targetId, linked.relationship, "ai", "mesh");
    }
  }

  for (let index = 0; index < timeline.length - 1; index += 1) {
    addLink(timeline[index].id, timeline[index + 1].id, undefined, "user", "timeline");
  }

  return { nodes, links, showMore };
}
