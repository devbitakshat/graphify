import { randomUUID } from "node:crypto";
import {
  conceptTypes,
  depths,
  goals,
  isOneOf,
  levels,
  preferences,
  priorities,
  relationships,
  statuses,
  type ConceptType,
  type Depth,
  type Goal,
  type GraphConcept,
  type GraphEdge,
  type GraphResource,
  type GraphView,
  type KnowledgeStatus,
  type Level,
  type Preference,
  type Priority,
} from "../domain";
import { getAiConfig } from "../ai/settings";
import { dbOne, dbQuery, isUniqueViolation, withTransaction, type Sql } from "../db/client";
import type { ConceptWrite, MergeResult, StoredConcept, StoredEdge } from "../graph/merge";
import { suggestionsFor } from "../graph/mesh";
import { normalizeTitle } from "../graph/normalize";
import { decideParentId, resolveParents } from "../graph/parents";
import { relateConcept } from "../graph/relate";
import { spaceNodeId } from "../graph/timeline";
import { acceptedResourceUrl } from "../resources/rank";

type SpaceRow = {
  id: string;
  user_id: string;
  name: string;
  goal: string;
  level: string;
  depth: string;
  time_available: string;
  resource_preference: string;
  updated_at: Date | string;
};

export type LearningSpace = {
  id: string;
  userId: string;
  name: string;
  goal: Goal;
  level: Level;
  depth: Depth;
  timeAvailable: string;
  resourcePreference: Preference;
  updatedAt: string;
};

export type SpaceSummary = LearningSpace & {
  understood: number;
  total: number;
  nodes: number;
};

function inScopeConcept(concept: { priority: string; type: string }) {
  return concept.priority !== "out_of_scope" && concept.type !== "project" && concept.type !== "resource";
}

function progressCounts(concepts: Array<{ origin: string; status: string; priority: string; type: string }>) {
  const captured = concepts.filter((concept) => concept.origin === "user" && inScopeConcept(concept));
  const nodes = concepts.filter((concept) => inScopeConcept(concept));
  return {
    understood: captured.filter((concept) => concept.status === "understood").length,
    total: captured.length,
    nodes: nodes.length,
  };
}

function text(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return value == null ? "" : String(value);
}

function numberOrNull(value: unknown) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function booleanValue(value: unknown) {
  return value === true || value === "true" || value === "t";
}

function enumValue<T extends string>(values: readonly T[], value: unknown, fallback: T): T {
  const textValue = text(value);
  return isOneOf(values, textValue) ? textValue : fallback;
}

function mapSpace(row: SpaceRow): LearningSpace {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    goal: enumValue(goals, row.goal, "curiosity"),
    level: enumValue(levels, row.level, "beginner"),
    depth: enumValue(depths, row.depth, "overview"),
    timeAvailable: row.time_available,
    resourcePreference: enumValue(preferences, row.resource_preference, "any"),
    updatedAt: text(row.updated_at),
  };
}

function placeholders(start: number, count: number) {
  return Array.from({ length: count }, (_, index) => `$${start + index}`).join(", ");
}

export async function findUserById(id: string) {
  return dbOne<{ id: string; email: string; name: string }>(
    "select id, email, name from users where id = $1",
    [id],
  );
}

/**
 * Profile row keyed to Supabase Auth user id.
 * If an older local row owns the same email under a different id, re-key it to Auth.
 */
export async function upsertProfile(input: { id: string; email: string; name: string }) {
  const email = input.email.toLowerCase();
  return withTransaction(async (sql) => {
    const byId = await sql.query<{ id: string; email: string; name: string }>(
      "select id, email, name from users where id = $1",
      [input.id],
    );
    if (byId[0]) {
      const rows = await sql.query<{ id: string; email: string; name: string }>(
        "update users set email = $2, name = $3 where id = $1 returning id, email, name",
        [input.id, email, input.name],
      );
      return rows[0]!;
    }

    const byEmail = await sql.query<{ id: string }>("select id from users where email = $1", [email]);
    const oldId = byEmail[0]?.id;
    if (oldId && oldId !== input.id) {
      // Free the email, insert Auth user, move owned rows, drop the orphan profile.
      await sql.query("update users set email = $2 where id = $1", [
        oldId,
        `__migrating_${oldId}@local.invalid`,
      ]);
      await sql.query("insert into users (id, email, name) values ($1, $2, $3)", [
        input.id,
        email,
        input.name,
      ]);
      await sql.query("update learning_spaces set user_id = $1 where user_id = $2", [input.id, oldId]);
      await sql.query("update learning_progress set user_id = $1 where user_id = $2", [input.id, oldId]);
      await sql.query("update concepts set user_id = $1 where user_id = $2", [input.id, oldId]);
      await sql.query("update concept_relationships set user_id = $1 where user_id = $2", [input.id, oldId]);
      await sql.query("update graph_generations set user_id = $1 where user_id = $2", [input.id, oldId]);
      await sql.query("update resources set user_id = $1 where user_id = $2", [input.id, oldId]);
      await sql.query("update captured_sources set user_id = $1 where user_id = $2", [input.id, oldId]);
      await sql.query("update ai_settings set user_id = $1 where user_id = $2", [input.id, oldId]);
      await sql.query("delete from users where id = $1", [oldId]);
      return { id: input.id, email, name: input.name };
    }

    try {
      const rows = await sql.query<{ id: string; email: string; name: string }>(
        "insert into users (id, email, name) values ($1, $2, $3) returning id, email, name",
        [input.id, email, input.name],
      );
      if (!rows[0]) throw new Error("Could not create the account.");
      return rows[0];
    } catch (error) {
      if (isUniqueViolation(error)) throw new Error("An account with that email already exists.");
      throw error;
    }
  });
}

