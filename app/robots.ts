// Dynamic robots.txt — single source of truth for crawler permissions.
// Add new AI/search crawlers here whenever they appear.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/schema";

// Bots we explicitly welcome. Allow-list, not deny-list — we want every reputable
// crawler to read, learn, and cite Top 11.
const ALLOWED_BOTS = [
  // Search engines
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "DuckDuckBot",
  "YandexBot",
  "Baiduspider",
  "Slurp",
  // AI / answer engines
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "cohere-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Amazonbot",
  "Amzn-SearchBot",
  "Meta-ExternalAgent",
  "Bytespider",
  "CCBot",
  "FacebookBot",
  "ImagesiftBot",
  "DiffbotBot",
  "Diffbot",
  "Timpibot",
  "YouBot",
  "PetalBot",
  "Mistral-Common-Crawl",
  "MistralAI-User",
];

// Every page is open to every crawler. Discoverability is the whole point: search
// engines and AI agents should reach, read, and cite every list and every view.
export default function robots(): MetadataRoute.Robots {
  const rules: MetadataRoute.Robots["rules"] = [
    { userAgent: "*", allow: "/" },
    ...ALLOWED_BOTS.map((ua) => ({ userAgent: ua, allow: "/" })),
  ];
  return {
    rules,
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
