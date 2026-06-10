// Internal-link mesh for each list. Turns the ~4,000 question/slice pages
// (which previously existed ONLY in the sitemap) into links reachable in ONE hop
// from the high-priority list page — the fix for "Discovered, currently not indexed".
//
// Pure, build-time only: derived entirely from the source-of-truth list JSON.

import { getList } from "@/lib/lists";
import { brandSlug } from "@/lib/matchups";

// Vertical clusters — used to cross-link sibling lists so orphaned pages get
// a crawl path from every indexed peer page (not just the home page).
const VERTICAL_CLUSTERS: string[][] = [
  [
    "fractional-cfo", "cfo-ai-operators", "cfo-fundraise-readiness",
    "cfo-ip-patent-strategists", "fractional-csuite-deep-tech", "saas-bookkeeping",
    "fractional-cmo", "fractional-coo", "fractional-cto",
  ],
  [
    "ai-coding-assistants", "ai-agent-builders", "ai-observability-platforms",
    "llm-evaluation-platforms", "prompt-engineering-tools", "rag-frameworks",
    "vector-databases",
  ],
  [
    "ai-meeting-assistants", "ai-sales-tools", "ai-customer-support",
    "video-conferencing-software", "webinar-software",
  ],
  // Industry CRM & vertical SaaS cluster
  [
    "dental-crm", "legal-crm", "real-estate-crm",
    "sales-crm-software", "customer-success-software",
    "property-management-software", "telehealth-platforms",
  ],
  // HR & workforce cluster
  [
    "smb-payroll", "smb-hris", "no-code-platforms",
    "construction-project-management", "hr-software-small-business",
    "applicant-tracking-systems", "employee-scheduling-software",
    "freelance-platforms",
  ],
  // Marketing & growth cluster
  [
    "email-marketing-software", "social-media-scheduling-tools",
    "seo-tools", "landing-page-builder", "automation-platforms",
    "marketing-automation-software", "webinar-software", "proposal-software",
    "seo-rank-trackers", "seo-tools-saas", "product-analytics-tools",
    "online-course-platforms",
  ],
  // SMB core software cluster
  [
    "accounting-software-small-business", "small-business-crm",
    "customer-support-software", "cybersecurity-software-smb",
    "project-management-software", "task-management-software",
    "knowledge-base-software", "document-management-software",
    "help-desk-software", "live-chat-software",
    "project-management-agencies", "business-intelligence-tools",
    "password-managers-business", "vpn-for-business",
  ],
  // Finance & compliance cluster
  [
    "cap-table-software", "treasury-management-startups",
    "compliance-automation", "time-tracking-software",
    "expense-management-software", "contract-management-software",
    "esignature-software", "ap-automation", "expense-management",
    "subscription-billing-software", "tax-software-small-business",
  ],
  // Commerce & infrastructure cluster
  [
    "ecommerce-platform", "web-hosting-small-business",
    "managed-wordpress-hosting", "cloud-storage-business",
    "appointment-scheduling-software", "headless-cms",
    "inventory-management-software", "payment-gateways",
    "shopify-apps-conversion",
  ],
];

function peerSlugs(slug: string): string[] {
  const cluster = VERTICAL_CLUSTERS.find((g) => g.includes(slug));
  if (!cluster) return [];
  return cluster.filter((s) => s !== slug).slice(0, 5);
}
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

  // Cross-list peer links — creates crawl paths from indexed pages to sibling lists
  const peers = peerSlugs(slug);
  if (peers.length) {
    const peerLinks = peers
      .map((s) => getList(s))
      .filter((l): l is NonNullable<ReturnType<typeof getList>> => l != null)
      .map((l) => ({ href: `/${l.slug}`, label: l.title }));
    if (peerLinks.length) {
      groups.push({ title: "More rankings in this category", links: peerLinks });
    }
  }

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
