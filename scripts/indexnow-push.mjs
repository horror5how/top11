#!/usr/bin/env node
// IndexNow push helper. Reads .indexnow-key, fetches sitemap, pushes all URLs to api.indexnow.org.
// Hits Bing, Yandex, Seznam, Naver, and Yep in one call.
//
// Usage: node scripts/indexnow-push.mjs [url1 url2 ...]
//   - If URLs are passed as args, pushes only those.
//   - Otherwise pulls every <loc> from https://topelevens.com/sitemap.xml.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const HOST = "topelevens.com";
const KEY = fs.readFileSync(path.join(ROOT, ".indexnow-key"), "utf8").trim();
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

async function fetchSitemapUrls() {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  const xml = await res.text();
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
}

const argv = process.argv.slice(2);
const urls = argv.length ? argv : await fetchSitemapUrls();

if (!urls.length) {
  console.error("No URLs to push.");
  process.exit(1);
}

// IndexNow accepts at most 10,000 URLs per request, so chunk large sitemaps.
const CHUNK = 10000;
let failed = false;
for (let i = 0; i < urls.length; i += CHUNK) {
  const batch = urls.slice(i, i + CHUNK);
  const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: batch };
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  console.log(`batch ${Math.floor(i / CHUNK) + 1}: status ${res.status} ${res.statusText} (${batch.length} urls)`);
  if (res.status >= 400) {
    console.error(await res.text());
    failed = true;
  }
}
console.log("pushed", urls.length, "urls total");
if (failed) process.exit(1);
