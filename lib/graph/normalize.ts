export function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\bapis\b/g, "api")
    .replace(/\bjwts\b/g, "jwt");
}

export function titleKey(title: string) {
  return normalizeTitle(title).replace(/\s+/g, "-") || "concept";
}
