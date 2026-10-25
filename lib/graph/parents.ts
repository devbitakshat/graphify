import type { AiConfig } from "../ai/settings";
import { curriculumEdges } from "./curriculum";
import { normalizeTitle } from "./normalize";
import { matchCurriculum } from "./plan";
import { isKnownAncestor, studyTopic } from "./topics";

export type ParentChoice = {
  id: string;
  title: string;
};

function titlesMatch(left: string, right: string) {
  const a = matchCurriculum(left);
  const b = matchCurriculum(right);
  if (a && b) return a.title === b.title;
  return normalizeTitle(left) === normalizeTitle(right);
}

function broaderThan(candidateTitle: string, otherTitle: string) {
  const candidate = matchCurriculum(candidateTitle);
  const other = matchCurriculum(otherTitle);
  if (!candidate || !other) return false;
  return curriculumEdges.some(
    (edge) =>
      (edge.relationship === "is a type of" || edge.relationship === "part of") &&
      edge.source === other.title &&
      edge.target === candidate.title,
  );
}

export function curriculumParentId(title: string, concepts: ParentChoice[]): string | null {
  const focus = matchCurriculum(title);
  if (!focus) return null;
  const scored: Array<{ id: string; score: number }> = [];
  for (const concept of concepts) {
    if (titlesMatch(title, concept.title)) continue;
    const other = matchCurriculum(concept.title);
    if (!other) continue;
    for (const edge of curriculumEdges) {
      const nests =
        (edge.relationship === "is a type of" || edge.relationship === "part of") &&
        edge.source === focus.title &&
        edge.target === other.title;
      if (!nests) continue;
      scored.push({ id: concept.id, score: edge.relationship === "is a type of" ? 0 : 1 });
    }
  }
  if (scored.length === 0) return null;
  const ids = new Set(scored.map((item) => item.id));
  const specific = scored.filter((candidate) => {
    const concept = concepts.find((item) => item.id === candidate.id);
    if (!concept) return false;
    return !concepts.some(
      (other) => other.id !== concept.id && ids.has(other.id) && broaderThan(concept.title, other.title),
    );
  });
  const pool = specific.length > 0 ? specific : scored;
  pool.sort((a, b) => a.score - b.score);
  return pool[0]?.id ?? null;
}

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse(fenced ? fenced[1] : text) as unknown;
}

const parentPrompt = `You choose the parent of each concept in one learning space. Return JSON only.
The space is the root. parentTitle null means the concept hangs directly on the space.
parentTitle must exactly match another concept title, or be null.
Put a concept under the most specific topic it is part of.
Do not put a broad topic under a narrower topic.
Do not create a cycle.
Example: space "Python" and concepts "object oriented programming" and "abstraction". abstraction belongs under "object oriented programming". object oriented programming belongs under the space.
Shape: {"parents":[{"title":"","parentTitle":null}]}`;

export async function modelParentIds(input: { spaceName: string; concepts: ParentChoice[]; ai: AiConfig | null }) {
  const decided = new Map<string, string | null>();
  if (!input.ai || input.concepts.length < 2) return decided;
  const base = input.ai.baseUrl.replace(/\/$/, "");
  const model = input.ai.model;
  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.ai.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        ...(/gpt-oss|groq\.com/i.test(`${model} ${base}`)
          ? { reasoning_format: "hidden", max_completion_tokens: 2048 }
          : {}),
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: parentPrompt },
          {
            role: "user",
            content: JSON.stringify({
              spaceName: input.spaceName,
              concepts: input.concepts.map((concept) => concept.title),
            }),
          },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = extractJson(content) as { parents?: Array<{ title?: string; parentTitle?: string | null }> };
    for (const item of parsed.parents ?? []) {
      if (!item.title) continue;
      const concept = input.concepts.find((candidate) => titlesMatch(candidate.title, item.title ?? ""));
      if (!concept) continue;
      if (!item.parentTitle) {
        decided.set(concept.id, null);
        continue;
      }
      const parent = input.concepts.find(
        (candidate) => candidate.id !== concept.id && titlesMatch(candidate.title, item.parentTitle ?? ""),
      );
      decided.set(concept.id, parent?.id ?? null);
    }
  } catch {
    return null;
  }
  return decided;
}

function containedParentId(title: string, concepts: ParentChoice[]) {
  const norm = normalizeTitle(title);
  let best: { id: string; length: number } | null = null;
  for (const concept of concepts) {
    const other = normalizeTitle(concept.title);
    const words = other.split(" ").filter(Boolean);
    if (words.length < 2 && other.length < 8) continue;
    if (!other || other === norm) continue;
    const at = norm.indexOf(other);
    if (at < 0) continue;
    const before = at === 0 || norm[at - 1] === " ";
    const after = at + other.length === norm.length || norm[at + other.length] === " ";
    if (!before || !after) continue;
    if (!best || other.length > best.length) best = { id: concept.id, length: other.length };
  }
  return best?.id ?? null;
}