/** Test helper: create a profile without going through Supabase Auth. */
export async function createUser(input: { email: string; name: string; id?: string }) {
  return upsertProfile({
    id: input.id ?? randomUUID(),
    email: input.email,
    name: input.name,
  });
}

export async function listSpaces(userId: string): Promise<SpaceSummary[]> {
  const rows = await dbQuery<
    SpaceRow & { understood: number | string; total: number | string; nodes: number | string }
  >(
    `select s.id, s.user_id, s.name, s.goal, s.level, s.depth, s.time_available, s.resource_preference, s.updated_at,
            count(c.id) filter (
              where c.dismissed_at is null and c.origin = 'user'
                and c.priority <> 'out_of_scope' and c.type not in ('project', 'resource')
            ) as total,
            count(c.id) filter (
              where c.dismissed_at is null and c.origin = 'user'
                and c.priority <> 'out_of_scope' and c.type not in ('project', 'resource')
                and c.status = 'understood'
            ) as understood,
            count(c.id) filter (
              where c.dismissed_at is null
                and c.priority <> 'out_of_scope' and c.type not in ('project', 'resource')
            ) as nodes
     from learning_spaces s
     left join concepts c on c.space_id = s.id
     where s.user_id = $1
     group by s.id
     order by s.updated_at desc`,
    [userId],
  );
  return rows.map((row) => ({
    ...mapSpace(row),
    understood: Number(row.understood) || 0,
    total: Number(row.total) || 0,
    nodes: Number(row.nodes) || 0,
  }));
}

export async function getSpaceForUser(userId: string, spaceId: string) {
  const row = await dbOne<SpaceRow>(
    `select id, user_id, name, goal, level, depth, time_available, resource_preference, updated_at
     from learning_spaces where id = $1 and user_id = $2`,
    [spaceId, userId],
  );
  return row ? mapSpace(row) : null;
}

export async function createSpace(userId: string, input: Omit<LearningSpace, "id" | "userId" | "updatedAt">) {
  const row = await dbOne<SpaceRow>(
    `insert into learning_spaces (id, user_id, name, goal, level, depth, time_available, resource_preference)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning id, user_id, name, goal, level, depth, time_available, resource_preference, updated_at`,
    [randomUUID(), userId, input.name, input.goal, input.level, input.depth, input.timeAvailable, input.resourcePreference],
  );
  if (!row) throw new Error("Could not create the learning space.");
  return mapSpace(row);
}

export async function updateSpace(userId: string, spaceId: string, input: Omit<LearningSpace, "id" | "userId" | "updatedAt">) {
  const row = await dbOne<SpaceRow>(
    `update learning_spaces
     set name = $3, goal = $4, level = $5, depth = $6, time_available = $7, resource_preference = $8, updated_at = now()
     where id = $1 and user_id = $2
     returning id, user_id, name, goal, level, depth, time_available, resource_preference, updated_at`,
    [spaceId, userId, input.name, input.goal, input.level, input.depth, input.timeAvailable, input.resourcePreference],
  );
  return row ? mapSpace(row) : null;
}

export async function deleteSpace(userId: string, spaceId: string) {
  const rows = await dbQuery<{ id: string }>("delete from learning_spaces where id = $1 and user_id = $2 returning id", [
    spaceId,
    userId,
  ]);
  return rows.length > 0;
}

type ConceptRow = {
  id: string;
  space_id: string;
  title: string;
  normalized_title: string;
  type: string;
  origin: string;
  priority: string;
  explanation: string;
  why_it_matters: string;
  goal_relationship: string;
  example: string;
  effort: string;
  prerequisite_reason: string;
  status: string;
  parent_concept_id: string | null;
  position_x: number | string | null;
  position_y: number | string | null;
  learning_order: number | string | null;
  capture_order: number | string | null;
  dismissed_at: Date | string | null;
  dismissed_by: string | null;
  source_url: string | null;
  source_note: string | null;
};

function mapStored(row: ConceptRow): StoredConcept {
  return {
    id: row.id,
    title: row.title,
    normalizedTitle: row.normalized_title,
    type: enumValue(conceptTypes, row.type, "suggested"),
    origin: row.origin === "user" ? "user" : "ai",
    priority: enumValue(priorities, row.priority, "should"),
    status: enumValue(statuses, row.status, "unfamiliar"),
    positionX: numberOrNull(row.position_x),
    positionY: numberOrNull(row.position_y),
    dismissedBy: row.dismissed_at || row.dismissed_by === "user" ? "user" : null,
  };
}

function mapViewConcept(row: ConceptRow): GraphConcept {
  const stored = mapStored(row);
  return {
    ...stored,
    type: stored.type,
    priority: stored.priority,
    status: stored.status,
    explanation: row.explanation,
    whyItMatters: row.why_it_matters,
    goalRelationship: row.goal_relationship,
    example: row.example,
    effort: row.effort,
    prerequisiteReason: row.prerequisite_reason,
    learningOrder: numberOrNull(row.learning_order),
    captureOrder: numberOrNull(row.capture_order),
    sourceUrl: row.source_url ?? "",
    sourceNote: row.source_note ?? "",
    parentId: row.parent_concept_id,
    positionX: stored.positionX,
    positionY: stored.positionY,
  };
}

const conceptSelect = `select c.id, c.space_id, c.title, c.normalized_title, c.type, c.origin, c.priority, c.explanation,
  c.why_it_matters, c.goal_relationship, c.example, c.effort, c.prerequisite_reason, c.status, c.parent_concept_id,
  c.position_x, c.position_y, c.learning_order, c.capture_order, c.dismissed_at, c.dismissed_by, s.url as source_url, s.note as source_note
  from concepts c
  left join captured_sources s on s.concept_id = c.id`;

