import assert from "node:assert/strict";
import test from "node:test";
import { relationships } from "../domain";
import { mergePlan, type StoredConcept, type StoredEdge } from "./merge";
import { expansionBudget, planWithCurriculum, reconcilePlan } from "./plan";
import { relatedTopicBudget, relatedTopics } from "./related";
import { relateConcept } from "./relate";
import { curriculumParentId, resolveParents, suggestParentId } from "./parents";
import { briefFor } from "./brief";
import { parseDefinition } from "./llm";
import { arrangeReadable, bubbleDiameter, buildMesh, suggestionsFor, type MeshConcept } from "./mesh";
import { normalizeTitle } from "./normalize";
import { spaceNodeId } from "./timeline";
import { graphPlanSchema, type GraphPlan } from "./schema";
import { rankResources, type ResourceCandidate } from "../resources/rank";

const demo = {
  spaceName: "Backend Development",
  goal: "interview" as const,
  level: "beginner" as const,
  depth: "practitioner" as const,
  timeAvailable: "15 hours",
  captured: [
    { title: "Types of APIs", note: "Saw this in a blog" },
    { title: "Authentication", note: "" },
    { title: "System Design", note: "" },
    { title: "Caching", note: "" },
  ],
};

function titlesInOrder(plan: GraphPlan) {
  return plan.learningOrder.map((id) => plan.nodes.find((node) => node.id === id)?.title);
}

test("demo graph keeps captured concepts and explains prerequisites", () => {
  const plan = planWithCurriculum(demo);
  assert.equal(graphPlanSchema.safeParse(plan).success, true);
  for (const captured of demo.captured) {
    const node = plan.nodes.find((item) => item.title === captured.title);
    assert.ok(node, `missing ${captured.title}`);
    assert.equal(node.type, "captured");
  }
  assert.ok(plan.nodes.some((node) => node.title === "API" && node.type === "prerequisite"));
  assert.ok(plan.nodes.some((node) => node.title === "HTTP"));
  assert.ok(plan.nodes.some((node) => node.title === "JWT"));
  const aiCount = plan.nodes.filter((node) => node.type !== "captured").length;
  assert.ok(aiCount <= expansionBudget(demo), `budget exceeded: ${aiCount}`);
  for (const node of plan.nodes) {
    if (node.type === "prerequisite") assert.ok(node.prerequisiteReason && node.prerequisiteReason.length > 10);
  }
  for (const edge of plan.edges) assert.ok(relationships.includes(edge.relationship as never));
  assert.equal(new Set(plan.learningOrder).size, plan.nodes.length);

  const order = titlesInOrder(plan);
  const api = order.indexOf("API");
  const types = order.indexOf("Types of APIs");
  const http = order.indexOf("HTTP");
  const rest = order.indexOf("REST API");
  assert.ok(api !== -1 && api < types, order.join(" > "));
  if (rest !== -1) assert.ok(http !== -1 && http < rest, order.join(" > "));

  const apiEdge = plan.edges.find(
    (edge) =>
      edge.relationship === "required for" &&
      plan.nodes.find((node) => node.id === edge.source)?.title === "API" &&
      plan.nodes.find((node) => node.id === edge.target)?.title === "Types of APIs",
  );
  assert.ok(apiEdge);
});

test("a short overview does not expand as far as a practitioner graph", () => {
  const wide = planWithCurriculum(demo);
  const narrow = planWithCurriculum({ ...demo, depth: "overview", timeAvailable: "2 hours" });
  const wideAi = wide.nodes.filter((node) => node.type !== "captured").length;
  const narrowAi = narrow.nodes.filter((node) => node.type !== "captured").length;
  assert.ok(narrowAi <= 4);
  assert.ok(narrowAi < wideAi);
  for (const captured of demo.captured) {
    assert.ok(narrow.nodes.some((node) => node.title === captured.title && node.type === "captured"));
  }
});

test("empty captures still seed a topic graph from the space name", () => {
  const plan = planWithCurriculum({
    spaceName: "System Design",
    goal: "interview",
    level: "beginner",
    depth: "practitioner",
    timeAvailable: "15 hours",
    captured: [],
  });
  assert.equal(graphPlanSchema.safeParse(plan).success, true);
  assert.equal(plan.nodes.some((node) => node.type === "captured"), false);
  const overview = plan.nodes.find((node) => normalizeTitle(node.title) === "system design");
  assert.ok(overview, "keeps a space overview node for the topic brief");
  assert.equal(overview.type, "suggested");
  assert.ok(plan.nodes.length >= 2, `expected suggestions, got ${plan.nodes.map((node) => node.title).join(", ")}`);
  assert.ok(plan.nodes.every((node) => node.explanation.trim().length > 10));
  assert.ok(plan.nodes.some((node) => node.title === "Database" || node.title === "Caching"));
});

