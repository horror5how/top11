import type { MetadataRoute } from "next";
import data from "@/data/fractional-cfo.json";
import { SITE_URL } from "@/lib/schema";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date(data.last_verified);
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/${data.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/for-agents`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
