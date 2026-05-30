// Slice helpers — every slice is derived from the same source-of-truth list JSON.
// Returns up to 11 results. When fewer match, the page renders honest "N of 11" copy.

import { getList, listSlugs, type ListData } from "@/lib/lists";

export type Entry = ListData["entries"][number] & {
  price_min?: number | null;
  price_max?: number | null;
  currency?: string;
  free_tier?: boolean;
  setup_fee?: number | null;
  integrations?: string[];
  compliance?: string[];
  regions?: string[];
  onboarding_days?: number | null;
  min_team_size?: number | null;
  max_team_size?: number | null;
};

export type SliceResult = {
  list: ListData;
  entries: Entry[];
  matched: number; // how many entries matched the filter (may be > 11)
  shown: number; // how many we show (min(matched, 11))
};

const cap = (arr: Entry[]): { entries: Entry[]; matched: number; shown: number } => ({
  entries: arr.slice(0, 11),
  matched: arr.length,
  shown: Math.min(arr.length, 11),
});

/** Sort by lowest price (price_min asc). Null prices fall to bottom. */
export function cheapest(slug: string): SliceResult | null {
  const list = getList(slug);
  if (!list) return null;
  const sorted = (list.entries as Entry[])
    .slice()
    .sort((a, b) => {
      const pa = a.price_min ?? Number.POSITIVE_INFINITY;
      const pb = b.price_min ?? Number.POSITIVE_INFINITY;
      return pa - pb;
    });
  return { list, ...cap(sorted) };
}

/** Same as the canonical /{slug} page but sorted strictly by score desc. */
export function highestRated(slug: string): SliceResult | null {
  const list = getList(slug);
  if (!list) return null;
  const sorted = (list.entries as Entry[])
    .slice()
    .sort((a, b) => (b.score_out_of_94 ?? 0) - (a.score_out_of_94 ?? 0));
  return { list, ...cap(sorted) };
}

/** Sort by onboarding_days asc; entries without data fall to bottom. */
export function fastest(slug: string): SliceResult | null {
  const list = getList(slug);
  if (!list) return null;
  const sorted = (list.entries as Entry[])
    .slice()
    .sort((a, b) => {
      const da = a.onboarding_days ?? Number.POSITIVE_INFINITY;
      const db = b.onboarding_days ?? Number.POSITIVE_INFINITY;
      return da - db;
    });
  return { list, ...cap(sorted) };
}

/** Entries with free_tier=true. */
export function freeTier(slug: string): SliceResult | null {
  const list = getList(slug);
  if (!list) return null;
  const filtered = (list.entries as Entry[]).filter((e) => e.free_tier);
  return { list, ...cap(filtered) };
}

/** Entries with price_max <= amount (or price_min if no max). */
export function under(slug: string, amount: number): SliceResult | null {
  const list = getList(slug);
  if (!list) return null;
  const filtered = (list.entries as Entry[]).filter((e) => {
    const ceiling = e.price_max ?? e.price_min;
    return ceiling != null && ceiling <= amount;
  });
  const sorted = filtered.sort((a, b) => (a.price_min ?? 0) - (b.price_min ?? 0));
  return { list, ...cap(sorted) };
}

/** Entries whose best_for, segment_tags, or match_index personas match a segment label. */
export function bestFor(slug: string, segment: string): SliceResult | null {
  const list = getList(slug) as unknown as { segment_tags?: string[]; match_index?: Record<string, { solves?: string[]; personas?: string[] }>; entries?: Entry[] };
  if (!list) return null;
  const needle = segment.toLowerCase().replace(/-/g, " ");
  const segKebab = segment.toLowerCase();
  const listLevelMatch = (list.segment_tags || []).some((t) => t.toLowerCase() === segKebab);
  const mi = list.match_index || {};
  const filtered = (list.entries || []).filter((e) => {
    const text = [e.best_for, e.best_for_short, e.verdict, ...(e.integrations || [])].filter(Boolean).join(" ").toLowerCase();
    if (text.includes(needle)) return true;
    const m = mi[String(e.rank)] || {};
    const personaHit = (m.personas || []).some((p) => p.toLowerCase().includes(needle) || p.toLowerCase().replace(/\s+/g, "-") === segKebab);
    const solveHit = (m.solves || []).some((p) => p.toLowerCase().includes(needle) || p.toLowerCase() === segKebab);
    if (personaHit || solveHit) return true;
    // If the segment is a list-level tag, all entries qualify (the segment describes the whole list)
    return listLevelMatch;
  });
  return { list: getList(slug)!, ...cap(filtered) };
}

