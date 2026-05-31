#!/usr/bin/env node
// Wayback bulk save — fire-and-forget every URL in the sitemap to web.archive.org/save/
// with rate limiting (3.5/sec sustained = ~4 min per 1000 URLs in optimistic case;
// realistically Wayback 429s frequently, so we retry once with backoff).
//
// Designed to run in the background:
//   nohup node scripts/wayback-bulk-save.mjs > /tmp/wayback-bulk.log 2>&1 &

const SITE = "https://topelevens.com";
const SITEMAP = `${SITE}/sitemap.xml`;
const UA = "Mozilla/5.0 (Top11 audit) AppleWebKit/537.36";
const DELAY_MS = 280;
const RETRY_DELAY_MS = 8000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchSitemap() {
  const r = await fetch(SITEMAP, { headers: { "User-Agent": UA } });
  const xml = await r.text();
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
}

async function saveOne(url) {
  try {
    const r = await fetch(`https://web.archive.org/save/${url}`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(15000),
    });
    return r.status;
  } catch (e) {
    return e.name === "TimeoutError" ? "timeout" : `err:${(e.message || "").slice(0, 30)}`;
  }
}

const urls = await fetchSitemap();
console.log(`[${new Date().toISOString()}] Wayback bulk save starting: ${urls.length} URLs`);
const counts = {};
let done = 0;
for (const url of urls) {
  const status = await saveOne(url);
  counts[status] = (counts[status] || 0) + 1;
  done++;
  if (done % 25 === 0) {
    console.log(`[${new Date().toISOString()}] ${done}/${urls.length} · counts: ${JSON.stringify(counts)}`);
  }
  // If we're rate-limited, back off
  if (status === 429 || status === 503 || status === "timeout") {
    await sleep(RETRY_DELAY_MS);
  } else {
    await sleep(DELAY_MS);
  }
}
console.log(`[${new Date().toISOString()}] DONE — final counts: ${JSON.stringify(counts)}`);
