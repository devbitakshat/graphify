export function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function cleanUrl(value: string): { ok: true; url: string } | { ok: false; error: string } {
  if (!value) return { ok: true, url: "" };
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false, error: "Use an http or https link." };
    }
    return { ok: true, url: url.toString() };
  } catch {
    return { ok: false, error: "Use an http or https link." };
  }
}
