import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/schema";
import { getList, listSlugs } from "@/lib/lists";

// Sitemap is intentionally lean: only canonical list pages + core static pages.
// For a young domain, concentrating crawl budget on ~100 money pages gets them
// indexed faster than spreading it across 13k+ thin slice/brand/vs pages.
// Thin pages (vs/, review/, red-flags/, cheapest/, etc.) are noindex via
// X-Robots-Tag headers in next.config.js — they remain accessible to users
// but don't compete for crawl budget until the domain matures.
export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = listSlugs();
  const newest = slugs
    .map((s) => getList(s)?.last_verified)
    .filter(Boolean)
    .sort()
    .pop();
  const siteMod = newest ? new Date(newest) : new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: siteMod, changeFrequency: "weekly", priority: 1.0, images: [`${SITE_URL}/opengraph-image`] },
    { url: `${SITE_URL}/directory`, lastModified: siteMod, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/methodology`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/for-agents`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: siteMod, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: siteMod, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/authors/hayat-amin`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.6 },
  ];

  for (const slug of slugs) {
    const l = getList(slug);
    const mod = l ? new Date(l.last_verified) : siteMod;
    pages.push({
      url: `${SITE_URL}/${slug}`,
      lastModified: mod,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [`${SITE_URL}/${slug}/opengraph-image`],
    });
  }

  return pages;
}
