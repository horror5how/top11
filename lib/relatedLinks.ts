// Internal-link mesh for each list. Turns the ~4,000 question/slice pages
// (which previously existed ONLY in the sitemap) into links reachable in ONE hop
// from the high-priority list page — the fix for "Discovered, currently not indexed".
//
// Pure, build-time only: derived entirely from the source-of-truth list JSON.

import { getList } from "@/lib/lists";
import { brandSlug } from "@/lib/matchups";
import {
  segmentsFor,
  integrationsFor,
  regionsFor,
  compliancesFor,
  PRICE_TIERS,
} from "@/lib/slices";

export type LinkItem = { href: string; label: string };
export type LinkGroup = { title: string; links: LinkItem[] };

function humanize(s: string): string {
  const t = s.replace(/-/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** All internal question/slice links for a list, grouped by question shape. */
export function relatedLinksFor(slug: string): LinkGroup[] {
  const list = getList(slug);
  if (!list) return [];

  const groups: LinkGroup[] = [];
  const entries = list.entries.slice().sort((a, b) => a.rank - b.rank);

  // Ranking views (always present, one per list)
  groups.push({
    title: "More ways to rank these",
    links: [
      { href: `/highest-rated/${slug}`, label: "Highest rated" },
      { href: `/cheapest/${slug}`, label: "Cheapest" },
      { href: `/fastest/${slug}`, label: "Fastest to onboard" },
      { href: `/free/${slug}`, label: "Free options" },
      { href: `/what-is/${slug}`, label: "What is it" },
    ],
  });

  // By budget
  groups.push({
    title: "By budget",
    links: PRICE_TIERS.map((t) => ({ href: `/under/${slug}/${t}`, label: `Under $${t.toLocaleString()}` })),
  });

  // By segment / use case
  const segs = segmentsFor(slug);
  if (segs.length) {
    groups.push({ title: "Best for", links: segs.map((s) => ({ href: `/best-for/${slug}/${s}`, label: humanize(s) })) });
  }

  // By integration
  const tools = integrationsFor(slug);
  if (tools.length) {
    groups.push({ title: "Works with", links: tools.map((t) => ({ href: `/works-with/${slug}/${t}`, label: humanize(t) })) });
  }

  // By region
  const regions = regionsFor(slug);
  if (regions.length) {
    groups.push({ title: "By region", links: regions.map((r) => ({ href: `/in/${slug}/${r}`, label: r.toUpperCase() })) });
  }

  // By compliance
  const comps = compliancesFor(slug);
  if (comps.length) {
    groups.push({ title: "Compliance", links: comps.map((c) => ({ href: `/compliant/${slug}/${c}`, label: c.toUpperCase() })) });
  }

  // Per-entry: reviews, alternatives, red flags
  groups.push({ title: "Reviews", links: entries.map((e) => ({ href: `/review/${brandSlug(e.name)}`, label: `${e.name} review` })) });
  groups.push({ title: "Alternatives", links: entries.map((e) => ({ href: `/alternatives-to/${brandSlug(e.name)}`, label: `Alternatives to ${e.name}` })) });
  groups.push({ title: "Red flags", links: entries.map((e) => ({ href: `/red-flags/${brandSlug(e.name)}`, label: `${e.name} red flags` })) });

  // Head-to-head matchups (every pair that shares this list)
  const vs: LinkItem[] = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      vs.push({
        href: `/vs/${brandSlug(entries[i].name)}-vs-${brandSlug(entries[j].name)}`,
        label: `${entries[i].name} vs ${entries[j].name}`,
      });
    }
  }
  if (vs.length) groups.push({ title: "Head-to-head", links: vs });

  return groups.filter((g) => g.links.length > 0);
}