export function isCurriculumAncestor(ancestorTitle: string, descendantTitle: string) {
  const ancestor = matchCurriculum(ancestorTitle);
  const start = matchCurriculum(descendantTitle);
  if (!ancestor || !start || ancestor.title === start.title) return false;
  const seen = new Set<string>();
  const stack = [start.title];
  while (stack.length > 0) {
    const title = stack.pop();
    if (!title || seen.has(title)) continue;
    seen.add(title);
    if (title === ancestor.title && title !== start.title) return true;
    for (const edge of curriculumEdges) {
      const nests = edge.relationship === "is a type of" || edge.relationship === "part of";
      if (nests && edge.source === title) stack.push(edge.target);
    }
  }
  return false;
}

export function nestsUnder(ancestorTitle: string, descendantTitle: string) {
  return isKnownAncestor(ancestorTitle, descendantTitle) || isCurriculumAncestor(ancestorTitle, descendantTitle);
}

export function knownParentId(title: string, concepts: ParentChoice[]) {
  const topic = studyTopic(title);
  if (!topic) return null;
  for (const parentTitle of topic.parents) {
    const parent = concepts.find((concept) => studyTopic(concept.title)?.title === parentTitle);
    if (parent) return parent.id;
  }
  return null;
}

export function suggestParentId(title: string, concepts: ParentChoice[]) {
  const others = concepts.filter((concept) => !titlesMatch(concept.title, title));
  const known = knownParentId(title, others);
  if (known) return known;
  const fromCurriculum = curriculumParentId(title, others);
  if (fromCurriculum) return fromCurriculum;
  const contained = containedParentId(title, others);
  if (!contained) return null;
  const parent = others.find((concept) => concept.id === contained);
  if (parent && nestsUnder(title, parent.title)) return null;
  return contained;
}

export function resolveParents(
  concepts: Array<{ id: string; title: string; parentId: string | null }>,
  locks: ReadonlyMap<string, string>,
) {
  const choices = concepts.map((concept) => ({ id: concept.id, title: concept.title }));
  const desired = new Map<string, string | null>();
  for (const concept of concepts) {
    const lock = locks.get(concept.id);
    if (lock && concepts.some((item) => item.id === lock && item.id !== concept.id)) {
      desired.set(concept.id, lock);
      continue;
    }
    const suggested = suggestParentId(concept.title, choices.filter((item) => item.id !== concept.id));
    if (suggested) {
      desired.set(concept.id, suggested);
      continue;
    }
    const current = concepts.find((item) => item.id === concept.parentId);
    if (current && nestsUnder(concept.title, current.title)) {
      desired.set(concept.id, null);
      continue;
    }
    desired.set(concept.id, concept.parentId);
  }
  for (let guard = concepts.length + 1; guard > 0; guard -= 1) {
    let changed = false;
    for (const concept of concepts) {
      if (locks.has(concept.id) && desired.get(concept.id) === locks.get(concept.id)) continue;
      const parentId = desired.get(concept.id);
      if (parentId && parentCreatesCycle(concept.id, parentId, desired)) {
        desired.set(concept.id, null);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return desired;
}

export async function decideParentId(input: {
  spaceName: string;
  title: string;
  concepts: ParentChoice[];
  ai: AiConfig | null;
}) {
  const local = suggestParentId(input.title, input.concepts);
  if (local) return { parentId: local, inferred: true };
  if (!input.ai) return { parentId: null, inferred: true };
  const model = await modelParentIds({
    spaceName: input.spaceName,
    concepts: [...input.concepts, { id: "new", title: input.title }],
    ai: input.ai,
  });
  if (!model) return { parentId: null, inferred: false };
  const parentId = model.get("new");
  const parent = input.concepts.find((concept) => concept.id === parentId);
  if (!parentId || parentId === "new" || !parent || nestsUnder(input.title, parent.title)) {
    return { parentId: null, inferred: true };
  }
  return { parentId, inferred: true };
}

export function parentCreatesCycle(childId: string, parentId: string, parents: Map<string, string | null>) {
  let cursor: string | null = parentId;
  const seen = new Set<string>();
  while (cursor) {
    if (cursor === childId || seen.has(cursor)) return true;
    seen.add(cursor);
    cursor = parents.get(cursor) ?? null;
  }
  return false;
}
