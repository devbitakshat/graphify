import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

process.env.PGLITE_DIR = mkdtempSync(path.join(tmpdir(), "gapmap-"));
process.env.ALLOW_PGLITE = "1";
delete process.env.DATABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_URL;

test("captured concepts survive regeneration and resources use real hosts", async () => {
  const {
    createConcept,
    createSpace,
    createUser,
    getGraphView,
    removeConcept,
    setConceptStatus,
  } = await import("./repository");
  const { generateSpaceGraph } = await import("../graph/persist");

  const user = await createUser({
    email: `learner-${Date.now()}@example.com`,
    name: "Learner",
  });
  const space = await createSpace(user.id, {
    name: "Backend Development",
    goal: "interview",
    level: "beginner",
    depth: "practitioner",
    timeAvailable: "15 hours",
    resourcePreference: "documentation",
  });
  for (const title of ["Types of APIs", "Authentication", "System Design", "Caching"]) {
    const error = await createConcept(user.id, space.id, {
      title,
      status: "unfamiliar",
      url: "",
      note: "",
      parentId: null,
    });
    assert.equal(error, null);
  }

  const before = await getGraphView(user.id, space.id);
  assert.ok(before);
  assert.deepEqual(
    before.concepts
      .filter((concept) => concept.origin === "user")
      .sort((a, b) => (a.captureOrder ?? 0) - (b.captureOrder ?? 0))
      .map((concept) => concept.title),
    ["Types of APIs", "Authentication", "System Design", "Caching"],
  );
  assert.ok(before.concepts.some((concept) => concept.origin === "ai" && concept.prerequisiteReason.length > 10));
  assert.ok(before.edges.length > 0);

  await generateSpaceGraph(user.id, space.id);
  const first = await getGraphView(user.id, space.id);
  assert.ok(first);
  for (const title of ["Types of APIs", "Authentication", "System Design", "Caching"]) {
    assert.equal(first.concepts.find((concept) => concept.title === title)?.origin, "user");
  }
  assert.deepEqual(
    first.concepts
      .filter((concept) => concept.origin === "user")
      .sort((a, b) => (a.captureOrder ?? 0) - (b.captureOrder ?? 0))
      .map((concept) => concept.title),
    ["Types of APIs", "Authentication", "System Design", "Caching"],
  );
  const prerequisite = first.concepts.find((concept) => concept.type === "prerequisite");
  assert.ok(prerequisite);
  assert.ok(prerequisite.prerequisiteReason.length > 10);
  assert.ok(first.edges.some((edge) => edge.relationship === "required for"));
  assert.ok(first.resources.length > 0);
  assert.ok(first.resources.every((resource) => resource.url.startsWith("https://")));
  assert.ok(
    first.resources.every((resource) =>
      ["en.wikipedia.org", "developer.mozilla.org", "www.youtube.com"].includes(new URL(resource.url).hostname),
    ),
  );

  const aiNode = first.concepts.find((concept) => concept.origin === "ai");
  assert.ok(aiNode);
  await setConceptStatus(user.id, first.concepts.find((concept) => concept.title === "HTTP")?.id ?? aiNode.id, "understood");
  await removeConcept(user.id, aiNode.id);
  await generateSpaceGraph(user.id, space.id);
  const second = await getGraphView(user.id, space.id);
  assert.ok(second);
  for (const title of ["Types of APIs", "Authentication", "System Design", "Caching"]) {
    assert.ok(second.concepts.some((concept) => concept.title === title && concept.origin === "user"));
  }
  assert.equal(second.concepts.some((concept) => concept.id === aiNode.id), false);
  assert.equal(second.concepts.some((concept) => concept.title === aiNode.title), false);
});

test("visible suggestions are saved for the space owner only", async () => {
  const { createSpace, createUser, getGraphView, saveConceptBrief, saveFocusSuggestions } = await import("./repository");
  const { dbQuery } = await import("../db/client");

  const owner = await createUser({
    email: `owner-${Date.now()}@example.com`,
    name: "Owner",
  });
  const other = await createUser({
    email: `other-${Date.now()}@example.com`,
    name: "Other",
  });
  const space = await createSpace(owner.id, {
    name: "Sorting",
    goal: "curiosity",
    level: "beginner",
    depth: "overview",
    timeAvailable: "6 hours",
    resourcePreference: "any",
  });
  const saved = await saveFocusSuggestions(owner.id, space.id, `suggest:${Date.now()}`, 1, "Sorting", [
    {
      title: "Neighbor swap",
      type: "suggested",
      priority: "should",
      explanation: "A neighbor swap exchanges two values that are out of order.",
      whyItMatters: "Swapping neighbors is the move bubble sort repeats.",
      relationship: "part of",
      anchorId: null,
      anchorTitle: "bubble sort",
      focusIsSource: false,
    },
  ]);
  assert.ok(saved > 0);
  const view = await getGraphView(owner.id, space.id);
  assert.ok(view);
  assert.ok(view.concepts.some((concept) => concept.title === "bubble sort" && concept.origin === "ai"));
  assert.ok(view.concepts.some((concept) => concept.title === "Neighbor swap" && concept.origin === "ai"));
  assert.ok(
    view.edges.some(
      (edge) =>
        edge.relationship === "part of" &&
        view.concepts.some((concept) => concept.id === edge.sourceId && concept.title === "Neighbor swap") &&
        view.concepts.some((concept) => concept.id === edge.targetId && concept.title === "bubble sort"),
    ),
  );
  assert.equal(await getGraphView(other.id, space.id), null);
  const owners = await dbQuery<{ user_id: string }>("select user_id from concepts where space_id = $1", [space.id]);
  assert.ok(owners.length > 0);
  assert.ok(owners.every((row) => row.user_id === owner.id));
  await saveConceptBrief(
    owner.id,
    space.id,
    "Pivot partition",
    "A pivot partition splits a list into values below and above a chosen pivot.",
    "Partitioning is the step quicksort repeats.",
  );
  const defined = await getGraphView(owner.id, space.id);
  assert.ok(defined?.concepts.some((concept) => concept.title === "Pivot partition" && concept.origin === "ai"));
  assert.equal(await getGraphView(other.id, space.id), null);
});