export async function listConcepts(spaceId: string, includeDismissed = false) {
  const rows = await dbQuery<ConceptRow>(
    `${conceptSelect} where c.space_id = $1 ${includeDismissed ? "" : "and c.dismissed_at is null"} order by c.learning_order nulls last, c.created_at`,
    [spaceId],
  );
  return rows;
}

async function listEdges(spaceId: string): Promise<StoredEdge[]> {
  const rows = await dbQuery<{
    id: string;
    source_id: string;
    target_id: string;
    relationship: string;
    origin: string;
    dismissed_by: string | null;
  }>(
    `select id, source_id, target_id, relationship, origin, dismissed_by
     from concept_relationships where space_id = $1`,
    [spaceId],
  );
  return rows.map((row) => ({
    id: row.id,
    sourceId: row.source_id,
    targetId: row.target_id,
    relationship: row.relationship,
    origin: row.origin === "user" ? "user" : "ai",
    dismissedBy: row.dismissed_by === "user" ? "user" : null,
  }));
}

function nextConceptIds(concepts: GraphConcept[], edges: GraphEdge[]) {
  const understood = new Set(concepts.filter((concept) => concept.status === "understood").map((concept) => concept.id));
  return concepts
    .filter((concept) => concept.status !== "understood" && concept.priority !== "out_of_scope" && concept.type !== "project")
    .filter((concept) =>
      edges
        .filter((edge) => edge.relationship === "required for" && edge.targetId === concept.id)
        .every((edge) => understood.has(edge.sourceId)),
    )
    .sort((a, b) => (a.learningOrder ?? 9999) - (b.learningOrder ?? 9999) || a.title.localeCompare(b.title))
    .slice(0, 3)
    .map((concept) => concept.id);
}

async function syncParents(spaceId: string) {
  const concepts = await dbQuery<{ id: string; title: string; parent_concept_id: string | null }>(
    `select id, title, parent_concept_id
     from concepts where space_id = $1 and dismissed_at is null and origin = 'user'`,
    [spaceId],
  );
  if (concepts.length === 0) return;
  const [locks, edges] = await Promise.all([
    dbQuery<{ source_id: string; target_id: string }>(
      `select source_id, target_id from concept_relationships
       where space_id = $1 and relationship = 'part of' and origin = 'user' and dismissed_at is null`,
      [spaceId],
    ),
    dbQuery<{ source_id: string; target_id: string }>(
      `select source_id, target_id from concept_relationships
       where space_id = $1 and relationship = 'part of' and dismissed_at is null`,
      [spaceId],
    ),
  ]);
  const desired = resolveParents(
    concepts.map((concept) => ({ id: concept.id, title: concept.title, parentId: concept.parent_concept_id })),
    new Map(locks.map((lock) => [lock.source_id, lock.target_id])),
  );
  const edgeBySource = new Map(edges.map((edge) => [edge.source_id, edge.target_id]));
  const locked = new Set(locks.map((lock) => lock.source_id));
  const pending = concepts.filter((concept) => {
    const parentId = desired.get(concept.id) ?? null;
    const currentEdge = edgeBySource.get(concept.id) ?? null;
    return concept.parent_concept_id !== parentId || currentEdge !== parentId;
  });
  if (pending.length === 0) return;
  await withTransaction(async (sql) => {
    for (const concept of pending) {
      const parentId = desired.get(concept.id) ?? null;
      await sql.query(
        `update concepts set parent_concept_id = $2, parent_inferred = $3, updated_at = now() where id = $1`,
        [concept.id, parentId, !locked.has(concept.id)],
      );
      await sql.query(
        `delete from concept_relationships
         where source_id = $1 and relationship = 'part of' and origin <> 'user' and dismissed_at is null`,
        [concept.id],
      );
      if (!parentId || locked.has(concept.id)) continue;
      await sql.query(
        `insert into concept_relationships (id, space_id, source_id, target_id, relationship, origin)
         values ($1, $2, $3, $4, 'part of', 'ai')
         on conflict (source_id, target_id, relationship) do update
         set origin = 'ai', dismissed_at = null, dismissed_by = null`,
        [randomUUID(), spaceId, concept.id, parentId],
      );
    }
  });
}

