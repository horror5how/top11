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

// Thin, combinatorial slice pages: re-sorts (cheapest/fastest/free/highest-rated) and
// single-filter permutations (under price, works-with tool, in region, compliant standard)
// of a list. Blocked from crawling so crawl budget concentrates on the 74 ranked lists and
// their comparison pages. The lists, API, MCP server, and llms.txt stay fully open.
const DISALLOW_THIN = [
  "/cheapest/",
  "/highest-rated/",
  "/fastest/",
  "/free/",
  "/under/",
  "/works-with/",
  "/in/",
  "/compliant/",
];

export default function robots(): MetadataRoute.Robots {
  const rules: MetadataRoute.Robots["rules"] = [
    { userAgent: "*", allow: "/", disallow: DISALLOW_THIN },
    ...ALLOWED_BOTS.map((ua) => ({ userAgent: ua, allow: "/", disallow: DISALLOW_THIN })),
  ];
  return {
    rules,
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
