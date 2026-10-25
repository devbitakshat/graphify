import type { Depth, Level, Priority, Relationship } from "../domain";
import { curriculum, curriculumEdges, type CurriculumNode } from "./curriculum";
import { normalizeTitle } from "./normalize";
import { matchCurriculum } from "./plan";

export type RelatedTopic = {
  title: string;
  relationship: Relationship;
  reason: string;
  explanation: string;
  whyItMatters: string;
  example: string;
  effort: string;
  priority: Priority;
  type: "prerequisite" | "suggested";
  focusIsSource: boolean;
};

export function relatedTopicBudget(level: Level) {
  if (level === "beginner") return 4;
  if (level === "intermediate") return 6;
  return 8;
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

export function relatedTopics(input: {
  title: string;
  level: Level;
  depth: Depth;
  takenTitles: string[];
}): RelatedTopic[] {
  const focus = matchCurriculum(input.title);
  if (!focus) return [];
  const taken = new Set(input.takenTitles.map((title) => normalizeTitle(title)));
  taken.add(normalizeTitle(focus.title));

  const ranked: Array<RelatedTopic & { score: number }> = [];
  for (const edge of curriculumEdges) {
    if (depthRank(input.depth) < depthRank(edge.minDepth)) continue;
    const focusIsSource = edge.source === focus.title;
    const focusIsTarget = edge.target === focus.title;
    if (!focusIsSource && !focusIsTarget) continue;
    const otherTitle = focusIsSource ? edge.target : edge.source;
    const other = curriculum.find((node) => node.title === otherTitle);
    if (!other || !allowsLevel(other, input.level) || taken.has(normalizeTitle(other.title))) continue;

    const otherIsSource = !focusIsSource;
    let score = 8;
    if (edge.relationship === "required for" && otherIsSource) score = 0;
    else if (edge.relationship === "is a type of" && focusIsSource) score = 1;
    else if (edge.relationship === "uses" && focusIsSource) score = 3;
    else if (edge.relationship === "part of" && otherIsSource) score = 4;
    else if (edge.relationship === "supports" && otherIsSource) score = 5;

    const type =
      score === 0 || (edge.relationship === "is a type of" && focusIsSource) ? "prerequisite" : "suggested";
    ranked.push({
      score,
      title: other.title,
      relationship: edge.relationship,
      reason: edge.reason,
      explanation: other.explanation,
      whyItMatters: other.whyItMatters,
      example: other.example,
      effort: other.effort,
      priority: other.priority,
      type,
      focusIsSource,
    });
  }

  ranked.sort((a, b) => a.score - b.score || priorityRank(a.priority) - priorityRank(b.priority) || a.title.localeCompare(b.title));
  const unique: Array<RelatedTopic & { score: number }> = [];
  const seen = new Set<string>();
  for (const topic of ranked) {
    if (seen.has(topic.title)) continue;
    seen.add(topic.title);
    unique.push(topic);
  }
  return unique.slice(0, relatedTopicBudget(input.level)).map(({ score: _score, ...topic }) => topic);
}