export async function getGraphView(userId: string, spaceId: string): Promise<GraphView | null> {
  const [space, conceptRows, edgeRows, resourceRows, generation] = await Promise.all([
    getSpaceForUser(userId, spaceId),
    listConcepts(spaceId),
    dbQuery<{
      id: string;
      source_id: string;
      target_id: string;
      relationship: string;
      origin: string;
    }>(
      `select r.id, r.source_id, r.target_id, r.relationship, r.origin
       from concept_relationships r
       join concepts source on source.id = r.source_id and source.dismissed_at is null
       join concepts target on target.id = r.target_id and target.dismissed_at is null
       where r.space_id = $1 and r.dismissed_at is null`,
      [spaceId],
    ),
    dbQuery<{
      id: string;
      concept_id: string;
      title: string;
      url: string;
      kind: string;
      provider: string;
      why_recommended: string;
      duration: string;
      is_free: boolean | string;
      rank: number | string;
    }>(
      `select r.id, r.concept_id, r.title, r.url, r.kind, r.provider, r.why_recommended, r.duration, r.is_free, r.rank
       from resources r
       join concepts c on c.id = r.concept_id and c.dismissed_at is null
       where c.space_id = $1
       order by r.rank asc, r.title asc`,
      [spaceId],
    ),
    dbOne<{ model: string; summary: string; created_at: Date | string }>(
      `select model, summary, created_at from graph_generations where space_id = $1 order by created_at desc limit 1`,
      [spaceId],
    ),
  ]);
  if (!space) return null;
  const concepts = conceptRows.map(mapViewConcept);
  const edges: GraphEdge[] = edgeRows.map((row) => ({
    id: row.id,
    sourceId: row.source_id,
    targetId: row.target_id,
    relationship: row.relationship,
    origin: row.origin === "user" ? "user" : "ai",
  }));
  const resources: GraphResource[] = resourceRows
    .filter((row) => acceptedResourceUrl(row.provider, row.url))
    .map((row) => ({
      id: row.id,
      conceptId: row.concept_id,
      title: row.title,
      url: row.url,
      kind: row.kind,
      provider: row.provider,
      whyRecommended: row.why_recommended,
      duration: row.duration,
      isFree: booleanValue(row.is_free),
    }));
  return {
    revision: [
      generation ? text(generation.created_at) : "none",
      concepts.map((concept) => `${concept.id}:${concept.status}:${concept.title}:${concept.priority}:${concept.positionX}`).join("|"),
      edges.map((edge) => edge.id).join("|"),
    ].join("~"),
    space,
    concepts,
    edges,
    resources,
    generation: generation
      ? { model: generation.model, summary: generation.summary, createdAt: text(generation.created_at) }
      : null,
    progress: progressCounts(concepts),
    nextConceptIds: nextConceptIds(
      concepts.filter((concept) => normalizeTitle(concept.title) !== normalizeTitle(space.name)),
      edges,
    ),
  };
}

export async function loadMergeState(spaceId: string) {
  const concepts = (await listConcepts(spaceId, true)).map(mapStored);
  const edges = await listEdges(spaceId);
  return { concepts, edges };
}

async function touchSpace(sql: Sql, spaceId: string) {
  await sql.query("update learning_spaces set updated_at = now() where id = $1", [spaceId]);
}

export async function createConcept(
  userId: string,
  spaceId: string,
  input: {
    title: string;
    status: KnowledgeStatus;
    url: string;
    note: string;
    parentId: string | null;
  },
) {
  const space = await getSpaceForUser(userId, spaceId);
  if (!space) return { error: "Learning space not found." };
  const normalized = normalizeTitle(input.title);
  if (!normalized) return { error: "Enter a concept name." };
  const chosenByUser = Boolean(input.parentId);
  let parentId = input.parentId;
  let parentInferred = chosenByUser;
  if (!parentId) {
    const peers = await dbQuery<{ id: string; title: string }>(
      `select id, title from concepts where space_id = $1 and dismissed_at is null and origin = 'user'`,
      [spaceId],
    );
    const decided = await decideParentId({
      spaceName: space.name,
      title: input.title,
      concepts: peers,
      ai: await getAiConfig(userId),
    });
    parentId = decided.parentId;
    parentInferred = decided.inferred;
  }

  try {
    await withTransaction(async (sql) => {
      const existing = await sql.query<ConceptRow>(
        `${conceptSelect} where c.space_id = $1 and c.normalized_title = $2 order by c.dismissed_at nulls first`,
        [spaceId, normalized],
      );
      const current = existing[0];
      const conceptId = current?.id ?? randomUUID();

      if (current && !current.dismissed_at && current.origin === "user") {
        throw new Error("You already captured that concept.");
      }

      if (parentId) {
        const parent = await sql.query<{ id: string }>(
          "select id from concepts where id = $1 and space_id = $2 and dismissed_at is null",
          [parentId, spaceId],
        );
        if (!parent[0] || parent[0].id === conceptId) {
          if (chosenByUser) throw new Error("Choose a parent from this learning space.");
          parentId = null;
        }
      }

      const nextOrder = await sql.query<{ next_order: number | string }>(
        `select coalesce(max(capture_order) + 1, 0) as next_order from concepts where space_id = $1`,
        [spaceId],
      );
      const captureOrder = Number(nextOrder[0]?.next_order ?? 0);

      if (current) {
        await sql.query(
          `update concepts
           set title = $2, normalized_title = $3, type = 'captured', origin = 'user', status = $4,
               parent_concept_id = $5, capture_order = coalesce(capture_order, $6), parent_inferred = $7,
               dismissed_at = null, dismissed_by = null, updated_at = now()
           where id = $1`,
          [conceptId, input.title, normalized, input.status, parentId, captureOrder, parentInferred],
        );
      } else {
        await sql.query(
          `insert into concepts (
             id, space_id, title, normalized_title, type, origin, status, parent_concept_id, capture_order, parent_inferred
           ) values ($1, $2, $3, $4, 'captured', 'user', $5, $6, $7, $8)`,
          [conceptId, spaceId, input.title, normalized, input.status, parentId, captureOrder, parentInferred],
        );
      }

      await sql.query(
        `insert into captured_sources (id, concept_id, url, note)
         values ($1, $2, $3, $4)
         on conflict (concept_id) do update set url = excluded.url, note = excluded.note`,
        [randomUUID(), conceptId, input.url, input.note],
      );
      await sql.query(
        "insert into learning_progress (id, user_id, concept_id, status) values ($1, $2, $3, $4)",
        [randomUUID(), userId, conceptId, input.status],
      );
      await sql.query(
        "delete from concept_relationships where source_id = $1 and relationship = 'part of' and dismissed_at is null",
        [conceptId],
      );
      if (parentId) {
        await sql.query(
          `insert into concept_relationships (id, space_id, source_id, target_id, relationship, origin)
           values ($1, $2, $3, $4, 'part of', $5)
           on conflict (source_id, target_id, relationship) do update
           set origin = excluded.origin, dismissed_at = null, dismissed_by = null`,
          [randomUUID(), spaceId, conceptId, parentId, chosenByUser ? "user" : "ai"],
        );
      }
      await seedRelatedTopics(sql, space, conceptId, input.title);
      await linkConceptToSpace(sql, spaceId, conceptId, space.depth);
      await touchSpace(sql, spaceId);
    });
  } catch (error) {
    if (error instanceof Error && error.message === "You already captured that concept.") return { error: error.message };
    if (error instanceof Error && error.message.startsWith("Choose a parent")) return { error: error.message };
    if (isUniqueViolation(error)) return { error: "You already captured that concept." };
    throw error;
  }
  await syncParents(spaceId);
  return null;
}

