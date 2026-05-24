import data from "@/data/fractional-cfo.json";

type Entry = (typeof data)["entries"][number];

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://top11.vercel.app";
export const SITE_NAME = "Top 11";
export const SITE_TAGLINE = "Independent ranked lists. Verified humans. Verified AI agents.";

export function listJsonLd(slug: string, title: string, entries: Entry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": title,
    "url": `${SITE_URL}/${slug}`,
    "numberOfItems": entries.length,
    "itemListElement": entries.map((e) => ({
      "@type": "ListItem",
      "position": e.rank,
      "item": {
        "@type": "Service",
        "name": e.name,
        "url": e.url,
        "provider": { "@type": "Organization", "name": e.name, "url": e.url },
        "areaServed": e.hq,
        "review": {
          "@type": "Review",
          "author": { "@type": "Organization", "name": "Top 11 Editorial", "url": SITE_URL },
          "reviewRating": { "@type": "Rating", "ratingValue": e.score_out_of_94, "bestRating": 9.4, "worstRating": 0 },
          "reviewBody": e.verdict,
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": e.score_out_of_94,
          "bestRating": 9.4,
          "worstRating": 0,
          "ratingCount": 1,
        },
      },
    })),
  };
}

export function articleJsonLd(slug: string, title: string, subtitle: string, published: string, modified: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": subtitle,
    "datePublished": published,
    "dateModified": modified,
    "author": {
      "@type": "Organization",
      "name": "Top 11 Editorial",
      "url": SITE_URL,
    },
    "publisher": { "@type": "Organization", "name": "Top 11", "url": SITE_URL },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/${slug}` },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Top 11",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "description": SITE_TAGLINE,
  };
}
