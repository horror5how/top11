#!/usr/bin/env node
// Syndicate a developer-relevant Top 11 list to Dev.to (DA ~90) with a canonical link
// back to topelevens.com. Deterministic — builds markdown straight from the list JSON, so
// it needs no LLM and is unaffected by Anthropic credit. Logs posts to rotate, never repeat.
//
// Usage: DEVTO_API_KEY=... node scripts/syndicate-devto.mjs [slug]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE = "https://topelevens.com";
const KEY = process.env.DEVTO_API_KEY;
if (!KEY) { console.error("DEVTO_API_KEY missing"); process.exit(1); }

// Lists that genuinely resonate with the Dev.to audience (no CFO/dental content here).
const DEV_LISTS = [
  "ai-coding-assistants", "ai-agent-builders", "vector-databases", "rag-frameworks",
  "llm-evaluation-platforms", "prompt-engineering-tools", "ai-observability-platforms",
  "no-code-platforms", "headless-cms", "ai-meeting-assistants",
];
const TAGS = {
  "ai-coding-assistants": ["ai", "programming", "productivity", "tools"],
  "ai-agent-builders": ["ai", "agents", "tools", "programming"],
  "vector-databases": ["ai", "database", "machinelearning", "tools"],
  "rag-frameworks": ["ai", "machinelearning", "tools", "programming"],
  "llm-evaluation-platforms": ["ai", "machinelearning", "tools", "testing"],
  "prompt-engineering-tools": ["ai", "tools", "productivity", "programming"],
  "ai-observability-platforms": ["ai", "devops", "monitoring", "tools"],
  "no-code-platforms": ["nocode", "tools", "productivity", "webdev"],
  "headless-cms": ["webdev", "cms", "javascript", "tools"],
  "ai-meeting-assistants": ["ai", "productivity", "tools"],
};

const logPath = path.join(ROOT, "data", "syndication", "devto-log.json");
fs.mkdirSync(path.dirname(logPath), { recursive: true });
const log = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, "utf8")) : [];
const posted = new Set(log.map((e) => e.slug));

const exists = (s) => fs.existsSync(path.join(ROOT, "data", `${s}.json`));
let slug = process.argv[2];
if (!slug) slug = DEV_LISTS.find((s) => !posted.has(s) && exists(s)); // first unposted
if (!slug) { // everything posted at least once — refresh the least-recently-posted (true rotation, daily-safe)
  const last = {};
  for (const e of log) if (DEV_LISTS.includes(e.slug) && e.date > (last[e.slug] || "")) last[e.slug] = e.date;
  const ordered = DEV_LISTS.filter(exists).sort((a, b) => (last[a] || "").localeCompare(last[b] || ""));
  slug = ordered[0];
}
if (!slug || !exists(slug)) { console.error("No dev-relevant list available to syndicate."); process.exit(1); }

const list = JSON.parse(fs.readFileSync(path.join(ROOT, "data", `${slug}.json`), "utf8"));
const url = `${SITE}/${slug}`;
const entries = list.entries.slice().sort((a, b) => a.rank - b.rank);

let md = `${list.answer_capsule || list.subtitle}\n\n`;
md += `> This is a syndicated copy. The independent, always-updating ranking lives at **[${url}](${url})**, scored on a [public methodology](${SITE}/methodology) with no paid placement.\n\n`;
md += `## The ranking\n\n| # | Tool | Best for | Score |\n|---|------|----------|-------|\n`;
for (const e of entries) {
  md += `| ${e.rank}${e.is_wildcard ? " (wildcard)" : ""} | [${e.name}](${e.url}) | ${e.best_for_short || ""} | ${e.score_out_of_94 != null ? e.score_out_of_94.toFixed(1) : ""}/9.4 |\n`;
}
md += `\n## Quick verdicts\n\n`;
for (const e of entries.slice(0, 6)) md += `**${e.rank}. ${e.name}** — ${e.verdict_short}\n\n`;
md += `\nFull breakdown, pricing, risk signals, and head-to-head comparisons: **[${url}](${url})**.\n`;

const article = {
  article: {
    title: list.title,
    body_markdown: md,
    published: true,
    canonical_url: url,
    description: (list.subtitle || "").slice(0, 150),
    tags: TAGS[slug] || ["ai", "tools", "productivity"],
  },
};

const res = await fetch("https://dev.to/api/articles", {
  method: "POST",
  headers: { "api-key": KEY, "Content-Type": "application/json" },
  body: JSON.stringify(article),
});
const j = await res.json().catch(() => ({}));
if (res.status >= 400) { console.error("Dev.to error", res.status, JSON.stringify(j).slice(0, 400)); process.exit(1); }

console.log("Published:", j.url, "| canonical:", url);
log.push({ slug, date: new Date().toISOString().slice(0, 10), devto_url: j.url });
fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