test("space bubble carries a topic brief and suggestions without captures", () => {
  const mesh = buildMesh({
    spaceId: "design",
    spaceName: "System Design",
    level: "beginner",
    depth: "practitioner",
    concepts: [],
    edges: [],
    selectedId: null,
    opened: [],
    filters: meshFilters,
  });
  const space = mesh.nodes.find((node) => node.id === spaceNodeId("design"));
  assert.ok(space);
  assert.match(space.summary, /services|data|traffic|system/i);
  assert.ok(mesh.nodes.some((node) => node.faded && node.role === "related"));
});

test("generated AI concepts appear as faded suggestions around an unknown space topic", () => {
  const mesh = buildMesh({
    spaceId: "diarize",
    spaceName: "speech diarization",
    level: "beginner",
    depth: "practitioner",
    concepts: [
      {
        id: "overview",
        title: "speech diarization",
        type: "suggested",
        origin: "ai",
        priority: "should",
        status: "unfamiliar",
        explanation: "Speech diarization answers who spoke when in an audio recording.",
        whyItMatters: "It turns a mixed recording into speaker-labeled segments.",
        prerequisiteReason: "",
        captureOrder: null,
      },
      {
        id: "vad",
        title: "voice activity detection",
        type: "prerequisite",
        origin: "ai",
        priority: "must",
        status: "unfamiliar",
        explanation: "Finds where speech is present versus silence.",
        whyItMatters: "Diarization needs speech regions before assigning speakers.",
        prerequisiteReason: "You need speech regions before clustering speakers.",
        captureOrder: null,
      },
      {
        id: "embed",
        title: "speaker embeddings",
        type: "suggested",
        origin: "ai",
        priority: "should",
        status: "unfamiliar",
        explanation: "Vectors that represent a speaker's voice characteristics.",
        whyItMatters: "Similar embeddings group segments from the same speaker.",
        prerequisiteReason: "",
        captureOrder: null,
      },
    ],
    edges: [],
    selectedId: null,
    opened: [],
    filters: meshFilters,
  });
  const space = mesh.nodes.find((node) => node.id === spaceNodeId("diarize"));
  assert.ok(space);
  assert.match(space.summary, /who spoke when/i);
  assert.equal(mesh.nodes.some((node) => node.role === "related" && normalizeTitle(node.title) === "speech diarization"), false);
  const faded = mesh.nodes.filter((node) => node.faded && node.role === "related");
  assert.equal(faded.length, 2);
  assert.ok(faded.every((node) => node.anchorId === spaceNodeId("diarize")));
  assert.ok(faded.some((node) => node.title === "voice activity detection"));
  assert.ok(faded.some((node) => node.title === "speaker embeddings"));
});

test("reconcile keeps a space overview brief when there are no captures", () => {
  const plan = reconcilePlan(
    {
      nodes: [
        {
          id: "vad",
          title: "voice activity detection",
          type: "prerequisite",
          priority: "must",
          explanation: "Find speech vs silence.",
          whyItMatters: "Needed before clustering.",
          goalRelationship: "Must know.",
          example: "Mark speech regions.",
          effort: "1 hour",
          prerequisiteReason: "Diarization needs speech regions.",
        },
      ],
      edges: [],
      learningOrder: ["vad"],
    },
    {
      spaceName: "speech diarization",
      goal: "curiosity",
      level: "beginner",
      depth: "overview",
      timeAvailable: "6 hours",
      captured: [],
    },
  );
  const overview = plan.nodes.find((node) => normalizeTitle(node.title) === "speech diarization");
  assert.ok(overview);
  assert.equal(overview.type, "suggested");
  assert.ok(overview.explanation.trim().length > 10);
  assert.ok(plan.nodes.some((node) => node.title === "voice activity detection"));
});

test("reconcile puts a captured concept back when the model omits it", () => {
  const plan = reconcilePlan(
    {
      nodes: [
        {
          id: "http",
          title: "HTTP",
          type: "prerequisite",
          priority: "must",
          explanation: "Requests and responses.",
          whyItMatters: "APIs use it.",
          goalRelationship: "Must know for the interview.",
          example: "GET /health",
          effort: "1 hour",
          prerequisiteReason: "Web APIs are HTTP conversations.",
        },
      ],
      edges: [],
      learningOrder: ["http"],
    },
    {
      ...demo,
      captured: [{ title: "Caching", note: "" }],
    },
  );
  assert.ok(plan.nodes.some((node) => node.title === "Caching" && node.type === "captured"));
});