async function rememberSuggestion(
  sql: Sql,
  spaceId: string,
  anchorId: string | null,
  topic: {
    title: string;
    type: string;
    priority: string;
    explanation: string;
    whyItMatters: string;
    relationship: string;
    focusIsSource: boolean;
  },
  byTitle: Map<string, string>,
) {
  const normalized = normalizeTitle(topic.title);
  if (!normalized) return false;
  let relatedId = byTitle.get(normalized);
  let created = false;
  if (!relatedId) {
    relatedId = randomUUID();
    const reason = (topic.whyItMatters || topic.explanation || `${topic.title} supports this topic.`).slice(0, 400);
    await sql.query(
      `insert into concepts (
         id, space_id, title, normalized_title, type, origin, priority,
         explanation, why_it_matters, goal_relationship, prerequisite_reason
       ) values ($1, $2, $3, $4, $5, 'ai', $6, $7, $8, $9, $10)`,
      [
        relatedId,
        spaceId,
        topic.title.slice(0, 200),
        normalized,
        topic.type,
        topic.priority,
        topic.explanation.slice(0, 800),
        topic.whyItMatters.slice(0, 800),
        `${topic.title} is here because it helps you learn this topic.`.slice(0, 400),
        reason,
      ],
    );
    byTitle.set(normalized, relatedId);
    created = true;
  }
  if (!anchorId || anchorId === relatedId) return created;
  const sourceId = topic.focusIsSource ? anchorId : relatedId;
  const targetId = topic.focusIsSource ? relatedId : anchorId;
  if (sourceId === targetId) return created;
  await sql.query(
    `insert into concept_relationships (id, space_id, source_id, target_id, relationship, origin)
     values ($1, $2, $3, $4, $5, 'ai')
     on conflict (source_id, target_id, relationship) do nothing`,
    [randomUUID(), spaceId, sourceId, targetId, topic.relationship],
  );
  return created;
}

async function seedRelatedTopics(
  sql: Sql,
  space: { id: string; name: string; level: Level; depth: Depth },
  conceptId: string,
  title: string,
) {
  const existing = await sql.query<{ id: string; title: string; normalized_title: string }>(
    `select id, title, normalized_title from concepts where space_id = $1 and dismissed_at is null`,
    [space.id],
  );
  const byTitle = new Map(existing.map((concept) => [concept.normalized_title, concept.id]));
  const topics = suggestionsFor({
    title,
    level: space.level,
    depth: space.depth,
    takenTitles: [...existing.map((concept) => concept.title), space.name],
  });
  let added = 0;
  for (const topic of topics) {
    const created = await rememberSuggestion(sql, space.id, conceptId, topic, byTitle);
    if (created) added += 1;
  }
  return added;
}

export type SuggestionDraft = {
  title: string;
  type: string;
  priority: string;
  explanation: string;
  whyItMatters: string;
  relationship: string;
  anchorId: string | null;
  anchorTitle: string | null;
  focusIsSource: boolean;
};

function cleanSuggestion(draft: SuggestionDraft) {
  const title = draft.title.replace(/\s+/g, " ").trim().slice(0, 200);
  if (!normalizeTitle(title)) return null;
  const type = draft.type === "prerequisite" ? "prerequisite" : "suggested";
  const priority = isOneOf(priorities, draft.priority) ? draft.priority : "should";
  const relationship = isOneOf(relationships, draft.relationship)
    ? draft.relationship
    : type === "prerequisite"
      ? "required for"
      : "part of";
  const anchorTitle = draft.anchorTitle?.replace(/\s+/g, " ").trim().slice(0, 200) || null;
  return {
    title,
    type,
    priority,
    explanation: (draft.explanation ?? "").replace(/\s+/g, " ").trim().slice(0, 800),
    whyItMatters: (draft.whyItMatters ?? "").replace(/\s+/g, " ").trim().slice(0, 800),
    relationship,
    anchorId: typeof draft.anchorId === "string" && draft.anchorId ? draft.anchorId : null,
    anchorTitle,
    focusIsSource: draft.focusIsSource === true,
  };
}

