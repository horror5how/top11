// Trustpilot ingestion via Apify CLI.
import { apifyCall, cacheKey, readCache, writeCache, truncate } from "./lib.mjs";

const ACTORS = ["nikita-sviridenko/trustpilot-reviews-scraper", "apify/trustpilot-scraper", "epctex/trustpilot-scraper"];

export async function fetchTrustpilotFor(entry, opts = {}) {
  const key = cacheKey(["trustpilot", entry.domain]);
  const cached = readCache(key, opts.ttlHours ?? 24);
  if (cached && !opts.force) return cached;

  const targetUrl = `https://www.trustpilot.com/review/${entry.trustpilot || entry.domain}`;
  let raw = null;
  let lastErr = null;
  for (const actor of ACTORS) {
    const input = {
      companyUrls: [{ url: targetUrl }],
      startUrls: [{ url: targetUrl }],
      urls: [targetUrl],
      maxReviews: 40,
      maxItems: 40,
      reviewsPerPage: 20,
    };
    const res = apifyCall(actor, input, { timeout: 120000 });
    if (res.ok && res.items.length) {
      raw = res.items;
      break;
    }
    lastErr = res.error;
  }

  if (!raw) {
    const result = { source: "trustpilot", entry: entry.name, count: 0, error: lastErr || "no actor returned data", reviews: [] };
    writeCache(key, result);
    return result;
  }

  const reviews = raw.map((r) => ({
    rating: Number(r.rating || r.stars || 0),
    title: truncate(r.title || r.reviewTitle || "", 200),
    body: truncate(r.text || r.body || r.review || r.reviewBody || "", 800),
    author: truncate(r.consumerName || r.author || "", 80),
    date: r.experienceDate || r.publishedDate || r.dateCreated || null,
    url: r.url || r.reviewUrl || targetUrl,
  })).filter((r) => r.body);

  const ratings = reviews.map((r) => r.rating).filter((n) => n > 0);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  const result = {
    source: "trustpilot",
    entry: entry.name,
    profile_url: targetUrl,
    count: reviews.length,
    average_rating: avg ? +avg.toFixed(2) : null,
    reviews,
  };
  writeCache(key, result);
  return result;
}