test("merge never drops a captured concept or revives a dismissed one", () => {
  let nextId = 0;
  const caching: StoredConcept = {
    id: "caching",
    title: "Caching",
    normalizedTitle: "caching",
    type: "captured",
    origin: "user",
    priority: "must",
    status: "partial",
    dismissedBy: null,
    positionX: 10,
    positionY: 20,
  };
  const http: StoredConcept = {
    id: "http",
    title: "HTTP",
    normalizedTitle: "http",
    type: "prerequisite",
    origin: "ai",
    priority: "must",
    status: "unfamiliar",
    dismissedBy: null,
    positionX: null,
    positionY: null,
  };
  const cdn: StoredConcept = {
    id: "cdn",
    title: "CDN",
    normalizedTitle: "cdn",
    type: "suggested",
    origin: "ai",
    priority: "nice",
    status: "unfamiliar",
    dismissedBy: null,
    positionX: null,
    positionY: null,
  };
  const cookies: StoredConcept = {
    id: "cookies",
    title: "Cookies",
    normalizedTitle: "cookies",
    type: "prerequisite",
    origin: "ai",
    priority: "must",
    status: "unfamiliar",
    dismissedBy: "user",
    positionX: null,
    positionY: null,
  };
  const userEdge: StoredEdge = {
    id: "user-edge",
    sourceId: "caching",
    targetId: "http",
    relationship: "part of",
    origin: "user",
    dismissedBy: null,
  };
  const aiEdge: StoredEdge = {
    id: "ai-edge",
    sourceId: "http",
    targetId: "caching",
    relationship: "required for",
    origin: "ai",
    dismissedBy: null,
  };
  const plan: GraphPlan = {
    nodes: [
      {
        id: "c",
        title: "Caching",
        type: "captured",
        priority: "must",
        explanation: "Keep a copy of a slow read.",
        whyItMatters: "Repeated reads get faster.",
        goalRelationship: "Must know.",
        example: "Cache a profile for 30 seconds.",
        effort: "1 hour",
      },
      {
        id: "h",
        title: "HTTP",
        type: "prerequisite",
        priority: "must",
        explanation: "Requests and responses.",
        whyItMatters: "Caches follow HTTP freshness.",
        goalRelationship: "Must know.",
        example: "Cache-Control: max-age=30",
        effort: "1 hour",
        prerequisiteReason: "API caches are defined in HTTP.",
      },
      {
        id: "k",
        title: "Cookies",
        type: "prerequisite",
        priority: "must",
        explanation: "Browser storage.",
        whyItMatters: "Not this time.",
        goalRelationship: "Must know.",
        example: "session=1",
        effort: "30 min",
        prerequisiteReason: "Should stay dismissed.",
      },
      {
        id: "s",
        title: "Scalability",
        type: "suggested",
        priority: "should",
        explanation: "Grow capacity.",
        whyItMatters: "Traffic grows.",
        goalRelationship: "Should know.",
        example: "Add a second server.",
        effort: "1 hour",
        prerequisiteReason: "Caching is one way to scale reads.",
      },
    ],
    edges: [
      { source: "h", target: "c", relationship: "required for" },
      { source: "c", target: "s", relationship: "supports" },
      { source: "k", target: "c", relationship: "required for" },
    ],
    learningOrder: ["h", "c", "s", "k"],
  };

  const cdnEdge: StoredEdge = {
    id: "cdn-edge",
    sourceId: "cdn",
    targetId: "caching",
    relationship: "supports",
    origin: "ai",
    dismissedBy: null,
  };
  const merged = mergePlan([caching, http, cdn, cookies], [userEdge, aiEdge, cdnEdge], plan, () => `new-${nextId++}`);
  assert.deepEqual(merged.deleteIds, []);
  assert.equal(merged.deleteEdgeIds.includes("cdn-edge"), false);
  assert.equal(merged.inserts.some((node) => node.title === "Cookies"), false);
  assert.equal(merged.inserts.some((node) => node.title === "Scalability"), true);
  assert.equal(merged.deleteEdgeIds.includes("user-edge"), false);
  assert.equal(merged.deleteEdgeIds.includes("ai-edge"), true);
  assert.equal(merged.edgeInserts.some((edge) => edge.sourceId === "cookies"), false);
  const cachingUpdate = merged.updates.find((node) => node.id === "caching");
  assert.equal(cachingUpdate?.mode, "user");
  assert.equal(cachingUpdate?.positionX, 10);
  assert.equal(merged.inserts[0]?.positionX, 310);
});

test("ranking only returns verified candidate URLs", () => {
  const candidates: ResourceCandidate[] = [
    {
      title: "HTTP",
      url: "https://en.wikipedia.org/wiki/HTTP",
      kind: "article",
      provider: "Wikipedia",
      duration: "",
      durationMinutes: null,
      isFree: true,
    },
    {
      title: "HTTP overview",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
      kind: "documentation",
      provider: "MDN",
      duration: "",
      durationMinutes: null,
      isFree: true,
    },
    {
      title: "Invented",
      url: "https://example.com/http",
      kind: "article",
      provider: "Wikipedia",
      duration: "",
      durationMinutes: null,
      isFree: true,
    },
  ];
  const ranked = rankResources(candidates, "HTTP", "documentation", "beginner");
  assert.ok(ranked.length >= 1);
  assert.ok(ranked.every((item) => candidates.some((candidate) => candidate.url === item.url)));
  assert.equal(ranked.some((item) => item.url.includes("example.com")), false);
  assert.equal(ranked[0]?.provider, "MDN");

  const loose = rankResources(
    [
      {
        title: "Houdini APIs",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Houdini_APIs",
        kind: "documentation",
        provider: "MDN",
        duration: "",
        durationMinutes: null,
        isFree: true,
      },
      {
        title: "API",
        url: "https://en.wikipedia.org/wiki/API",
        kind: "article",
        provider: "Wikipedia",
        duration: "",
        durationMinutes: null,
        isFree: true,
      },
    ],
    "Types of APIs",
    "documentation",
    "beginner",
  );
  assert.equal(loose[0]?.title, "API");
});