export async function saveFocusSuggestions(
  userId: string,
  spaceId: string,
  focusId: string,
  pages: number,
  focusTitleHint = "",
  extras: SuggestionDraft[] = [],
) {
  const space = await getSpaceForUser(userId, spaceId);
  if (!space) return 0;
  const pageCount = Number.isFinite(pages) ? Math.max(1, Math.min(5, Math.floor(pages))) : 1;
  const hint = focusTitleHint.replace(/\s+/g, " ").trim().slice(0, 200);
  const visible = (Array.isArray(extras) ? extras : []).flatMap((draft) => {
    const clean = cleanSuggestion(draft);
    return clean ? [clean] : [];
  }).slice(0, 40);
  const existing = await listConcepts(spaceId);
  const onSpace = focusId === spaceNodeId(spaceId);
  const focus = onSpace ? null : existing.find((concept) => concept.id === focusId);
  const focusTitle = focus?.title ?? (onSpace || !hint ? space.name : hint);
  const taken = existing.filter((concept) => concept.origin === "user").map((concept) => concept.title);
  const topics = suggestionsFor({
    title: focusTitle,
    level: space.level,
    depth: space.depth,
    takenTitles: onSpace ? taken : [...taken, space.name],
    pages: pageCount,
  });
  if (topics.length === 0 && visible.length === 0) return 0;
  return withTransaction(async (sql) => {
    const owned = await sql.query<{ id: string }>("select id from learning_spaces where id = $1 and user_id = $2", [
      spaceId,
      userId,
    ]);
    if (!owned[0]) return 0;
    const rows = await sql.query<{ id: string; normalized_title: string }>(
      `select id, normalized_title from concepts where space_id = $1 and dismissed_at is null`,
      [spaceId],
    );
    const byTitle = new Map(rows.map((concept) => [concept.normalized_title, concept.id]));
    let saved = 0;
    for (const topic of topics) {
      const created = await rememberSuggestion(sql, spaceId, focus?.id ?? null, topic, byTitle);
      if (created) saved += 1;
    }
    for (const extra of visible) {
      const created = await rememberSuggestion(sql, spaceId, null, extra, byTitle);
      if (created) saved += 1;
    }
    const focusKey = normalizeTitle(focusTitle);
    const focusRowId = focus?.id ?? (onSpace ? null : byTitle.get(focusKey) ?? null);
    if (focusRowId) {
      for (const topic of topics) {
        await rememberSuggestion(sql, spaceId, focusRowId, topic, byTitle);
      }
    }
    const knownIds = new Set(byTitle.values());
    for (const extra of visible) {
      const anchorId =
        (extra.anchorId && knownIds.has(extra.anchorId) ? extra.anchorId : null) ??
        (extra.anchorTitle ? byTitle.get(normalizeTitle(extra.anchorTitle)) ?? null : null);
      if (!anchorId) continue;
      await rememberSuggestion(sql, spaceId, anchorId, extra, byTitle);
    }
    if (saved > 0) await touchSpace(sql, spaceId);
    return saved;
  });
}

async function linkConceptToSpace(sql: Sql, spaceId: string, conceptId: string, depth: Depth) {
  const concepts = await sql.query<{ id: string; title: string; learning_order: number | string | null }>(
    `select id, title, learning_order from concepts
     where space_id = $1 and dismissed_at is null
     order by learning_order nulls last, created_at`,
    [spaceId],
  );
  const edges = await sql.query<{
    source_id: string;
    target_id: string;
    relationship: string;
    dismissed_at: string | null;
  }>(
    `select source_id, target_id, relationship, dismissed_at
     from concept_relationships where space_id = $1`,
    [spaceId],
  );
  const decision = relateConcept({
    conceptId,
    depth,
    concepts: concepts.map((concept) => ({
      id: concept.id,
      title: concept.title,
      learningOrder: numberOrNull(concept.learning_order),
    })),
    edges: edges.map((edge) => ({
      sourceId: edge.source_id,
      targetId: edge.target_id,
      relationship: edge.relationship,
      dismissed: edge.dismissed_at != null,
    })),
  });
  for (const edge of decision.edges) {
    await sql.query(
      `insert into concept_relationships (id, space_id, source_id, target_id, relationship, origin)
       values ($1, $2, $3, $4, $5, 'ai')
       on conflict (source_id, target_id, relationship) do nothing`,
      [randomUUID(), spaceId, edge.sourceId, edge.targetId, edge.relationship],
    );
  }
  for (const item of decision.learningOrder) {
    await sql.query("update concepts set learning_order = $2 where id = $1 and space_id = $3", [
      item.id,
      item.learningOrder,
      spaceId,
    ]);
  }
}

