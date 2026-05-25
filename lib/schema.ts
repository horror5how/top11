import data from "@/data/fractional-cfo.json";

type Entry = (typeof data)["entries"][number];
type ListData = typeof data;

// Single source of truth for the canonical, reachable production domain.
// Override at build time with NEXT_PUBLIC_SITE_URL once a custom domain is connected.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://top11-nine.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "Top 11";
export const SITE_TAGLINE = "Independent ranked lists. Verified humans. Verified AI agents.";
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const BEST_RATING = 9.4;

/** "$$$ (typically $5k–$25k/mo)" -> "$$$" */
export function priceSymbol(band: string): string {
  return (band.match(/^\$+/) || ["$$"])[0];
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    description:
      "Top 11 is an independent publisher of ranked lists. Each list names exactly 11 providers — ten ranked plus one wildcard — scored against a public methodology. No provider can pay to be listed.",
    knowsAbout: ["independent rankings", "fractional CFO services", "B2B service comparison", "answer engine optimization"],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

/** One ranked entry -> a Service/ProfessionalService node with editorial Review (no AggregateRating). */
function entryNode(list: ListData, e: Entry) {
  const isWild = "is_wildcard" in e && (e as { is_wildcard?: boolean }).is_wildcard;
  const entryId = `${SITE_URL}/${list.slug}#rank-${e.rank}`;
  return {
    "@type": ["ProfessionalService", "Service"],
    "@id": entryId,
    name: e.name,
    url: e.url,
    description: e.verdict,
    serviceType: list.vertical,
    priceRange: priceSymbol(e.pricing_band),
    ...(e.hq ? { areaServed: { "@type": "Place", name: e.hq } } : {}),
    ...(e.founded ? { foundingDate: String(e.founded) } : {}),
    provider: {
      "@type": "Organization",
      "@id": `${entryId}-org`,
      name: e.name,
      url: e.url,
      sameAs: [e.url],
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Best for", value: e.best_for },
      ...(e.hq ? [{ "@type": "PropertyValue", name: "Region", value: e.hq }] : []),
      ...(e.team_size_band ? [{ "@type": "PropertyValue", name: "Team size", value: e.team_size_band }] : []),
      { "@type": "PropertyValue", name: "Pricing", value: e.pricing_band },
      ...(isWild ? [{ "@type": "PropertyValue", name: "Designation", value: "Wildcard (#11)" }] : []),
    ],
    review: {
      "@type": "Review",
      "@id": `${entryId}-review`,
      author: { "@id": ORG_ID },
      datePublished: list.published,
      dateModified: list.last_verified,
      name: `Top 11 editorial review — ${e.name} (rank #${e.rank})`,
      reviewBody: e.verdict,
      positiveNotes: { "@type": "ItemList", itemListElement: [{ "@type": "ListItem", position: 1, name: e.praise }] },
      negativeNotes: { "@type": "ItemList", itemListElement: [{ "@type": "ListItem", position: 1, name: e.criticism }] },
      reviewRating: {
        "@type": "Rating",
        ratingValue: e.score_out_of_94,
        bestRating: BEST_RATING,
        worstRating: 0,
      },
    },
  };
}

/** Primary page graph: CollectionPage + ItemList + DefinedTermSet methodology, fully @id'd. */
export function listJsonLd(d: ListData = data) {
  const pageId = `${SITE_URL}/${d.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": ["CollectionPage", "WebPage"],
    "@id": pageId,
    url: pageId,
    name: d.title,
    description: d.subtitle,
    datePublished: d.published,
    dateModified: d.last_verified,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    lastReviewed: d.last_verified,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: d.title, item: pageId },
      ],
    },
    about: {
      "@type": "DefinedTermSet",
      "@id": `${SITE_URL}/methodology#criteria`,
      name: "Top 11 scoring criteria",
      url: `${SITE_URL}/methodology`,
      hasDefinedTerm: (d.methodology?.criteria || []).map((c) => ({
        "@type": "DefinedTerm",
        name: c.name,
        description: `${c.description} (weight: ${c.weight}%)`,
      })),
    },
    mainEntity: {
      "@type": "ItemList",
      "@id": `${pageId}#list`,
      name: d.title,
      description: d.subtitle,
      url: pageId,
      numberOfItems: d.entries.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: d.entries.map((e) => ({
        "@type": "ListItem",
        position: e.rank,
        url: `${pageId}#rank-${e.rank}`,
        item: entryNode(d, e),
      })),
    },
  };
}

/** Dataset block so the ranking is discoverable as queryable data (Google Dataset Search + agents). */
export function datasetJsonLd(d: ListData = data) {
  const pageId = `${SITE_URL}/${d.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${pageId}#dataset`,
    name: `${d.title} — dataset`,
    description: `Machine-readable dataset of ${d.title}. ${d.entries.length} ranked providers scored on a ${BEST_RATING}-point methodology. Updated when scores change.`,
    url: pageId,
    creator: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    datePublished: d.published,
    dateModified: d.last_verified,
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
    inLanguage: "en",
    keywords: [d.vertical, "rankings", "independent comparison", d.slug],
    measurementTechnique: "Editorial scoring against a public weighted methodology",
    distribution: [
      { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${SITE_URL}/api/lists/${d.slug}` },
      { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${SITE_URL}/api/lists/${d.slug}/csv` },
      { "@type": "DataDownload", encodingFormat: "text/markdown", contentUrl: `${SITE_URL}/api/lists/${d.slug}/md` },
    ],
  };
}

/** FAQPage from the data's faqs[]. Every Q&A must also be visible on the page. */
export function faqJsonLd(d: ListData = data) {
  const faqs = d.faqs || [];
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/${d.slug}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Article schema for the editorial nature of the page. */
export function articleJsonLd(d: ListData = data) {
  const pageId = `${SITE_URL}/${d.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${pageId}#article`,
    headline: d.title,
    description: d.subtitle,
    datePublished: d.published,
    dateModified: d.last_verified,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: pageId,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    about: d.vertical,
  };
}

/** DefinedTermSet for the methodology page itself. */
export function methodologyJsonLd(d: ListData = data) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${SITE_URL}/methodology#criteria`,
    name: "Top 11 scoring methodology",
    url: `${SITE_URL}/methodology`,
    inDefinedTermSet: `${SITE_URL}/methodology`,
    publisher: { "@id": ORG_ID },
    hasDefinedTerm: (d.methodology?.criteria || []).map((c) => ({
      "@type": "DefinedTerm",
      name: c.name,
      description: `${c.description} Weight: ${c.weight}%.`,
    })),
  };
}