test("a new concept links the topics it relates to and sits after its prerequisites", () => {
  const concepts = [
    { id: "cache", title: "Caching", learningOrder: 0 },
    { id: "design", title: "System Design", learningOrder: 1 },
    { id: "scale", title: "Scalability", learningOrder: 2 },
    { id: "balance", title: "Load balancing", learningOrder: null },
  ];
  const linked = relateConcept({
    conceptId: "balance",
    concepts,
    edges: [],
    depth: "practitioner",
  });
  const pairs = linked.edges.map((edge) => `${edge.sourceId} ${edge.relationship} ${edge.targetId}`).sort();
  assert.deepEqual(pairs, [
    "balance part of design",
    "balance supports scale",
    "scale part of design",
  ]);

  const http = relateConcept({
    conceptId: "rest",
    concepts: [
      { id: "http", title: "HTTP", learningOrder: 0 },
      { id: "rest", title: "REST API", learningOrder: null },
    ],
    edges: [],
    depth: "overview",
  });
  assert.ok(http.edges.some((edge) => edge.sourceId === "http" && edge.relationship === "required for" && edge.targetId === "rest"));
  assert.deepEqual(
    http.learningOrder.map((item) => item.id),
    ["http", "rest"],
  );

  const kept = relateConcept({
    conceptId: "rest",
    concepts: [
      { id: "http", title: "HTTP", learningOrder: 0 },
      { id: "rest", title: "REST API", learningOrder: null },
    ],
    edges: [{ sourceId: "http", targetId: "rest", relationship: "required for", dismissed: true }],
    depth: "overview",
  });
  assert.equal(kept.edges.length, 0);

  const unknown = relateConcept({
    conceptId: "clay",
    concepts: [
      { id: "http", title: "HTTP", learningOrder: 0 },
      { id: "clay", title: "Pottery", learningOrder: null },
    ],
    edges: [],
    depth: "practitioner",
  });
  assert.equal(unknown.edges.length, 0);
  assert.deepEqual(
    unknown.learningOrder.map((item) => item.id),
    ["http", "clay"],
  );
});

test("level controls how many related topics a captured concept receives", () => {
  assert.equal(relatedTopicBudget("beginner"), 4);
  assert.equal(relatedTopicBudget("intermediate"), 6);
  assert.equal(relatedTopicBudget("advanced"), 8);
  const few = relatedTopics({
    title: "System Design",
    level: "beginner",
    depth: "practitioner",
    takenTitles: ["System Design"],
  });
  const many = relatedTopics({
    title: "System Design",
    level: "advanced",
    depth: "advanced",
    takenTitles: ["System Design"],
  });
  assert.equal(few.length, 4);
  assert.ok(many.length > few.length);
  assert.ok(many.length <= 8);
  const rest = relatedTopics({
    title: "REST API",
    level: "beginner",
    depth: "practitioner",
    takenTitles: ["REST API"],
  });
  assert.ok(rest.some((topic) => topic.title === "HTTP"));
  assert.equal(
    relatedTopics({ title: "Pottery", level: "advanced", depth: "advanced", takenTitles: ["Pottery"] }).length,
    0,
  );
});

function meshConcept(id: string, title: string, captureOrder: number): MeshConcept {
  return {
    id,
    title,
    type: "captured",
    origin: "user",
    priority: "must",
    status: "unfamiliar",
    explanation: "",
    whyItMatters: "",
    prerequisiteReason: "",
    captureOrder,
  };
}

const meshFilters = { type: "all" as const, priority: "all" as const, hideUnderstood: false };

