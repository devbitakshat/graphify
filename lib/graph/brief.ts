import { exactSeed } from "./plan";
import { studyTopic } from "./topics";

const DEFINITION_LIMIT = 220;

export type TopicBrief = {
  definition: string;
  more: string;
};

function tidy(text: string | undefined) {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function splitShort(text: string) {
  if (text.length <= DEFINITION_LIMIT) return { short: text, rest: "" };
  const slice = text.slice(0, DEFINITION_LIMIT);
  const cut = slice.lastIndexOf(" ");
  const short = (cut > 120 ? slice.slice(0, cut) : slice).trimEnd();
  return { short, rest: text.slice(short.length).trim() };
}

export function isCatalogCopy(title: string, text: string | undefined) {
  const clean = tidy(text);
  if (!clean) return true;
  if (/^you captured\b/i.test(clean)) return true;
  if (/^a starting map for learning\b/i.test(clean)) return true;
  if (/^a starting point for\b/i.test(clean)) return true;
  const study = studyTopic(title);
  if (study && (clean === study.summary || clean === study.detail)) return true;
  const seed = exactSeed(title);
  if (seed && (clean === seed.explanation || clean === seed.whyItMatters || clean === seed.example)) return true;
  return false;
}

function joinUnique(parts: Array<string | undefined>, definition: string) {
  const seen = new Set([definition.toLowerCase()]);
  const kept: string[] = [];
  for (const part of parts) {
    const clean = tidy(part);
    if (!clean || clean.startsWith("You captured")) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(clean);
  }
  return kept.join(" ");
}

export function briefFor(input: {
  title: string;
  summary: string;
  description?: string;
  explanation?: string;
  whyItMatters?: string;
  example?: string;
  goalRelationship?: string;
}): TopicBrief {
  const explanation = tidy(input.explanation);
  const modelExplanation = explanation && !isCatalogCopy(input.title, explanation) ? explanation : "";
  if (modelExplanation) {
    const split = splitShort(modelExplanation);
    const moreParts = [split.rest, input.whyItMatters, input.example, input.goalRelationship, input.description].filter(
      (part) => !isCatalogCopy(input.title, part),
    );
    return {
      definition: split.short,
      more: joinUnique(moreParts, split.short),
    };
  }

  const study = studyTopic(input.title);
  if (study) return { definition: study.summary, more: study.detail };

  const seed = exactSeed(input.title);
  if (seed) {
    return {
      definition: seed.explanation,
      more: joinUnique([seed.whyItMatters, seed.example], seed.explanation),
    };
  }

  const source = tidy(input.summary);
  const split = splitShort(source);
  return {
    definition: split.short,
    more: joinUnique([split.rest, input.whyItMatters, input.example, input.goalRelationship, input.description], split.short),
  };
}
