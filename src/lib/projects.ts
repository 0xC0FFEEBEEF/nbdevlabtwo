import type { CollectionEntry } from "astro:content";

type ProjectEntry = CollectionEntry<"projects">;

const SLUG_PATTERN = /^[a-z0-9]+(?:[\-_][a-z0-9]+)*$/;

export function sanitizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveProjectSlug(entry: ProjectEntry): string {
  const source = entry.data.slug && SLUG_PATTERN.test(entry.data.slug)
    ? entry.data.slug
    : sanitizeSlug(entry.slug);
  if (!source) {
    throw new Error(`Unable to derive slug for project: ${entry.id}`);
  }
  return source;
}

export function normalizeProjects(entries: ProjectEntry[]): ProjectEntry[] {
  const seen = new Map<string, number>();
  return entries.map((entry) => {
    const base = resolveProjectSlug(entry);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    const uniqueSlug = count === 1 ? base : `${base}-${count}`;
    return {
      ...entry,
      data: {
        ...entry.data,
        slug: uniqueSlug,
      },
    };
  });
}