function centerOf(node: { x: number; y: number; width: number; height: number }) {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

test("suggestion bubbles grow with the title", () => {
  const short = bubbleDiameter("API", "related");
  const long = bubbleDiameter("object oriented programming", "related");
  assert.ok(long > short);
  assert.ok(bubbleDiameter("Authentication", "related") > short);
});

test("a clicked topic suggests what explains it, within the level budget", () => {
  const beginner = suggestionsFor({
    title: "object oriented programming",
    level: "beginner",
    depth: "practitioner",
    takenTitles: [],
  });
  const advanced = suggestionsFor({
    title: "object oriented programming",
    level: "advanced",
    depth: "advanced",
    takenTitles: [],
  });
  assert.deepEqual(
    beginner.map((topic) => topic.title),
    ["abstraction", "encapsulation", "inheritance", "polymorphism"],
  );
  assert.deepEqual(advanced.slice(0, 4).map((topic) => topic.title), [
    "abstraction",
    "encapsulation",
    "inheritance",
    "polymorphism",
  ]);
  assert.equal(advanced.length, 8);
  assert.ok(advanced.length > beginner.length);
  const apiTypes = suggestionsFor({
    title: "Types of APIs",
    level: "beginner",
    depth: "practitioner",
    takenTitles: [],
  }).map((topic) => topic.title);
  assert.deepEqual(apiTypes.slice(0, 2), ["API", "REST API"]);
  assert.equal(apiTypes.length, 4);
  const authentication = suggestionsFor({
    title: "Authentication",
    level: "beginner",
    depth: "practitioner",
    takenTitles: [],
  }).map((topic) => topic.title);
  assert.deepEqual(authentication.slice(0, 2), ["Sessions", "Cookies"]);
  assert.equal(authentication.length, 4);
  const design = suggestionsFor({
    title: "System Design",
    level: "beginner",
    depth: "practitioner",
    takenTitles: [],
  }).map((topic) => topic.title);
  assert.deepEqual(design.slice(0, 2), ["Database", "Caching"]);
  assert.equal(design.length, 4);
  const queue = suggestionsFor({ title: "queue", level: "advanced", depth: "advanced", takenTitles: [] });
  assert.ok(queue.some((topic) => topic.title === "data structures"));
  assert.equal(queue.some((topic) => topic.title === "Scalability"), false);

  const moreDesign = suggestionsFor({
    title: "System Design",
    level: "beginner",
    depth: "practitioner",
    takenTitles: [],
    pages: 2,
  });
  assert.deepEqual(
    moreDesign.slice(0, 2).map((topic) => topic.title),
    ["Database", "Caching"],
  );
  assert.ok(moreDesign.length > 2);
  const moreOop = suggestionsFor({
    title: "object oriented programming",
    level: "beginner",
    depth: "practitioner",
    takenTitles: [],
    pages: 2,
  }).map((topic) => topic.title);
  assert.deepEqual(moreOop.slice(0, 4), ["abstraction", "encapsulation", "inheritance", "polymorphism"]);
  assert.equal(moreOop.length, 8);
});

test("simplify keeps every node and pulls overlaps apart", () => {
  const spaceId = "algos";
  const base = spaceNodeId(spaceId);
  const initial = buildMesh({
    spaceId,
    spaceName: "algorithms",
    level: "beginner",
    depth: "practitioner",
    concepts: [],
    edges: [],
    selectedId: base,
    opened: [],
    filters: meshFilters,
  });
  const sorting = initial.nodes.find((node) => node.title === "sorting");
  assert.ok(sorting);
  const opened = [{ id: sorting.id, anchorId: sorting.anchorId ?? base, title: sorting.title }];
  const mesh = buildMesh({
    spaceId,
    spaceName: "algorithms",
    level: "beginner",
    depth: "practitioner",
    concepts: [],
    edges: [],
    selectedId: sorting.id,
    opened,
    filters: meshFilters,
  });
  const before = mesh.nodes.map((node) => node.id).sort();
  const placed = arrangeReadable(mesh.nodes);
  const laid = mesh.nodes.map((node) => {
    const pin = placed[node.id];
    return pin ? { ...node, x: pin.x, y: pin.y } : node;
  });
  assert.deepEqual(laid.map((node) => node.id).sort(), before);
  assert.equal(Object.keys(placed).length, mesh.nodes.filter((node) => node.role === "related").length);
  for (let i = 0; i < laid.length; i += 1) {
    for (let j = i + 1; j < laid.length; j += 1) {
      const a = centerOf(laid[i]);
      const b = centerOf(laid[j]);
      const gapX = Math.abs(a.x - b.x) - laid[i].width / 2 - laid[j].width / 2;
      const gapY = Math.abs(a.y - b.y) - laid[i].height / 2 - laid[j].height / 2;
      assert.ok(gapX >= 20 || gapY >= 20, `${laid[i].title} overlaps ${laid[j].title}`);
    }
  }
  const parent = laid.find((node) => node.id === sorting.id);
  const child = laid.find((node) => node.title === "merge sort");
  assert.ok(parent && child);
  const gap = Math.hypot(centerOf(parent).x - centerOf(child).x, centerOf(parent).y - centerOf(child).y);
  assert.ok(gap < parent.width + child.width + 280, `merge sort drifted ${Math.round(gap)}px from sorting`);
});

test("a clicked node's suggestions stay beside it", () => {
  const spaceId = "algos";
  const base = spaceNodeId(spaceId);
  const shared = {
    spaceId,
    spaceName: "algorithms",
    level: "beginner" as const,
    depth: "practitioner" as const,
    concepts: [] as MeshConcept[],
    edges: [],
    filters: meshFilters,
  };
  const initial = buildMesh({ ...shared, selectedId: base, opened: [] });
  const sorting = initial.nodes.find((node) => node.title === "sorting");
  assert.ok(sorting);
  const opened = [{ id: sorting.id, anchorId: sorting.anchorId ?? base, title: sorting.title }];
  const onSort = buildMesh({ ...shared, selectedId: sorting.id, opened });
  const parent = onSort.nodes.find((node) => node.id === sorting.id);
  const child = onSort.nodes.find((node) => node.title === "merge sort");
  assert.ok(parent && child);
  const gap = Math.hypot(centerOf(parent).x - centerOf(child).x, centerOf(parent).y - centerOf(child).y);
  const limit = parent.width / 2 + child.width / 2 + 240;
  assert.ok(gap < limit, `merge sort is ${Math.round(gap)}px from sorting`);
});

test("clicking sorting suggests every type of sorting algorithm", () => {
  const titles = suggestionsFor({
    title: "sorting",
    level: "beginner",
    depth: "practitioner",
    takenTitles: [],
  }).map((topic) => topic.title);
  assert.deepEqual(titles, ["bubble sort", "selection sort", "insertion sort", "merge sort", "quicksort", "heap sort"]);
  const algorithms = suggestionsFor({
    title: "algorithms",
    level: "beginner",
    depth: "practitioner",
    takenTitles: [],
  }).map((topic) => topic.title);
  assert.ok(algorithms.includes("sorting"));
});

test("opening one suggestion keeps its faded siblings", () => {
  const spaceId = "oop";
  const base = spaceNodeId(spaceId);
  const shared = {
    spaceId,
    spaceName: "object oriented programming",
    level: "beginner" as const,
    depth: "practitioner" as const,
    concepts: [] as MeshConcept[],
    edges: [],
    filters: meshFilters,
  };
  const initial = buildMesh({ ...shared, selectedId: base, opened: [] });
  const faded = initial.nodes.filter((node) => node.faded);
  const chosen = faded.find((node) => node.title === "abstraction");
  assert.ok(chosen);
  const siblings = faded.filter((node) => node.id !== chosen.id);
  assert.ok(siblings.length > 0);
  const mesh = buildMesh({
    ...shared,
    selectedId: chosen.id,
    opened: [{ id: chosen.id, anchorId: chosen.anchorId ?? base, title: chosen.title }],
    kept: siblings.map((node) => ({ id: node.id, anchorId: node.anchorId ?? base, title: node.title })),
  });
  const openedNode = mesh.nodes.find((node) => node.id === chosen.id);
  assert.ok(openedNode);
  assert.equal(openedNode.faded, false);
  for (const sibling of siblings) {
    const node = mesh.nodes.find((item) => item.title === sibling.title);
    assert.ok(node, sibling.title);
    assert.equal(node.faded, true);
    assert.equal(node.anchorId, base);
  }
});

test("show more suggestions climbs to the parent when a clicked node runs out", () => {
  const spaceId = "oop";
  const base = spaceNodeId(spaceId);
  const shared = {
    spaceId,
    spaceName: "object oriented programming",
    level: "beginner" as const,
    depth: "practitioner" as const,
    concepts: [] as MeshConcept[],
    edges: [],
    filters: meshFilters,
  };
  const initial = buildMesh({ ...shared, selectedId: base, opened: [] });
  const abstraction = initial.nodes.find((node) => node.title === "abstraction");
  assert.ok(abstraction);
  assert.equal(initial.showMore?.action, "expand");
  const opened = [{ id: abstraction.id, anchorId: abstraction.anchorId ?? base, title: abstraction.title }];
  const onLeaf = buildMesh({ ...shared, selectedId: abstraction.id, opened });
  assert.equal(
    onLeaf.nodes.some((node) => node.faded && node.anchorId === abstraction.id),
    false,
  );
  assert.equal(onLeaf.showMore?.action, "parent");
  if (onLeaf.showMore?.action === "parent") {
    assert.equal(onLeaf.showMore.parentId, base);
    assert.equal(onLeaf.showMore.parentTitle, "object oriented programming");
  }
  const more = buildMesh({
    ...shared,
    selectedId: base,
    opened,
    suggestionPages: { [base]: 2 },
  });
  const titles = more.nodes.filter((node) => node.role === "related").map((node) => node.title);
  assert.ok(titles.includes("abstraction"));
  assert.ok(titles.includes("inheritance"));
  assert.ok(titles.includes("polymorphism"));
  const full = buildMesh({
    ...shared,
    selectedId: base,
    opened: [],
    suggestionPages: { [base]: 5 },
  });
  assert.equal(full.showMore, null);
});

test("every saved suggestion stays on the canvas", () => {
  const spaceId = "notes";
  const base = spaceNodeId(spaceId);
  const concepts: MeshConcept[] = ["clustering", "speaker embeddings", "voice activity", "overlap", "segmentation"].map((title, index) => ({
    id: `note-${index}`,
    title,
    type: "suggested",
    origin: "ai",
    priority: "should",
    status: "unfamiliar",
    explanation: `${title} is one step in separating speakers.`,
    whyItMatters: "The next step depends on it.",
    prerequisiteReason: "",
    captureOrder: null,
  }));
  const shared = {
    spaceId,
    spaceName: "Pottery",
    level: "beginner" as const,
    depth: "practitioner" as const,
    concepts,
    edges: [],
    filters: meshFilters,
  };
  const first = buildMesh({ ...shared, selectedId: base, opened: [] });
  assert.equal(first.nodes.filter((node) => node.faded).length, 5);
  assert.equal(first.showMore, null);
  const leaf = first.nodes.find((node) => node.faded);
  assert.ok(leaf);
  const opened = [{ id: leaf.id, anchorId: leaf.anchorId ?? base, title: leaf.title }];
  const onLeaf = buildMesh({ ...shared, selectedId: leaf.id, opened });
  assert.equal(onLeaf.nodes.filter((node) => node.role === "related").length, 5);
  assert.equal(onLeaf.nodes.find((node) => node.id === leaf.id)?.faded, false);
});

test("saved suggestions stay visible when another node is selected", () => {
  const spaceId = "js";
  const base = spaceNodeId(spaceId);
  const concepts: MeshConcept[] = [
    meshConcept("curry", "Currying", 0),
    {
      id: "scope",
      title: "scope",
      type: "prerequisite",
      origin: "ai",
      priority: "must",
      status: "unfamiliar",
      explanation: "Scope decides where a name can be used.",
      whyItMatters: "Names leak or disappear when scope is misunderstood.",
      prerequisiteReason: "You need scope before closures.",
      captureOrder: null,
    },
  ];
  const shared = {
    spaceId,
    spaceName: "Javascript",
    level: "beginner" as const,
    depth: "overview" as const,
    concepts,
    edges: [],
    filters: meshFilters,
  };
  const onSpace = buildMesh({ ...shared, selectedId: base, opened: [] });
  assert.equal(onSpace.showMore, null);
  assert.ok(onSpace.nodes.some((node) => node.title === "scope" && node.faded));
  const onNote = buildMesh({ ...shared, selectedId: "curry", opened: [] });
  assert.ok(onNote.nodes.some((node) => node.title === "scope" && node.faded));
});

test("timeline is a row and suggestions stay faded until opened", () => {
  const before = buildMesh({
    spaceId: "design",
    spaceName: "System Design",
    level: "beginner",
    depth: "practitioner",
    concepts: [meshConcept("caching", "Caching", 0), meshConcept("auth", "Authentication", 1)],
    edges: [],
    selectedId: null,
    opened: [],
    filters: meshFilters,
  });
  const space = before.nodes.find((node) => node.id === spaceNodeId("design"));
  const first = before.nodes.find((node) => node.id === "caching");
  const second = before.nodes.find((node) => node.id === "auth");
  assert.ok(space && first && second);
  assert.equal(centerOf(space).y, centerOf(first).y);
  assert.equal(centerOf(first).y, centerOf(second).y);
  assert.ok(centerOf(space).x < centerOf(first).x);
  assert.ok(centerOf(first).x < centerOf(second).x);
  assert.equal(first.faded, false);
  assert.equal(second.faded, false);
  const faded = before.nodes.filter((node) => node.faded);
  assert.equal(faded.length, 4);
  assert.ok(faded.every((node) => node.anchorId === spaceNodeId("design")));
  assert.ok(faded.some((node) => centerOf(node).y < centerOf(space).y - 20));
  assert.ok(faded.some((node) => centerOf(node).y > centerOf(space).y + 20));

  const database = faded.find((node) => node.title === "Database");
  assert.ok(database);
  const opened = [{ id: database.id, anchorId: database.anchorId ?? spaceNodeId("design"), title: database.title }];
  const stillOnSpace = buildMesh({
    spaceId: "design",
    spaceName: "System Design",
    level: "beginner",
    depth: "practitioner",
    concepts: [meshConcept("caching", "Caching", 0), meshConcept("auth", "Authentication", 1)],
    edges: [],
    selectedId: null,
    opened,
    filters: meshFilters,
  });
  const onAuth = buildMesh({
    spaceId: "design",
    spaceName: "System Design",
    level: "beginner",
    depth: "practitioner",
    concepts: [meshConcept("caching", "Caching", 0), meshConcept("auth", "Authentication", 1)],
    edges: [],
    selectedId: "auth",
    opened,
    filters: meshFilters,
  });
  const openedDatabase = onAuth.nodes.find((node) => node.title === "Database");
  const stableDatabase = stillOnSpace.nodes.find((node) => node.title === "Database");
  assert.ok(openedDatabase && stableDatabase);
  assert.equal(openedDatabase.faded, false);
  assert.deepEqual(
    { x: openedDatabase.x, y: openedDatabase.y },
    { x: stableDatabase.x, y: stableDatabase.y },
  );
  assert.ok(onAuth.nodes.some((node) => node.faded && node.anchorId === "auth"));
  assert.equal(
    onAuth.nodes.some((node) => node.faded && node.anchorId === spaceNodeId("design")),
    false,
  );

  const advanced = buildMesh({
    spaceId: "design",
    spaceName: "System Design",
    level: "advanced",
    depth: "advanced",
    concepts: [],
    edges: [],
    selectedId: null,
    opened: [],
    filters: meshFilters,
  });
  assert.ok(advanced.nodes.filter((node) => node.faded).length > faded.length);

  for (let i = 0; i < before.nodes.length; i += 1) {
    for (let j = i + 1; j < before.nodes.length; j += 1) {
      const a = centerOf(before.nodes[i]);
      const b = centerOf(before.nodes[j]);
      const gapX = Math.abs(a.x - b.x) - before.nodes[i].width / 2 - before.nodes[j].width / 2;
      const gapY = Math.abs(a.y - b.y) - before.nodes[i].height / 2 - before.nodes[j].height / 2;
      assert.ok(gapX >= 20 || gapY >= 20, `${before.nodes[i].title} overlaps ${before.nodes[j].title}`);
    }
  }
});

test("captured concepts stay on the timeline and connect as a mesh", () => {
  const mesh = buildMesh({
    spaceId: "python",
    spaceName: "Python",
    level: "beginner",
    depth: "practitioner",
    concepts: [meshConcept("oop", "object oriented programming", 0), meshConcept("abstraction", "abstraction", 1)],
    edges: [],
    selectedId: "oop",
    opened: [],
    filters: meshFilters,
  });
  const parent = mesh.nodes.find((node) => node.id === "oop");
  const child = mesh.nodes.find((node) => node.id === "abstraction");
  assert.ok(parent && child);
  assert.equal(centerOf(parent).y, centerOf(child).y);
  assert.ok(centerOf(child).x > centerOf(parent).x);
  assert.equal(parent.faded, false);
  assert.ok(mesh.links.some((link) => link.kind === "mesh" && link.source === "oop" && link.target === "abstraction"));
  assert.ok(mesh.nodes.some((node) => node.faded && node.anchorId === "oop"));
  const branched = buildMesh({
    spaceId: "python",
    spaceName: "Python",
    level: "beginner",
    depth: "practitioner",
    concepts: [meshConcept("oop", "object oriented programming", 0), { ...meshConcept("class", "class", 1), parentId: "oop" }],
    edges: [],
    selectedId: null,
    opened: [],
    filters: meshFilters,
  });
  const branchParent = branched.nodes.find((node) => node.id === "oop");
  const branchChild = branched.nodes.find((node) => node.id === "class");
  assert.ok(branchParent && branchChild);
  assert.equal(centerOf(branchParent).y, centerOf(branched.nodes.find((node) => node.role === "space")!).y);
  assert.ok(Math.abs(centerOf(branchChild).y - centerOf(branchParent).y) > 40);
  assert.ok(branched.links.some((link) => link.source === "class" && link.target === "oop"));
  assert.equal(
    curriculumParentId("REST API", [
      { id: "api", title: "API" },
      { id: "http", title: "HTTP" },
    ]),
    "api",
  );
  assert.equal(
    suggestParentId("abstraction", [
      { id: "oop", title: "object oriented programming" },
      { id: "python", title: "Python" },
    ]),
    "oop",
  );
  assert.equal(suggestParentId("encapsulation", [{ id: "oop", title: "OOP" }]), "oop");
  assert.equal(suggestParentId("object oriented programming", [{ id: "abs", title: "abstraction" }]), null);
  const resolved = resolveParents(
    [
      { id: "oop", title: "object oriented programming", parentId: "abs" },
      { id: "abs", title: "abstraction", parentId: null },
    ],
    new Map(),
  );
  assert.equal(resolved.get("oop"), null);
  assert.equal(resolved.get("abs"), "oop");
  assert.equal(
    suggestParentId("Caching", [
      { id: "design", title: "System Design" },
      { id: "http", title: "HTTP" },
    ]),
    "design",
  );
});

test("a hovered topic keeps a short definition and a longer learn-more note", () => {
  const sorting = briefFor({ title: "sorting", summary: "unused", description: "unused" });
  assert.match(sorting.definition, /order/i);
  assert.ok(sorting.definition.length < 180);
  assert.match(sorting.more, /merge sort/i);
  assert.ok(sorting.more.length > sorting.definition.length);

  const written = briefFor({
    title: "sorting",
    summary: "unused",
    description: "unused",
    explanation: "Sorting arranges records so a later lookup can stop early.",
    whyItMatters: "Indexes and merge steps both depend on that order.",
  });
  assert.match(written.definition, /lookup/i);
  assert.match(written.more, /Indexes/);
  assert.doesNotMatch(written.definition, /smallest to largest/);

  const custom = briefFor({
    title: "Speaker overlap",
    summary: "Short fallback.",
    description: "Why the gap matters.",
    explanation: "You captured this while listening.",
    whyItMatters: "Overlap is where two speakers share the same stretch of audio.",
  });
  assert.equal(custom.definition, "Short fallback.");
  assert.match(custom.more, /two speakers/i);

  assert.deepEqual(
    parseDefinition({
      definition: "A hash map stores a value under a key.",
      more: "Looking up one key does not require scanning every entry.",
    }),
    {
      definition: "A hash map stores a value under a key.",
      more: "Looking up one key does not require scanning every entry.",
    },
  );
  assert.equal(parseDefinition({ definition: "too short", more: "also short" }), null);
});
