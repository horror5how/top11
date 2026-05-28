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

const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls };
const res = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

console.log("status", res.status, res.statusText);
console.log("pushed", urls.length, "urls");
if (res.status >= 400) {
  console.error(await res.text());
  process.exit(1);
}
