// Facebook reviews ingestion via Apify CLI — apify/facebook-pages-scraper or apify/facebook-reviews-scraper.
import { apifyCall, cacheKey, readCache, writeCache, truncate } from "./lib.mjs";

const ACTORS = ["apify/facebook-reviews-scraper", "apify/facebook-pages-scraper"];

export async function fetchFacebookFor(entry, opts = {}) {
  if (!entry.facebook) {
    return { source: "facebook", entry: entry.name, count: 0, reviews: [], skipped: "no facebook handle in source map" };
  }
  const key = cacheKey(["facebook", entry.facebook]);
  const cached = readCache(key, opts.ttlHours ?? 24);
  if (cached && !opts.force) return cached;

  const pageUrl = `https://www.facebook.com/${entry.facebook}/reviews/`;
  let raw = null;
  let lastErr = null;
  for (const actor of ACTORS) {
    const input = {
      startUrls: [{ url: pageUrl }],
      urls: [pageUrl],
      maxReviews: 25,
      maxItems: 25,
    };
    const res = apifyCall(actor, input, { timeout: 120000 });
    if (res.ok && res.items.length) {
      raw = res.items;
      break;
    }
    lastErr = res.error;
  }

  if (!raw) {
    const result = { source: "facebook", entry: entry.name, count: 0, error: lastErr || "no actor returned data", reviews: [] };
    writeCache(key, result);
    return result;
  }

  const reviews = raw.map((r) => ({
    rating: r.isRecommended === false ? 2 : r.isRecommended === true ? 5 : Number(r.stars || r.rating || 0),
    body: truncate(r.text || r.review || r.recommendationText || "", 800),
    author: truncate(r.userName || r.author || "", 80),
    date: r.date || r.time || null,
    url: r.url || pageUrl,
  })).filter((r) => r.body);

  const result = { source: "facebook", entry: entry.name, profile_url: pageUrl, count: reviews.length, reviews };
  writeCache(key, result);
  return result;
}
