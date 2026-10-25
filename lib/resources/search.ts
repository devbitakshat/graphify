import type { Level, Preference } from "../domain";
import { rankResources, type ResourceCandidate } from "./rank";

type SearchResult = {
  conceptId: string;
  ok: boolean;
  resources: Array<ResourceCandidate & { whyRecommended: string }>;
};

async function readJson(response: Response) {
  if (!response.ok) throw new Error(`Search failed (${response.status})`);
  return response.json() as Promise<unknown>;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

async function searchWikipedia(query: string): Promise<ResourceCandidate[]> {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrlimit", "3");
  url.searchParams.set("prop", "info");
  url.searchParams.set("inprop", "url");
  url.searchParams.set("format", "json");
  const response = await fetch(url, {
    headers: { "User-Agent": "Graphily/0.1 (personal learning graph)" },
    signal: AbortSignal.timeout(8000),
  });
  const payload = asRecord(await readJson(response));
  const queryResult = asRecord(payload?.query);
  const pages = asRecord(queryResult?.pages);
  if (!pages) return [];
  return Object.values(pages).flatMap((page) => {
    const record = asRecord(page);
    const title = typeof record?.title === "string" ? record.title : "";
    const pageUrl = typeof record?.fullurl === "string" ? record.fullurl : "";
    if (!title || !pageUrl) return [];
    return [{
      title,
      url: pageUrl,
      kind: "article" as const,
      provider: "Wikipedia" as const,
      duration: "",
      durationMinutes: null,
      isFree: true,
    }];
  });
}

async function searchMdn(query: string): Promise<ResourceCandidate[]> {
  const url = new URL("https://developer.mozilla.org/api/v1/search");
  url.searchParams.set("q", query);
  url.searchParams.set("locale", "en-US");
  const response = await fetch(url, {
    headers: { "User-Agent": "Graphily/0.1 (personal learning graph)" },
    signal: AbortSignal.timeout(8000),
  });
  const payload = asRecord(await readJson(response));
  const documents = Array.isArray(payload?.documents) ? payload.documents : [];
  return documents.slice(0, 3).flatMap((document) => {
    const record = asRecord(document);
    const title = typeof record?.title === "string" ? record.title : "";
    const mdnUrl = typeof record?.mdn_url === "string" ? record.mdn_url : "";
    if (!title || !mdnUrl) return [];
    const fullUrl = mdnUrl.startsWith("http") ? mdnUrl : `https://developer.mozilla.org${mdnUrl}`;
    return [{
      title,
      url: fullUrl,
      kind: "documentation" as const,
      provider: "MDN" as const,
      duration: "",
      durationMinutes: null,
      isFree: true,
    }];
  });
}

function youtubeDuration(value: string) {
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return { label: "", minutes: null as number | null };
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const total = hours * 60 + minutes + (seconds >= 30 ? 1 : 0);
  const label = hours > 0 ? `${hours}h ${minutes}m` : `${Math.max(total, 1)} min`;
  return { label, minutes: total };
}

async function searchYouTube(query: string): Promise<ResourceCandidate[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("maxResults", "3");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("key", key);
  const searchPayload = asRecord(await readJson(await fetch(searchUrl, { signal: AbortSignal.timeout(8000) })));
  const items = Array.isArray(searchPayload?.items) ? searchPayload.items : [];
  const videos = items.flatMap((item) => {
    const record = asRecord(item);
    const id = asRecord(record?.id);
    const snippet = asRecord(record?.snippet);
    const videoId = typeof id?.videoId === "string" ? id.videoId : "";
    const title = typeof snippet?.title === "string" ? snippet.title : "";
    if (!videoId || !title) return [];
    return [{ videoId, title }];
  });
  if (videos.length === 0) return [];

  const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  detailsUrl.searchParams.set("part", "contentDetails");
  detailsUrl.searchParams.set("id", videos.map((video) => video.videoId).join(","));
  detailsUrl.searchParams.set("key", key);
  const detailsPayload = asRecord(await readJson(await fetch(detailsUrl, { signal: AbortSignal.timeout(8000) })));
  const details = new Map<string, string>();
  for (const item of Array.isArray(detailsPayload?.items) ? detailsPayload.items : []) {
    const record = asRecord(item);
    const content = asRecord(record?.contentDetails);
    if (typeof record?.id === "string" && typeof content?.duration === "string") {
      details.set(record.id, content.duration);
    }
  }

  return videos.map((video) => {
    const duration = youtubeDuration(details.get(video.videoId) ?? "");
    return {
      title: video.title,
      url: `https://www.youtube.com/watch?v=${video.videoId}`,
      kind: "video" as const,
      provider: "YouTube" as const,
      duration: duration.label,
      durationMinutes: duration.minutes,
      isFree: true,
    };
  });
}

async function candidatesFor(title: string, level: Level, preference: Preference) {
  const youtubeQuery = `${title} ${preference === "course" ? "course" : level === "beginner" ? "introduction" : "explained"}`;
  const results = await Promise.allSettled([
    searchWikipedia(title),
    searchMdn(title),
    searchYouTube(youtubeQuery),
  ]);
  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

export async function findResources(
  concepts: Array<{ id: string; title: string; priority: string; type: string; learningOrder: number | null }>,
  preference: Preference,
  level: Level,
) {
  const targets = concepts
    .filter((concept) => (concept.priority === "must" || concept.priority === "should") && concept.type !== "project")
    .sort((a, b) => (a.learningOrder ?? 999) - (b.learningOrder ?? 999))
    .slice(0, 8);

  const found: SearchResult[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < targets.length) {
      const concept = targets[cursor];
      cursor += 1;
      if (!concept) continue;
      try {
        const candidates = await candidatesFor(concept.title, level, preference);
        found.push({
          conceptId: concept.id,
          ok: true,
          resources: rankResources(candidates, concept.title, preference, level),
        });
      } catch {
        found.push({ conceptId: concept.id, ok: false, resources: [] });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, targets.length) }, () => worker()));
  return found;
}
