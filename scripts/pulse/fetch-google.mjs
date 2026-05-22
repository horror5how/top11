// Google reviews ingestion via Apify CLI — compass/Google-Maps-Reviews-Scraper.
import { apifyCall, cacheKey, readCache, writeCache, truncate } from "./lib.mjs";

const ACTORS = ["compass/Google-Maps-Reviews-Scraper", "compass/google-maps-reviews-scraper", "compass/crawler-google-places"];

export async function fetchGoogleFor(entry, opts = {}) {
  const key = cacheKey(["google", entry.domain]);
  const cached = readCache(key, opts.ttlHours ?? 24);
  if (cached && !opts.force) return cached;

  let raw = null;
  let lastErr = null;
  for (const actor of ACTORS) {
    const input = {
      searchStringsArray: [entry.google_search || entry.name],
      maxReviews: 25,
      reviewsSort: "newest",
      language: "en",
      maxPlacesPerSearch: 1,
      maxCrawledPlacesPerSearch: 1,
      includeWebResults: false,
    };
    const res = apifyCall(actor, input, { timeout: 180000 });
    if (res.ok && res.items.length) {
      raw = res.items;
      break;
    }
    lastErr = res.error;
  }

  if (!raw) {
    const result = { source: "google", entry: entry.name, count: 0, error: lastErr || "no actor returned data", reviews: [] };
    writeCache(key, result);
    return result;
  }

  const place = raw[0] || {};
  const reviews = (place.reviews || raw).slice(0, 40).map((r) => ({
    rating: Number(r.stars || r.rating || 0),
    body: truncate(r.text || r.review || "", 800),
    author: truncate(r.name || r.author || "", 80),
    date: r.publishedAtDate || r.publishAt || r.date || null,
    url: r.reviewUrl || place.url || null,
  })).filter((r) => r.body);

  const result = {
    source: "google",
    entry: entry.name,
    place_name: truncate(place.title || place.name || "", 200),
    place_url: place.url || null,
    average_rating: place.totalScore || place.rating || null,
    total_reviews: place.reviewsCount || reviews.length,
    count: reviews.length,
    reviews,
  };
  writeCache(key, result);
  return result;
}
