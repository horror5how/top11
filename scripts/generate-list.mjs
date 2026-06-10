#!/usr/bin/env node
// Autonomous list generator. Pulls the head of data/_queue/niches.json, calls Claude API to
// produce a Top-11 ranked list for that niche, writes data/<slug>.json, registers in
// lib/lists.ts, runs enrich-data.mjs, and exits. Designed to be invoked by GH Actions cron.
//
// Usage: node scripts/generate-list.mjs                # pops the head of the queue
//        node scripts/generate-list.mjs <slug>         # generates a specific queued slug

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const QUEUE_PATH = path.join(ROOT, "data/_queue/niches.json");
const DATA_DIR = path.join(ROOT, "data");
const LISTS_TS = path.join(ROOT, "lib/lists.ts");

const TODAY = new Date().toISOString().slice(0, 10);

// Provider preference order — free Gemini first (per cost-discipline rule), Anthropic as fallback.
// Set LIST_GEN_PROVIDER=anthropic|gemini to force one.
const PROVIDER = process.env.LIST_GEN_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "anthropic");
// Anthropic fallback is a dead rail as of 2026-06 (API key has $0 credit; legacy model string kept on purpose).
// Gemini is the live primary — verified in GH run 27298245438 ("Provider: gemini").
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";

if (PROVIDER === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY required when LIST_GEN_PROVIDER=anthropic");
  process.exit(1);
}
if (PROVIDER === "gemini" && !process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY required when LIST_GEN_PROVIDER=gemini");
  process.exit(1);
}
console.log(`Provider: ${PROVIDER} (model: ${PROVIDER === "anthropic" ? ANTHROPIC_MODEL : GEMINI_MODEL})`);

async function callLLM(prompt) {
  if (PROVIDER === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 24000, responseMimeType: "application/json" },
    };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error(`Gemini returned no text: ${JSON.stringify(json).slice(0, 400)}`);
    return text;
  }
  // Anthropic fallback
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  const msg = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 16000,
    messages: [{ role: "user", content: prompt }],
  });
  return msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
}

