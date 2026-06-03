#!/usr/bin/env node
/**
 * CEO of Top Eleven — daily organic-growth loop.
 *
 * North star: 1,000 organic views/day on topelevens.com.
 * Each run: measures GSC traffic + index health, forces a sitemap re-read,
 * flags priority pages Google hasn't indexed, and prints a report (+ Slack if configured).
 *
 * Auth: service account indexing-bot@be-indexing-2 (siteFullUser on sc-domain:topelevens.com).
 *   - GitHub Actions: set secret GCP_SA_KEY = full JSON key.
 *   - Local: reads ~/Documents/beyond-elevation/.gcp-indexing-key.json (or GCP_SA_KEY_FILE).
 * Optional: SLACK_WEBHOOK for a one-line daily ping.
 */
import crypto from "node:crypto";
import fs from "node:fs";

const PROP = "sc-domain:topelevens.com";
const SITE = "https://topelevens.com";
const SITEMAP = `${SITE}/sitemap.xml`;
const GOAL = 1000;

// Priority pages we most want indexed (money lists + a few high-intent question shapes).
const PRIORITY = [
  "/", "/fractional-cfo", "/cfo-ai-operators", "/cfo-fundraise-readiness",
  "/cfo-ip-patent-strategists", "/fractional-csuite-deep-tech", "/ai-coding-assistants",
  "/ai-agent-builders", "/dental-crm", "/legal-crm",
];

function loadKey() {
  if (process.env.GCP_SA_KEY) return JSON.parse(process.env.GCP_SA_KEY);
  const p = process.env.GCP_SA_KEY_FILE || `${process.env.HOME}/Documents/beyond-elevation/.gcp-indexing-key.json`;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
const b64u = (b) => Buffer.from(b).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
async function getToken(key, scope) {
  const now = Math.floor(Date.now() / 1000);
  const h = b64u(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const c = b64u(JSON.stringify({ iss: key.client_email, scope, aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now }));
  const sig = crypto.createSign("RSA-SHA256").update(`${h}.${c}`).sign(key.private_key);
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${h}.${c}.${b64u(sig)}` });
  const j = await r.json();
  if (!j.access_token) throw new Error("auth failed: " + JSON.stringify(j));
  return j.access_token;
}
const dayStr = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

async function sa(t, days, dimensions = []) {
  const body = { startDate: dayStr(days + 2), endDate: dayStr(2), dimensions, rowLimit: 25 };
  const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(PROP)}/searchAnalytics/query`, { method: "POST", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}
async function resubmitSitemap(t) {
  const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(PROP)}/sitemaps/${encodeURIComponent(SITEMAP)}`, { method: "PUT", headers: { Authorization: `Bearer ${t}` } });
  return r.status; // 204 = ok
}
async function inspect(t, url) {
  const r = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", { method: "POST", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" }, body: JSON.stringify({ inspectionUrl: SITE + (url === "/" ? "/" : url), siteUrl: PROP }) });
  const j = await r.json();
  return j?.inspectionResult?.indexStatusResult?.coverageState || "unknown";
}
const sum = (rows, k) => (rows || []).reduce((a, r) => a + (r[k] || 0), 0);

(async () => {
  const key = loadKey();
  const t = await getToken(key, "https://www.googleapis.com/auth/webmasters");

  // 1) Traffic
  const d28 = await sa(t, 28);
  const d7 = await sa(t, 7);
  const clicks28 = sum(d28.rows, "clicks"), impr28 = sum(d28.rows, "impressions");
  const clicks7 = sum(d7.rows, "clicks"), impr7 = sum(d7.rows, "impressions");
  const perDay = (clicks7 / 7).toFixed(1);
  const topQ = await sa(t, 28, ["query"]);
  const topP = await sa(t, 28, ["page"]);

  // 2) Force fresh sitemap read
  const smStatus = await resubmitSitemap(t);

  // 3) Index health on priority pages
  const idx = [];
  for (const u of PRIORITY) { try { idx.push([u, await inspect(t, u)]); } catch { idx.push([u, "ERR"]); } await new Promise((r) => setTimeout(r, 700)); }
  const indexed = idx.filter(([, s]) => /indexed/i.test(s) && !/not/i.test(s)).length;

  // 4) Report
  const L = [];
  L.push(`# Top Eleven — CEO daily report (${dayStr(0)})`);
  L.push(`Goal: ${GOAL} organic views/day.`);
  L.push(`Clicks/day (7d): ${perDay}  →  ${((perDay / GOAL) * 100).toFixed(1)}% of goal`);
  L.push(`7d:  clicks ${clicks7} | impressions ${impr7}`);
  L.push(`28d: clicks ${clicks28} | impressions ${impr28}`);
  L.push(`Priority pages indexed: ${indexed}/${PRIORITY.length}`);
  L.push(`Sitemap re-read: ${smStatus === 204 ? "OK" : "status " + smStatus}`);
  L.push(`\nTop queries (28d):`);
  (topQ.rows || []).slice(0, 10).forEach((r) => L.push(`  ${r.impressions}i ${r.clicks}c  ${r.keys[0]}`));
  L.push(`\nTop pages (28d):`);
  (topP.rows || []).slice(0, 10).forEach((r) => L.push(`  ${r.impressions}i ${r.clicks}c  ${r.keys[0].replace(SITE, "")}`));
  L.push(`\nPriority index status:`);
  idx.forEach(([u, s]) => L.push(`  ${s.padEnd(34)} ${u}`));
  const report = L.join("\n");
  console.log(report);

  // 5) Slack one-liner
  if (process.env.SLACK_WEBHOOK) {
    const msg = `🐴 Top Eleven: ${perDay} clicks/day (${((perDay / GOAL) * 100).toFixed(1)}% of 1k goal) · ${impr7} impr/7d · ${indexed}/${PRIORITY.length} priority indexed`;
    try { await fetch(process.env.SLACK_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: msg }) }); } catch {}
  }
})().catch((e) => { console.error("CEO daily failed:", e.message); process.exit(1); });
