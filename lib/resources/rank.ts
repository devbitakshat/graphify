import type { Level, Preference } from "../domain";

export type ResourceCandidate = {
  title: string;
  url: string;
  kind: "article" | "video" | "documentation" | "course";
  provider: "Wikipedia" | "MDN" | "YouTube";
  duration: string;
  durationMinutes: number | null;
  isFree: boolean;
};

export type RankedResource = ResourceCandidate & {
  score: number;
  whyRecommended: string;
};

const providerHosts: Record<ResourceCandidate["provider"], string[]> = {
  Wikipedia: ["en.wikipedia.org"],
  MDN: ["developer.mozilla.org"],
  YouTube: ["www.youtube.com", "youtube.com"],
};

export function acceptedResourceUrl(provider: string, url: string) {
  try {
    const parsed = new URL(url);
    const hosts = providerHosts[provider as ResourceCandidate["provider"]];
    if (parsed.protocol !== "https:" || !hosts?.includes(parsed.hostname)) return false;
    if (provider === "Wikipedia") {
      return parsed.pathname.startsWith("/wiki/") && !parsed.pathname.includes(":");
    }
    if (provider === "MDN") return parsed.pathname.includes("/docs/");
    if (provider === "YouTube") return parsed.pathname === "/watch" && parsed.searchParams.has("v");
    return false;
  } catch {
    return false;
  }
}

function normalizedWords(value: string) {
  return value
    .toLowerCase()
    .replace(/\bapis\b/g, "api")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function titleFit(candidateTitle: string, conceptTitle: string) {
  const concept = normalizedWords(conceptTitle);
  const title = normalizedWords(candidateTitle);
  if (!concept || !title) return -8;
  if (concept.includes(title) || title.includes(concept)) return 6;
  const distinctive = concept.split(" ").filter((token) => token.length > 3);
  if (distinctive.length > 0 && distinctive.every((token) => title.includes(token))) return 4;
  return -8;
}

function scoreCandidate(
  candidate: ResourceCandidate,
  conceptTitle: string,
  preference: Preference,
  level: Level,
) {
  let score = titleFit(candidate.title, conceptTitle);
  const concept = conceptTitle.toLowerCase();
  if (preference !== "any" && candidate.kind === preference) score += 4;
  if (candidate.kind === "documentation" && /http|html|css|javascript|url|api|fetch/.test(concept)) score += 3;
  if (level === "beginner" && candidate.provider === "Wikipedia") score += 2;
  if (level === "advanced" && candidate.provider === "Wikipedia") score -= 1;
  if (candidate.isFree) score += 1;
  if (candidate.durationMinutes != null && candidate.durationMinutes <= 20) score += 1;
  return score;
}

export function whyRecommended(
  candidate: ResourceCandidate,
  conceptTitle: string,
  preference: Preference,
  level: Level,
) {
  const reasons = [`Verified ${candidate.provider} result for “${conceptTitle}”`];
  if (preference !== "any" && candidate.kind === preference) {
    reasons.push(`matches your ${preference} preference`);
  } else if (preference !== "any") {
    reasons.push(`closest verified result; no higher-ranked ${preference} was returned`);
  }
  if (level === "beginner" && candidate.provider === "Wikipedia") reasons.push("a short beginner overview");
  if (candidate.kind === "documentation") reasons.push("primary documentation");
  if (candidate.duration) reasons.push(candidate.duration);
  if (candidate.isFree) reasons.push("free");
  return `${reasons.join(". ")}.`;
}

export function rankResources(
  candidates: ResourceCandidate[],
  conceptTitle: string,
  preference: Preference,
  level: Level,
) {
  const unique = candidates.filter(
    (candidate, index) =>
      acceptedResourceUrl(candidate.provider, candidate.url) &&
      candidates.findIndex((item) => item.url === candidate.url) === index,
  );
  const ranked = unique
    .map((candidate) => ({
      ...candidate,
      score: scoreCandidate(candidate, conceptTitle, preference, level),
      whyRecommended: whyRecommended(candidate, conceptTitle, preference, level),
    }))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  const picked: RankedResource[] = [];
  const alreadyPicked = (url: string) => picked.some((item) => item.url === url);
  for (const candidate of ranked) {
    if (picked.length >= 2) break;
    if (alreadyPicked(candidate.url)) continue;
    const diverseChoiceExists =
      picked.length === 1 &&
      picked[0]?.provider === candidate.provider &&
      ranked.some((item) => item.provider !== candidate.provider && !alreadyPicked(item.url));
    if (diverseChoiceExists) continue;
    picked.push(candidate);
  }
  for (const candidate of ranked) {
    if (picked.length >= 2) break;
    if (!alreadyPicked(candidate.url)) picked.push(candidate);
  }
  return picked;
}