/** Entries whose integrations array contains the given tool. */
export function worksWith(slug: string, tool: string): SliceResult | null {
  const list = getList(slug);
  if (!list) return null;
  const needle = tool.toLowerCase();
  const filtered = (list.entries as Entry[]).filter((e) =>
    (e.integrations || []).some((i) => i.toLowerCase() === needle || i.toLowerCase().includes(needle)),
  );
  return { list, ...cap(filtered) };
}

/** Entries serving a region. */
export function inRegion(slug: string, region: string): SliceResult | null {
  const list = getList(slug);
  if (!list) return null;
  const needle = region.toUpperCase();
  const filtered = (list.entries as Entry[]).filter((e) =>
    (e.regions || []).some((r) => r.toUpperCase() === needle || r.toUpperCase() === "GLOBAL"),
  );
  return { list, ...cap(filtered) };
}

/** Entries holding a compliance certification. */
export function compliant(slug: string, standard: string): SliceResult | null {
  const list = getList(slug);
  if (!list) return null;
  const needle = standard.toUpperCase();
  const filtered = (list.entries as Entry[]).filter((e) =>
    (e.compliance || []).some((c) => c.toUpperCase() === needle),
  );
  return { list, ...cap(filtered) };
}

/** Common segment slugs derivable from segment_tags, query_intents, or match_index. */
export function segmentsFor(slug: string): string[] {
  const list = getList(slug) as unknown as { segment_tags?: string[]; query_intents?: string[]; match_index?: Record<string, { solves?: string[]; personas?: string[] }>; entries?: Entry[] };
  if (!list) return [];
  const out = new Set<string>();
  // Prefer explicit segment_tags (already kebab-case)
  for (const t of list.segment_tags || []) {
    const s = t.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (s) out.add(s);
  }
  // match_index.personas — convert "seed-stage ai founder" → "seed-stage-ai-founder"
  for (const m of Object.values(list.match_index || {})) {
    for (const persona of m.personas || []) {
      const s = persona.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      if (s) out.add(s);
    }
    for (const solves of m.solves || []) {
      const s = solves.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      if (s) out.add(s);
    }
  }
  // Fallback: derive from best_for_short phrases
  for (const e of list.entries || []) {
    const phrases = (e.best_for_short || e.best_for || "")
      .toLowerCase().split(/[,;/]/).map((s) => s.trim()).filter((s) => s.length > 3 && s.length < 40)
      .map((s) => s.replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-"));
    for (const p of phrases) if (p) out.add(p);
  }
  return Array.from(out);
}

/** Common integration slugs (only those that actually appear). */
export function integrationsFor(slug: string): string[] {
  const list = getList(slug);
  if (!list) return [];
  const all = new Set<string>();
  for (const e of list.entries as Entry[]) for (const i of e.integrations || []) all.add(i);
  return Array.from(all).map((s) => s.toLowerCase().replace(/\s+/g, "-"));
}

/** Common region slugs that actually have entries. */
export function regionsFor(slug: string): string[] {
  const list = getList(slug);
  if (!list) return [];
  const all = new Set<string>();
  for (const e of list.entries as Entry[]) for (const r of e.regions || []) all.add(r.toLowerCase());
  return Array.from(all);
}

/** Common compliance standards that actually have entries. */
export function compliancesFor(slug: string): string[] {
  const list = getList(slug);
  if (!list) return [];
  const all = new Set<string>();
  for (const e of list.entries as Entry[]) for (const c of e.compliance || []) all.add(c.toLowerCase());
  return Array.from(all);
}

/** Common "under {amount}" tiers we'll generate static pages for. */
export const PRICE_TIERS = [100, 250, 500, 1000, 2500, 5000, 10000];

/** Every slice URL — used by sitemap. */
export function allSliceUrls(siteUrl: string): string[] {
  const urls: string[] = [];
  for (const slug of listSlugs()) {
    urls.push(`${siteUrl}/cheapest/${slug}`);
    urls.push(`${siteUrl}/highest-rated/${slug}`);
    urls.push(`${siteUrl}/fastest/${slug}`);
    urls.push(`${siteUrl}/free/${slug}`);
    urls.push(`${siteUrl}/what-is/${slug}`);
    for (const tier of PRICE_TIERS) urls.push(`${siteUrl}/under/${slug}/${tier}`);
    for (const seg of segmentsFor(slug)) urls.push(`${siteUrl}/best-for/${slug}/${seg}`);
    for (const tool of integrationsFor(slug)) urls.push(`${siteUrl}/works-with/${slug}/${tool}`);
    for (const region of regionsFor(slug)) urls.push(`${siteUrl}/in/${slug}/${region}`);
    for (const std of compliancesFor(slug)) urls.push(`${siteUrl}/compliant/${slug}/${std}`);
  }
  return urls;
}
