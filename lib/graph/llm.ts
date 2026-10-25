import type { AiConfig } from "../ai/settings";
import type { PlannerInput } from "./plan";
import { clampPlanInput, graphPlanSchema, type GraphPlan } from "./schema";

const systemPrompt = `You build a personal knowledge-gap graph for a learning space. Return JSON only.
Rules:
- If captured titles are provided, include every captured title exactly once, with type "captured". Never drop a captured concept.
- If captured is empty, seed the graph from spaceName:
  1) Include exactly one overview node whose title equals spaceName, type "suggested", with explanation = a 1–2 sentence plain definition of the topic and whyItMatters for a learner.
  2) Add related prerequisite and suggested nodes around it (not titled spaceName). Use type "suggested" or "prerequisite" only (never "captured").
- Add only the missing prerequisites and closely related concepts that fit the goal, level, depth, and time budget.
- Do not invent resource URLs.
- Every prerequisite node needs prerequisiteReason: why that concept is necessary before another.
- relationship must be exactly one of: required for, is a type of, uses, supports, part of, same as, demonstrates.
- Direction: "HTTP" required for "REST API". "REST API" is a type of "API". "Authentication" uses "JWT". "Caching" supports "Scalability". "Load balancing" part of "System Design".
- learningOrder lists every node id. A concept that is required for another comes first.
- Prefer must-know prerequisites over nice-to-know topics. Stay within nodeBudget nodes beyond the captured ones (or within nodeBudget total when captured is empty).
- type is captured, prerequisite, suggested, or project. priority is must, should, nice, or out_of_scope.
- Each node needs a short explanation (1–2 sentences) suitable for a graph bubble.
Shape: {"nodes":[{"id":"","title":"","type":"captured","priority":"must","explanation":"","whyItMatters":"","goalRelationship":"","example":"","effort":"","prerequisiteReason":""}],"edges":[{"source":"","target":"","relationship":"required for"}],"learningOrder":[]}`;

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const source = (fenced ? fenced[1] : text).trim();
  try {
    return JSON.parse(source) as unknown;
  } catch {
    const start = source.indexOf("{");
    const end = source.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("not json");
    return JSON.parse(source.slice(start, end + 1)) as unknown;
  }
}

export function groqReasoningModel(model: string, base: string) {
  return /gpt-oss|groq\.com/i.test(`${model} ${base}`);
}

export function chatEndpoint(config: AiConfig) {
  return `${config.baseUrl.replace(/\/$/, "")}/chat/completions`;
}

async function complete(config: AiConfig, input: PlannerInput, correction?: string) {
  const base = config.baseUrl.replace(/\/$/, "");
  const model = config.model;
  // Groq's gpt-oss models think in a separate channel. Strict JSON mode
  // rejects that draft with HTTP 400 before we can read it.
  const groqReasoning = groqReasoningModel(model, base);
  const response = await fetch(chatEndpoint(config), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      ...(groqReasoning
        ? { reasoning_format: "hidden", reasoning_effort: "low", max_completion_tokens: 8192 }
        : { response_format: { type: "json_object" } }),
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            spaceName: input.spaceName,
            goal: input.goal,
            level: input.level,
            depth: input.depth,
            timeAvailable: input.timeAvailable,
            nodeBudget: Math.max(input.captured.length + 12, 8),
            captured: input.captured,
            seedFromSpace: input.captured.length === 0,
            correction,
          }),
        },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    let detail = "";
    let failedGeneration = "";
    try {
      const err = (await response.json()) as {
        error?: { message?: string; code?: string; failed_generation?: string };
      };
      detail = err.error?.message || err.error?.code || "";
      failedGeneration = err.error?.failed_generation ?? "";
    } catch {
      /* ignore parse failures */
    }
    if (failedGeneration) {
      try {
        extractJson(failedGeneration);
        return failedGeneration;
      } catch {
        /* the draft was not usable JSON */
      }
    }
    throw new Error(
      detail
        ? `The model request failed (${response.status}: ${detail}). Nothing was saved.`
        : `The model request failed (${response.status}). Nothing was saved.`,
    );
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("The model returned an empty response. Nothing was saved.");
  return content;
}

const definitionPrompt = `You explain one topic for a learner looking at a knowledge graph. Return JSON only: {"definition":"","more":""}.
definition: one or two plain sentences, under 180 characters, saying what the topic is.
more: two or three short sentences with a concrete example or why it matters. Under 420 characters.
No markdown, no labels, no mention of these instructions.`;

export function parseDefinition(value: unknown): { definition: string; more: string } | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { definition?: unknown; more?: unknown };
  const definition = typeof record.definition === "string" ? record.definition.replace(/\s+/g, " ").trim().slice(0, 220) : "";
  const more = typeof record.more === "string" ? record.more.replace(/\s+/g, " ").trim().slice(0, 500) : "";
  if (definition.length < 12 || more.length < 12) return null;
  return { definition, more };
}

export async function defineWithModel(
  config: AiConfig | null,
  input: { title: string; spaceName: string; level: string },
) {
  if (!config) {
    throw new Error("Add your AI model and API key in settings to generate definitions.");
  }
  const model = config.model;
  const reasoningJson = groqReasoningModel(model, config.baseUrl)
    ? { reasoning_format: "hidden" as const, reasoning_effort: "low" as const, max_completion_tokens: 1024 }
    : {};
  const response = await fetch(chatEndpoint(config), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      ...reasoningJson,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: definitionPrompt },
        {
          role: "user",
          content: JSON.stringify({
            title: input.title,
            spaceName: input.spaceName,
            level: input.level,
          }),
        },
      ],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    throw new Error(`The model request failed (${response.status}).`);
  }
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("The model returned an empty definition.");
  let raw: unknown;
  try {
    raw = extractJson(content);
  } catch {
    throw new Error("The model definition was not valid JSON.");
  }
  const parsed = parseDefinition(raw);
  if (!parsed) throw new Error("The model definition was too short to use.");
  return parsed;
}

/** Sends one tiny request so a bad key or model name fails at setup, not mid-study. */
export async function verifyModelAccess(config: AiConfig): Promise<string | null> {
  let response: Response;
  try {
    response = await fetch(chatEndpoint(config), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: "Reply with the word ok." }],
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    return "Could not reach the provider. Check your connection and try again.";
  }
  if (response.ok) return null;
  let detail = "";
  try {
    const err = (await response.json()) as { error?: { message?: string } } | Array<{ error?: { message?: string } }>;
    detail = (Array.isArray(err) ? err[0]?.error?.message : err.error?.message) ?? "";
  } catch {
    /* ignore parse failures */
  }
  if (response.status === 401 || response.status === 403) {
    return `The provider rejected that API key (${response.status}).`;
  }
  return detail
    ? `The provider refused the request (${response.status}: ${detail.slice(0, 200)}).`
    : `The provider refused the request (${response.status}). Check the model name.`;
}

export async function planWithModel(config: AiConfig, input: PlannerInput): Promise<GraphPlan> {
  let correction: string | undefined;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const content = await complete(config, input, correction);
    let raw: unknown;
    try {
      raw = extractJson(content);
    } catch {
      correction = "Return one JSON object only, with nodes, edges, and learningOrder.";
      continue;
    }
    const parsed = graphPlanSchema.safeParse(clampPlanInput(raw));
    if (parsed.success) return parsed.data;
    correction = "The previous JSON failed validation. Keep the same shape and shorten any long text fields.";
  }
  throw new Error("The model response did not match the graph schema, so nothing was saved.");
}