function loadQueue() { return JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8")); }
function saveQueue(q) { fs.writeFileSync(QUEUE_PATH, JSON.stringify(q, null, 2) + "\n"); }

function pickNiche(slugArg) {
  const q = loadQueue();
  if (slugArg) {
    const idx = q.pending.findIndex((n) => n.slug === slugArg);
    if (idx < 0) throw new Error(`slug not in pending queue: ${slugArg}`);
    return { niche: q.pending[idx], remove: () => { q.pending.splice(idx, 1); saveQueue(q); } };
  }
  // Highest priority (lowest number) first; if tie, FIFO
  q.pending.sort((a, b) => (a.priority || 9) - (b.priority || 9));
  const head = q.pending[0];
  if (!head) throw new Error("queue empty");
  return { niche: head, remove: () => { q.pending.shift(); saveQueue(q); } };
}

const PROMPT_TEMPLATE = ({ slug, title, vertical, audience, candidate_pool_size }) => `
You are the autonomous editor of Top 11 (https://topelevens.com). Produce a JSON ranked list of the 11 best providers in this niche, in the exact schema we use across the site.

Niche: ${title}
Slug: ${slug}
Vertical: ${vertical}
Target audience: ${audience}
Candidate pool you screened (publicly known, real providers): ${candidate_pool_size} firms.

Hard requirements:
1. EVERY entry must be a real, currently operating provider with a real public website URL. Do NOT invent. If you genuinely don't know 11 real providers, return only the ones you know and set candidate_pool to a smaller number — never pad with fiction.
2. Output ONLY valid JSON matching the schema below — no prose, no markdown, no commentary outside the JSON.
3. The 11th entry must be a wildcard (is_wildcard: true) — a contrarian / emerging / hybrid pick that doesn't fit the dominant pattern but is worth flagging.
4. Methodology weights total 100 and reflect what readers in this niche actually care about (e.g., for AI tools weight "production-readiness" heavily; for dental software weight "HIPAA/regulatory fit" heavily). Pick 5-6 criteria.
5. Scores are out of 9.4. Spread between #1 and #5 must be ≤1.0 to keep the race real. Spread #1 → #11 ≈ 1.5-2.5.
6. Every entry needs price_min, price_max, currency, free_tier, integrations[], compliance[], regions[], onboarding_days, min_team_size, max_team_size — use null where genuinely unknown.
7. The editor of Top 11 (Hayat Amin) is NOT a candidate on this list. Set editor_disclosure to null.
8. answer_capsule must be a single literal-answer sentence quotable by an LLM (e.g., "The best X is Y, followed by Z and W.")
9. honest_disclosures must include any known biases (e.g., "Most candidates are US-based; international coverage is thin.")
10. faqs must answer the 4-5 People-Also-Ask questions a real buyer in this niche would Google.
11. Use the AEO inverted-pyramid: every entry's verdict starts with the direct answer to "why is this firm at this rank for this category?" Same rule for subtitle, guide answers, and faq answers: first sentence = the answer, context after.
12. ALL dates are ${TODAY}.
13. STYLE: zero em-dashes or en-dashes in any field. Use commas, periods, or parentheses instead.
14. Banned vocabulary (reads as AI filler): leverage, unlock, seamless, robust, comprehensive, dive into, elevate, landscape, game-changer, cutting-edge, holistic. Write like a sharp human operator briefing a buyer.
15. Every verdict, praise, and criticism must anchor to at least one specific: a number, a named product/feature/client type, or a timeframe. "Strong support" fails; "support answers in under 2 hours on the $299 tier" passes. No vague claims anywhere.

Schema (copy this shape exactly, fill in real values):

{
  "slug": "${slug}",
  "title": "${title}",
  "subtitle": "<one-sentence description of the angle>",
  "vertical": "${vertical}",
  "audience": "${audience}",
  "editor": {
    "name": "Top 11 Editorial",
    "credential": "Autonomous AI ranking engine — methodology v1.0 weights public",
    "url": "https://topelevens.com/methodology",
    "conflict_disclosure": "None. The editor of Top 11 is not a candidate on this list."
  },
  "published": "${TODAY}",
  "last_verified": "${TODAY}",
  "next_review": "<TODAY + 90 days, YYYY-MM-DD>",
  "methodology_version": "v1.0",
  "independence": {
    "paid_placement": false,
    "affiliate_links": false,
    "sponsored_entries": false,
    "statement": "Top 11 takes no payment from any provider on this list. Scores are computed from a public weighted rubric; methodology weights were locked before entry research began."
  },
  "editor_disclosure": null,
  "freshness": { "cadence": "quarterly", "statement": "Re-scored every 90 days." },
  "category": "<top-level category>",
  "subsector": "<sub-category>",
  "changelog": [{ "date": "${TODAY}", "text": "Initial publication. Methodology v1.0 weights ..." }],
  "answer_capsule": "<single literal-answer sentence>",
  "methodology": {
    "version": "v1.0",
    "updated": "${TODAY}",
    "candidate_pool": ${candidate_pool_size},
    "review_cadence": "quarterly",
    "score_cap": 9.4,
    "criteria": [ { "name": "...", "weight": 25, "description": "..." }, ... ]
  },
  "segment_tags": ["..."],
  "problem_tags": ["..."],
  "query_intents": ["..."],
  "match_index": { "1": { "solves": ["..."], "personas": ["..."] }, ... },
  "stats": { "candidate_pool": ${candidate_pool_size}, "ranked": 11, "average_score": <num>, "spread_top_to_bottom": <num> },
  "guide": [ { "q": "...", "a": "..." }, ... ],
  "how_to_choose": ["...", "..."],
  "faqs": [ { "q": "...", "a": "..." }, ... ],
  "honest_disclosures": ["..."],
  "glossary": { "term": "...", "definition": "...", "synonyms": ["..."], "faq": [] },
  "entries": [
    {
      "rank": 1, "name": "<real provider>", "url": "<real website url>",
      "founded": <year>, "hq": "<city, country>", "team_size_band": "<band>",
      "best_for": "<full sentence>", "best_for_short": "<≤8 words>",
      "pricing_band": "<e.g. $$ ($299 to $999/mo)>",
      "score_out_of_94": <8.0 to 9.4>,
      "score_breakdown": { "<criterion_key>": <0-9.4>, ... },
      "verdict": "<full sentence starting with the direct answer>",
      "verdict_short": "<≤20 words>",
      "praise": "<full sentence>", "praise_short": "<≤15 words>",
      "criticism": "<full sentence>", "criticism_short": "<≤15 words>",
      "sources_pending": ["<vendor docs>", "<g2 page>", "..."],
      "risk_signals": { "level": "none", "checked": "${TODAY}", "summary": "No material public risk signals as of ${TODAY}.", "signals": [] },
      "price_min": <num or null>, "price_max": <num or null>, "currency": "USD",
      "free_tier": <bool>, "setup_fee": <num or null>,
      "integrations": ["..."], "compliance": ["..."], "regions": ["..."],
      "onboarding_days": <num or null>, "min_team_size": <num or null>, "max_team_size": <num or null>
    },
    ... 10 more entries ...,
    { "rank": 11, "is_wildcard": true, ... }
  ]
}

Return ONLY the JSON object. No prose, no fences, no explanations.
`.trim();

async function generateList(niche) {
  console.log(`[${new Date().toISOString()}] Generating list for: ${niche.slug}`);
  const prompt = PROMPT_TEMPLATE(niche);
  let text = await callLLM(prompt);
  text = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const data = JSON.parse(text);
  // Sanity checks
  if (data.slug !== niche.slug) throw new Error(`generated slug ${data.slug} != requested ${niche.slug}`);
  if (!Array.isArray(data.entries) || data.entries.length < 5) throw new Error(`only ${data.entries?.length || 0} entries`);
  data.entries.forEach((e, i) => {
    if (!e.name || !e.url) throw new Error(`entry ${i} missing name/url`);
    if (!e.url.startsWith("http")) throw new Error(`entry ${e.name} has invalid url: ${e.url}`);
  });
  return data;
}

function writeData(data) {
  const p = path.join(DATA_DIR, `${data.slug}.json`);
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
  console.log(`Wrote ${p} (${data.entries.length} entries)`);
}

function registerInLists(slug) {
  const importName = slug.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const camel = importName.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  let src = fs.readFileSync(LISTS_TS, "utf8");
  if (src.includes(`@/data/${slug}.json`)) {
    console.log(`Already registered: ${slug}`);
    return;
  }
  // Inject import — after the last data import
  src = src.replace(
    /(import [a-zA-Z_]+ from "@\/data\/[^"]+\.json";\n)(?!import [a-zA-Z_]+ from "@\/data\/)/,
    `$1import ${camel} from "@/data/${slug}.json";\n`,
  );
  // Inject registry entry — before the closing brace of REGISTRY
  src = src.replace(
    /(\[[a-zA-Z]+\.slug\]: [a-zA-Z]+ as (?:unknown as )?ListData,)(\n\};)/,
    `$1\n  [${camel}.slug]: ${camel} as unknown as ListData,$2`,
  );
  fs.writeFileSync(LISTS_TS, src);
  console.log(`Registered ${camel} in lib/lists.ts`);
}

function runEnrich() {
  try {
    execSync("node scripts/enrich-data.mjs", { cwd: ROOT, stdio: "inherit" });
  } catch (e) {
    console.warn("enrich-data.mjs failed (non-fatal):", e.message);
  }
}

(async () => {
  const slugArg = process.argv[2];
  const { niche, remove } = pickNiche(slugArg);
  console.log(`Selected niche: ${niche.slug} — ${niche.title}`);
  try {
    const data = await generateList(niche);
    writeData(data);
    registerInLists(niche.slug);
    runEnrich();
    // Move from pending → completed
    const q = loadQueue();
    q.pending = q.pending.filter((n) => n.slug !== niche.slug);
    if (!q.completed.includes(niche.slug)) q.completed.push(niche.slug);
    saveQueue(q);
    console.log(`[${new Date().toISOString()}] DONE: ${niche.slug}`);
  } catch (e) {
    console.error(`FAILED ${niche.slug}: ${e.message}`);
    // Move to skipped so we don't loop
    const q = loadQueue();
    q.pending = q.pending.filter((n) => n.slug !== niche.slug);
    q.skipped.push({ slug: niche.slug, error: e.message, at: new Date().toISOString() });
    saveQueue(q);
    process.exit(1);
  }
})();
