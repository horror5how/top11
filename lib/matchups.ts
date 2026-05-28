// Helpers for /vs/[a]-vs-[b] and /alternatives-to/[brand] comparison pages.
// These pages are entirely derived from the existing list JSON — no extra data needed.

import { getList, listSlugs, type ListData } from "@/lib/lists";

export type EntryRef = {
  list: ListData;
  entry: ListData["entries"][number];
};

/** kebab-case a brand name → matches the slugs we'll accept in URLs. */
export function brandSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Every (list, entry) pair across the entire site, indexed by brand slug. */
export function allEntriesByBrand(): Map<string, EntryRef[]> {
  const m = new Map<string, EntryRef[]>();
  for (const slug of listSlugs()) {
    const list = getList(slug);
    if (!list) continue;
    for (const entry of list.entries) {
      const s = brandSlug(entry.name);
      const arr = m.get(s) || [];
      arr.push({ list, entry });
      m.set(s, arr);
    }
  }
  return m;
}

/** All distinct ranked brands as kebab slugs. */
export function allBrandSlugs(): string[] {
  return Array.from(allEntriesByBrand().keys()).sort();
}

/** All matchup permutations as "{a-slug}-vs-{b-slug}". Only pairs that share a list. */
export function allMatchupSlugs(): string[] {
  const out: string[] = [];
  for (const slug of listSlugs()) {
    const list = getList(slug);
    if (!list) continue;
    const slugs = list.entries.map((e) => brandSlug(e.name));
    for (let i = 0; i < slugs.length; i++) {
      for (let j = i + 1; j < slugs.length; j++) {
        out.push(`${slugs[i]}-vs-${slugs[j]}`);
      }
    }
  }
  return Array.from(new Set(out));
}

/** Parse "a-slug-vs-b-slug" → [a, b]. */
export function parseMatchup(matchup: string): [string, string] | null {
  const i = matchup.indexOf("-vs-");
  if (i < 0) return null;
  const a = matchup.slice(0, i);
  const b = matchup.slice(i + 4);
  if (!a || !b) return null;
  return [a, b];
}

/** Find the canonical (list, entry) pair for a brand slug; prefer the highest rank found anywhere. */
export function lookupBrand(slug: string): EntryRef | null {
  const refs = allEntriesByBrand().get(slug);
  if (!refs?.length) return null;
  return refs.slice().sort((x, y) => x.entry.rank - y.entry.rank)[0];
}
