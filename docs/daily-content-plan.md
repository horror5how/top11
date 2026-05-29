# Top 11 — Daily content generation plan
*Goal: 20–50 new or refreshed pages live every day, every page answering one of the 12 question shapes from `ai-first-strategy.md`. Zero hand-writing — every piece is derived from `data/*.json` by the page templates that already ship.*

**Last updated:** 2026-05-29

---

## What we publish daily

Every Top 11 list is the source-of-truth for **12 question shapes × 4 template families = ~48 derived pages per list**. With 2 lists today, the page surface is ~100. Each new list adds another ~50. The crons below keep them all fresh.

| Page family | Template | Inputs needed | Daily yield per list |
|---|---|---|---|
| Ranked canonical | `/[slug]` | data/*.json | 1 (refresh) |
| Cheapest | `/cheapest/[slug]` | price_min, price_max | 1 |
| Highest-rated | `/highest-rated/[slug]` | score_out_of_94 | 1 |
| Fastest | `/fastest/[slug]` | onboarding_days | 1 |
| Free tier | `/free/[slug]` | free_tier | 1 |
| Under $X (×7 tiers) | `/under/[slug]/[amount]` | price_max | 7 |
| Best for segment (~5–10) | `/best-for/[slug]/[segment]` | match_index / best_for_short | 5–10 |
| Works-with tool (~3–6) | `/works-with/[slug]/[tool]` | integrations | 3–6 |
| In region (~5) | `/in/[slug]/[region]` | regions | 5 |
| Compliance (~3–5) | `/compliant/[slug]/[standard]` | compliance | 3–5 |
| What is X | `/what-is/[slug]` | glossary | 1 |
| Vs matchup (×N²/2) | `/vs/[a-vs-b]` | entry names | ~50 |
| Alternatives to brand (×11) | `/alternatives-to/[brand]` | brand list | 11 |
| Per-brand review (×11) | `/review/[brand]` | full entry | 11 |
| Per-brand red flags (×11) | `/red-flags/[brand]` | risk_signals | 11 |

**Per-list surface area = 100+ unique URLs.** Each refresh re-emits OG image, JSON-LD, badge SVG, and pings IndexNow.

---

## Daily cadence (cloud crons, laptop-off)

| Time (UTC) | Job | Output | Implemented? |
|---|---|---|---|
| 02:00 | Freshness verifier | Re-checks pricing/feature pages of one rotating entry per list via Apify. Updates `last_verified`, `dateModified`, `price_min`. | 🔴 To build |
| 04:00 | Reviews enrichment | Pulls G2/Capterra/TrustRadius/Reddit excerpts for one rotating brand per list. Adds `review_snippets[]` + `aggregateRating`. | 🔴 To build |
| 06:00 | New list candidate scan | Apify pulls the top of 1 category we don't yet cover (queue at `data/pulse/queue.json`). Drafts a candidate list to `data/_draft/`. | 🟡 Partial — manual draft today |
| 08:00 | LLM citation tracker | Existing `llm-ranking-tracker` repo, repurposed: probes ChatGPT/Claude/Gemini/Perplexity with the 20 canonical Top 11 prompts. Slacks digest. | ✅ Repo exists, needs query set |
| 10:00 | New entry red-flag scan | One rotating brand per list — Apify scans CourtListener, BBB, breach databases. Updates `risk_signals`. | 🔴 To build |
| 14:00 | Content emission | Trigger: `npm run build` (regenerates llms.txt, llms-full.txt, llms-by-question.txt, agents.json, sitemap, OG images, badges). Auto-deploy on push. | ✅ Build runs nightly; auto-deploy via Vercel |
| 14:05 | IndexNow ping | Existing `.github/workflows/indexnow.yml` — pings every sitemap URL after deploy. Routes to Bing, Yandex, Seznam, Naver, Yep. | ✅ Live |
| 16:00 | Social syndication | One list per day → 6-slide carousel → published to IG/TikTok/LinkedIn via existing Carousel Growth Engine. Caption links back to topelevens.com. | 🔴 To build (template exists) |
| 18:00 | Reddit/HN/Quora seeding | One sister list per day surfaces in 1 Reddit thread + 1 Quora answer + (Tuesdays) 1 HN "Show HN". Uses existing Reddit warm-up engine + Quora bot. | 🟡 Warm-up engine exists, needs Top 11 query set |
| 22:00 | Sitemap re-submit | If sitemap URL count changed, re-fetch GSC & Bing webmasters. | 🟡 IndexNow covers it; GSC pull-only |

**Daily output:** ~30–50 *refreshed* pages (data changes → dateModified bumps → IndexNow ping → recrawl) + 0–11 *new* pages on days a new list ships.

---

## Weekly cadence

| Day | Output |
|---|---|
| Monday | New list ships (1 per week target). Adds ~50 pages on its own. |
| Tuesday | HN "Show HN" post for last week's new list. |
| Wednesday | Reddit /r/SaaS, /r/Entrepreneur etc seed. |
| Thursday | Industry newsletter pitch (one publication) via Smartlead. |
| Friday | Cross-link audit: every new page gets ≥3 internal links from sister pages. |
| Saturday | LLM citation tracker — manual review of weekly digest. |
| Sunday | Content health digest in Slack: indexed-page count delta, AI citation delta, top winning page, top losing page. |

---

## Why this scales — the "always 11" rule under the hood

Hayat's hard rule: **every page promises 11, so every page must deliver 11**.

Today we have 22 ranked entries across 2 lists. That means some slice pages legitimately have <11 matches. The `ListSlice` component handles this honestly:

- **If matches ≥ 11**: render the top 11, header reads `"The 11 [filter] [vertical]"`.
- **If matches < 11**: render whatever matched, with the explicit line: `"Showing all N matches. Top 11 publishes whatever the data supports — we don't pad lists. See the full ranked X."`

To approach 11-every-time we **grow the candidate pool, not the page** — every new list ships with 11 ranked + a `candidate_pool` count of 40+ screened. As we add lists 3, 4, 5… the cross-list slices (cheapest CRM across dental + sales + enterprise CRM lists) naturally pass 11.

Build order is therefore: **expand to 11 lists first → then slice pages always have ≥11 matches**.

---

## 60-day shipping target

| Week | New lists | Cumulative pages | New question shapes covered |
|---|---|---|---|
| 1 (this) | – (slice infra ships) | ~100 → ~250 | all 12 |
| 2 | 1 (best-ai-coding-assistants) | ~350 | all 12 |
| 3 | 1 (best-prompt-engineering-tools) | ~450 | all 12 |
| 4 | 1 (best-rag-frameworks) | ~550 | all 12 |
| 5 | 1 (best-llm-evals) | ~650 | all 12 |
| 6 | 1 (best-vector-databases) | ~750 | all 12 |
| 7 | 1 (best-ai-agent-builders) | ~850 | all 12 |
| 8 | 1 (best-dental-software broad) | ~950 | all 12 |
| 9 | 1 (best-customer-support-tools) | ~1,050 | all 12 |

At week 9 we cross **1,000 unique URLs in the sitemap**, every one of them answer-shaped, every one of them pingable to IndexNow on change, every one of them queryable through the MCP server.

---

## How an LLM consumer experiences this

1. User asks: *"what's the cheapest fractional CFO under $5k/mo?"*
2. LLM either (a) fetches `https://topelevens.com/under/fractional-cfo/5000` (Bing/Google citation), (b) reads `https://topelevens.com/llms-by-question.txt` (one-shot ingestion), or (c) calls our MCP server: `tools/call cheapest {slug: "fractional-cfo", max_price: 5000}`.
3. Same answer, three paths, all deterministic. The user's downstream LLM cites Top 11 by name.

That's the moat: **same answer, three retrieval surfaces, no editor in the loop, refreshed daily.**