export async function updateConcept(
  userId: string,
  conceptId: string,
  input: {
    title: string;
    status: KnowledgeStatus;
    priority: Priority;
    url: string;
    note: string;
    parentId: string | null;
  },
) {
  const owned = await dbOne<{ id: string; space_id: string; origin: string }>(
    `select c.id, c.space_id, c.origin
     from concepts c join learning_spaces s on s.id = c.space_id
     where c.id = $1 and s.user_id = $2 and c.dismissed_at is null`,
    [conceptId, userId],
  );
  if (!owned) return { error: "That concept was not found." };
  const normalized = normalizeTitle(input.title);
  if (!normalized) return { error: "Enter a concept name." };

  try {
    await withTransaction(async (sql) => {
      if (input.parentId) {
        const parent = await sql.query<{ id: string }>(
          "select id from concepts where id = $1 and space_id = $2 and dismissed_at is null",
          [input.parentId, owned.space_id],
        );
        if (!parent[0] || parent[0].id === conceptId) throw new Error("Choose a parent from this learning space.");
      }
      await sql.query(
        `update concepts
         set title = $2, normalized_title = $3, status = $4, priority = $5, parent_concept_id = $6,
             parent_inferred = true, updated_at = now()
         where id = $1`,
        [conceptId, input.title, normalized, input.status, input.priority, input.parentId],
      );
      await sql.query(
        `insert into captured_sources (id, concept_id, url, note)
         values ($1, $2, $3, $4)
         on conflict (concept_id) do update set url = excluded.url, note = excluded.note`,
        [randomUUID(), conceptId, input.url, input.note],
      );
      await sql.query(
        "insert into learning_progress (id, user_id, concept_id, status) values ($1, $2, $3, $4)",
        [randomUUID(), userId, conceptId, input.status],
      );
      await sql.query(
        "delete from concept_relationships where source_id = $1 and relationship = 'part of' and dismissed_at is null",
        [conceptId],
      );
      if (input.parentId) {
        await sql.query(
          `insert into concept_relationships (id, space_id, source_id, target_id, relationship, origin)
           values ($1, $2, $3, $4, 'part of', 'user')
           on conflict (source_id, target_id, relationship) do update
           set origin = 'user', dismissed_at = null, dismissed_by = null`,
          [randomUUID(), owned.space_id, conceptId, input.parentId],
        );
      }
      await touchSpace(sql, owned.space_id);
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Choose a parent")) return { error: error.message };
    if (isUniqueViolation(error)) return { error: "Another concept in this space already uses that name." };
    throw error;
  }
  await syncParents(owned.space_id);
  return { spaceId: owned.space_id };
}

export async function setConceptStatus(userId: string, conceptId: string, status: KnowledgeStatus) {
  const owned = await dbOne<{ space_id: string }>(
    `select c.space_id from concepts c
     join learning_spaces s on s.id = c.space_id
     where c.id = $1 and s.user_id = $2 and c.dismissed_at is null`,
    [conceptId, userId],
  );
  if (!owned) return { error: "That concept was not found." };
  await withTransaction(async (sql) => {
    await sql.query("update concepts set status = $2, updated_at = now() where id = $1", [conceptId, status]);
    await sql.query(
      "insert into learning_progress (id, user_id, concept_id, status) values ($1, $2, $3, $4)",
      [randomUUID(), userId, conceptId, status],
    );
    await touchSpace(sql, owned.space_id);
  });
  return { spaceId: owned.space_id };
}

export async function removeConcept(userId: string, conceptId: string) {
  const owned = await dbOne<{ space_id: string; origin: string }>(
    `select c.space_id, c.origin from concepts c
     join learning_spaces s on s.id = c.space_id
     where c.id = $1 and s.user_id = $2 and c.dismissed_at is null`,
    [conceptId, userId],
  );
  if (!owned) return { error: "That concept was not found." };
  await withTransaction(async (sql) => {
    if (owned.origin === "user") {
      await sql.query("delete from concepts where id = $1", [conceptId]);
    } else {
      await sql.query(
        "update concepts set dismissed_at = now(), dismissed_by = 'user', updated_at = now() where id = $1",
        [conceptId],
      );
    }
    await touchSpace(sql, owned.space_id);
  });
  await syncParents(owned.space_id);
  return { spaceId: owned.space_id };
}

export async function saveNodePosition(userId: string, conceptId: string, x: number, y: number) {
  const rows = await dbQuery<{ id: string }>(
    `update concepts c set position_x = $3, position_y = $4
     from learning_spaces s
     where c.id = $1 and c.space_id = s.id and s.user_id = $2 and c.dismissed_at is null
     returning c.id`,
    [conceptId, userId, x, y],
  );
  return rows.length > 0;
}

export async function createRelationship(
  userId: string,
  spaceId: string,
  sourceId: string,
  targetId: string,
  relationship: string,
) {
  const space = await getSpaceForUser(userId, spaceId);
  if (!space) return { error: "Learning space not found." };
  if (sourceId === targetId) return { error: "Choose two different concepts." };
  const ends = await dbQuery<{ id: string }>(
    "select id from concepts where space_id = $1 and dismissed_at is null and id in ($2, $3)",
    [spaceId, sourceId, targetId],
  );
  if (ends.length !== 2) return { error: "Choose concepts from this learning space." };
  await dbQuery(
    `insert into concept_relationships (id, space_id, source_id, target_id, relationship, origin)
     values ($1, $2, $3, $4, $5, 'user')
     on conflict (source_id, target_id, relationship) do update
     set origin = 'user', dismissed_at = null, dismissed_by = null`,
    [randomUUID(), spaceId, sourceId, targetId, relationship],
  );
  return null;
}

export async function removeRelationship(userId: string, edgeId: string) {
  const edge = await dbOne<{ id: string; space_id: string; origin: string }>(
    `select r.id, r.space_id, r.origin
     from concept_relationships r
     join learning_spaces s on s.id = r.space_id
     where r.id = $1 and s.user_id = $2 and r.dismissed_at is null`,
    [edgeId, userId],
  );
  if (!edge) return { error: "That relationship was not found." };
  if (edge.origin === "user") {
    await dbQuery("delete from concept_relationships where id = $1", [edgeId]);
  } else {
    await dbQuery(
      "update concept_relationships set dismissed_at = now(), dismissed_by = 'user' where id = $1",
      [edgeId],
    );
  }
  return { spaceId: edge.space_id };
}

async function writeConcept(sql: Sql, spaceId: string, write: ConceptWrite) {
  if (write.mode === "order") {
    await sql.query(
      `update concepts set learning_order = $2, position_x = coalesce(position_x, $3), position_y = coalesce(position_y, $4), updated_at = now()
       where id = $1 and space_id = $5`,
      [write.id, write.learningOrder, write.positionX, write.positionY, spaceId],
    );
    return;
  }
  if (write.mode === "user") {
    await sql.query(
      `update concepts set priority = $2, explanation = $3, why_it_matters = $4, goal_relationship = $5, example = $6,
              effort = $7, learning_order = $8, position_x = coalesce(position_x, $9), position_y = coalesce(position_y, $10), updated_at = now()
       where id = $1 and space_id = $11 and origin = 'user'`,
      [
        write.id,
        write.priority,
        write.explanation,
        write.whyItMatters,
        write.goalRelationship,
        write.example,
        write.effort,
        write.learningOrder,
        write.positionX,
        write.positionY,
        spaceId,
      ],
    );
    return;
  }
  const existing = await sql.query<{ id: string }>("select id from concepts where id = $1", [write.id]);
  if (existing[0]) {
    await sql.query(
      `update concepts set title = $2, normalized_title = $3, type = $4, priority = $5, explanation = $6, why_it_matters = $7,
              goal_relationship = $8, example = $9, effort = $10, prerequisite_reason = $11, learning_order = $12,
              position_x = coalesce(position_x, $13), position_y = coalesce(position_y, $14), updated_at = now()
       where id = $1 and space_id = $15 and origin = 'ai'`,
      [
        write.id,
        write.title,
        write.normalizedTitle,
        write.type,
        write.priority,
        write.explanation,
        write.whyItMatters,
        write.goalRelationship,
        write.example,
        write.effort,
        write.prerequisiteReason,
        write.learningOrder,
        write.positionX,
        write.positionY,
        spaceId,
      ],
    );
    return;
  }
  await sql.query(
    `insert into concepts (
       id, space_id, title, normalized_title, type, origin, priority, explanation, why_it_matters, goal_relationship,
       example, effort, prerequisite_reason, learning_order, position_x, position_y
     ) values ($1,$2,$3,$4,$5,'ai',$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
    [
      write.id,
      spaceId,
      write.title,
      write.normalizedTitle,
      write.type as ConceptType,
      write.priority,
      write.explanation,
      write.whyItMatters,
      write.goalRelationship,
      write.example,
      write.effort,
      write.prerequisiteReason,
      write.learningOrder,
      write.positionX,
      write.positionY,
    ],
  );
}

export async function applyGraphMerge(userId: string, spaceId: string, result: MergeResult, generation: {
  model: string;
  summary: string;
  plan: unknown;
}) {
  const generationId = randomUUID();
  await withTransaction(async (sql) => {
    const space = await sql.query<{ id: string }>("select id from learning_spaces where id = $1 and user_id = $2", [
      spaceId,
      userId,
    ]);
    if (!space[0]) throw new Error("Learning space not found.");
    if (result.deleteIds.length > 0) {
      await sql.query(
        `delete from concepts where space_id = $1 and origin = 'ai' and id in (${placeholders(2, result.deleteIds.length)})`,
        [spaceId, ...result.deleteIds],
      );
    }
    if (result.deleteEdgeIds.length > 0) {
      await sql.query(
        `delete from concept_relationships where space_id = $1 and origin = 'ai' and dismissed_at is null
           and id in (${placeholders(2, result.deleteEdgeIds.length)})`,
        [spaceId, ...result.deleteEdgeIds],
      );
    }
    for (const update of result.updates) await writeConcept(sql, spaceId, update);
    for (const insert of result.inserts) await writeConcept(sql, spaceId, insert);
    for (const edge of result.edgeInserts) {
      await sql.query(
        `insert into concept_relationships (id, space_id, source_id, target_id, relationship, origin)
         values ($1, $2, $3, $4, $5, 'ai')
         on conflict (source_id, target_id, relationship) do nothing`,
        [edge.id, spaceId, edge.sourceId, edge.targetId, edge.relationship],
      );
    }
    await sql.query(
      `insert into graph_generations (id, space_id, model, summary, validated_json)
       values ($1, $2, $3, $4, $5::jsonb)`,
      [generationId, spaceId, generation.model, generation.summary, JSON.stringify(generation.plan)],
    );
    await touchSpace(sql, spaceId);
  });
  return generationId;
}

export async function replaceConceptResources(
  conceptId: string,
  resources: Array<{ title: string; url: string; kind: string; provider: string; whyRecommended: string; duration: string; isFree: boolean }>,
) {
  await withTransaction(async (sql) => {
    await sql.query("delete from resources where concept_id = $1", [conceptId]);
    for (const [index, resource] of resources.entries()) {
      if (!acceptedResourceUrl(resource.provider, resource.url)) continue;
      await sql.query(
        `insert into resources (id, concept_id, title, url, kind, provider, why_recommended, duration, is_free, rank)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          randomUUID(),
          conceptId,
          resource.title.slice(0, 180),
          resource.url,
          resource.kind,
          resource.provider,
          resource.whyRecommended.slice(0, 400),
          resource.duration.slice(0, 40),
          resource.isFree,
          index,
        ],
      );
    }
  });
}

export async function appendGenerationNote(generationId: string, summary: string) {
  await dbQuery("update graph_generations set summary = $2 where id = $1", [generationId, summary]);
}

export async function saveConceptBrief(userId: string, spaceId: string, title: string, definition: string, more: string) {
  const space = await getSpaceForUser(userId, spaceId);
  if (!space) return;
  const normalized = normalizeTitle(title);
  if (!normalized) return;
  const updated = await dbQuery<{ id: string }>(
    `update concepts
     set explanation = $3, why_it_matters = $4, updated_at = now()
     where space_id = $1 and normalized_title = $2 and dismissed_at is null
     returning id`,
    [spaceId, normalized, definition, more],
  );
  if (updated.length > 0) return;
  try {
    await dbQuery(
      `insert into concepts (
         id, space_id, title, normalized_title, type, origin, priority, explanation, why_it_matters
       ) values ($1, $2, $3, $4, 'suggested', 'ai', 'should', $5, $6)`,
      [randomUUID(), spaceId, title.slice(0, 200), normalized, definition, more],
    );
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
  }
}
