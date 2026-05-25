import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/schema";
import { getList, listSlugs } from "@/lib/lists";

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
    { url: `${SITE_URL}/methodology`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/for-agents`, lastModified: siteMod, changeFrequency: "monthly", priority: 0.8 },
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

  return pages;
}
