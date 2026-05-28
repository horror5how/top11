import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/schema";
import { getList, listSlugs } from "@/lib/lists";
import { allBrandSlugs, allMatchupSlugs } from "@/lib/matchups";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = listSlugs();
  const newest = slugs
    .map((s) => getList(s)?.last_verified)
    .filter(Boolean)
    .sort()
    .pop();
  const siteMod = newest ? new Date(newest) : new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: siteMod, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/directory`, lastModified: siteMod, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/methodology`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/for-agents`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: siteMod, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: siteMod, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/authors/hayat-amin`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/api/lists`, lastModified: siteMod, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/openapi.json`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/llms-full.txt`, lastModified: siteMod, changeFrequency: "weekly", priority: 0.5 },
  ];

  for (const slug of slugs) {
    const l = getList(slug);
    const mod = l ? new Date(l.last_verified) : siteMod;
    pages.push({ url: `${SITE_URL}/${slug}`, lastModified: mod, changeFrequency: "monthly", priority: 0.9 });
    pages.push({ url: `${SITE_URL}/api/lists/${slug}`, lastModified: mod, changeFrequency: "monthly", priority: 0.6 });
  }

  for (const brand of allBrandSlugs()) {
    pages.push({ url: `${SITE_URL}/alternatives-to/${brand}`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.7 });
  }

  for (const matchup of allMatchupSlugs()) {
    pages.push({ url: `${SITE_URL}/vs/${matchup}`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.6 });
  }

  return pages;
}
