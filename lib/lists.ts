import fractionalCfo from "@/data/fractional-cfo.json";
import { SITE_URL } from "@/lib/schema";

export type ListData = typeof fractionalCfo;
type AnyEntry = Record<string, unknown>;

// Registry of every published list. Add new lists here (and a data/<slug>.json).
const REGISTRY: Record<string, ListData> = {
  [fractionalCfo.slug]: fractionalCfo as ListData,
};

export function listSlugs(): string[] {
  return Object.keys(REGISTRY);
}
export function getList(slug: string): ListData | null {
  return REGISTRY[slug] ?? null;
}

export function listIndex() {
  return {
    _meta: {
      schema: "top11-index-v1",
      self: `${SITE_URL}/api/lists`,
      openapi: `${SITE_URL}/openapi.json`,
      mcp: `${SITE_URL}/mcp`,
      generated_at: new Date().toISOString(),
    },
    count: listSlugs().length,
    lists: listSlugs().map((slug) => {
      const l = REGISTRY[slug];
      return {
        slug,
        title: l.title,
        vertical: l.vertical,
        human_page: `${SITE_URL}/${slug}`,
        api: `${SITE_URL}/api/lists/${slug}`,
        last_verified: l.last_verified,
        items: l.entries.length,
      };
    }),
  };
}

export function listEnvelope(l: ListData) {
  return {
    _meta: {
      schema: "top11-list-v1",
      self: `${SITE_URL}/api/lists/${l.slug}`,
      human_page: `${SITE_URL}/${l.slug}`,
      markdown: `${SITE_URL}/api/lists/${l.slug}/md`,
      csv: `${SITE_URL}/api/lists/${l.slug}/csv`,
      llms_full: `${SITE_URL}/llms-full.txt`,
      openapi: `${SITE_URL}/openapi.json`,
      mcp: `${SITE_URL}/mcp`,
      license: "https://creativecommons.org/licenses/by/4.0/",
      generated_at: new Date().toISOString(),
    },
    ...l,
    entries: l.entries.map((e) => ({
      ...e,
      _entry_api: `${SITE_URL}/api/lists/${l.slug}/${e.rank}`,
      _anchor: `${SITE_URL}/${l.slug}#rank-${e.rank}`,
    })),
  };
}

export function entryEnvelope(l: ListData, rank: number) {
  const e = l.entries.find((x) => x.rank === rank);
  if (!e) return null;
  return {
    _meta: {
      schema: "top11-entry-v1",
      self: `${SITE_URL}/api/lists/${l.slug}/${rank}`,
      list: `${SITE_URL}/api/lists/${l.slug}`,
      anchor: `${SITE_URL}/${l.slug}#rank-${rank}`,
    },
    slug: l.slug,
    list_title: l.title,
    ...e,
  };
}

export function toCsv(l: ListData): string {
  const cols = ["rank", "name", "url", "score_out_of_94", "best_for", "pricing_band", "hq", "founded", "team_size_band", "is_wildcard"];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [cols.join(",")];
  for (const e of l.entries) rows.push(cols.map((c) => esc((e as AnyEntry)[c])).join(","));
  return rows.join("\n") + "\n";
}

export function toMarkdown(l: ListData): string {
  const md: string[] = [];
  md.push(`# ${l.title}`);
  md.push("");
  if ((l as AnyEntry).answer_capsule) md.push(`> ${(l as AnyEntry).answer_capsule}`);
  md.push("");
  md.push(`- URL: ${SITE_URL}/${l.slug}`);
  md.push(`- Last verified: ${l.last_verified}`);
  md.push(`- Methodology: ${SITE_URL}/methodology`);
  md.push(`- JSON: ${SITE_URL}/api/lists/${l.slug} · CSV: ${SITE_URL}/api/lists/${l.slug}/csv`);
  md.push("");
  md.push("## Ranking");
  md.push("");
  for (const e of l.entries) {
    const wild = (e as AnyEntry).is_wildcard ? " [WILDCARD]" : "";
    md.push(`### #${e.rank}${wild} — ${e.name} — ${e.score_out_of_94}/9.4`);
    md.push(`- Best for: ${e.best_for}`);
    md.push(`- ${e.hq} · founded ${e.founded} · ${e.pricing_band}`);
    md.push(`- ${e.verdict}`);
    md.push(`- Pro: ${e.praise}`);
    md.push(`- Con: ${e.criticism}`);
    md.push("");
  }
  const faqs = (l as AnyEntry).faqs as { q: string; a: string }[] | undefined;
  if (faqs?.length) {
    md.push("## FAQ");
    md.push("");
    for (const f of faqs) {
      md.push(`**${f.q}**`);
      md.push("");
      md.push(f.a);
      md.push("");
    }
  }
  return md.join("\n") + "\n";
}
