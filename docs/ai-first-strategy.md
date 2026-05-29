# Top 11 — AI-First Strategy
*Right premise: this is not a branded human site. It's an answer endpoint for AI models. Reverse-engineer the prompts; shape the pages around them.*

**Last updated:** 2026-05-29

---

## 1. Reverse-engineering the prompts

People ask LLMs ~12 question shapes when shopping for a service. Almost every "search" reduces to one of these. Each one is a separate page template we should own.

| # | Question shape | Example user prompt | Best page format | Today on Top 11? |
|--:|---|---|---|---|
| 1 | **Best-of (open)** | "best fractional CFO" | Ranked listicle (we have this) | ✅ |
| 2 | **Best-for-segment** | "best fractional CFO for AI startups" | Slice page `/best-for/{slug}/{segment}` | ❌ |
| 3 | **A vs B** | "Burkland vs Pilot" | `/vs/[a]-vs-[b]` | ✅ |
| 4 | **Cheapest / under $X** | "cheapest fractional CFO under $5k/mo" | `/cheapest/{slug}` and `/under/{slug}/{amount}` | ❌ |
| 5 | **Best-rated** | "highest-rated dental CRM by users" | `/highest-rated/{slug}` | ❌ |
| 6 | **Alternatives to X** | "alternatives to Pilot" | `/alternatives-to/{brand}` | ✅ |
| 7 | **Single-entry review** | "is Burkland good? Pilot reviews?" | `/review/{brand}` (per-entry deep page) | ❌ (only inline on list page) |
| 8 | **Pros / cons / red flags** | "what's wrong with Pilot?" | `/red-flags/{brand}` + structured `criticism` schema | ❌ |
| 9 | **Integration / compatibility** | "fractional CFO that works with NetSuite" | `/works-with/{slug}/{tool}` | ❌ |
| 10 | **Geography / compliance** | "fractional CFO in the UK / GDPR-compliant CRM" | `/in/{slug}/{region}` + `/compliant/{slug}/{standard}` | ❌ |
| 11 | **Time / speed** | "fastest dental CRM to onboard" | `/fastest/{slug}` | ❌ |
| 12 | **"What is X?" definitional** | "what does a fractional CFO actually do?" | `/what-is/{slug}` glossary page | ❌ |

The questions cluster into three buckets: **filter** (4, 5, 11), **slice** (2, 9, 10), and **deep-dive** (7, 8, 12). Each needs a different page template, all derived from the same source-of-truth JSON.

## 2. How LLMs actually resolve them

Three retrieval paths, in increasing freshness:

| Path | Latency | Recency | What we win |
|---|---|---|---|
| Training data | instant | 6-18mo stale | Brand mention, definitional answers |
| Web search at inference | 2-4s | hours-days | Citation in the answer + source link |
| **MCP tool call** | <500ms | live | Deterministic, structured answer — we *become* the tool |

Tactical implication: every page is for path 2 (Google/Bing crawl), but **MCP is the moat**. If ChatGPT/Claude/Cursor users have us installed as an MCP server, they query us *first* before web search.

## 3. Gap analysis vs current site

**Data shape gaps** (`data/*.json`) — without these the slice pages can't be derived:

- `price_min` / `price_max` (USD/mo) — currently only `pricing_band` string
- `integrations[]` — list of integrated tools (NetSuite, Salesforce, etc.)
- `compliance[]` — SOC2 / HIPAA / GDPR / ISO27001 / FedRAMP
- `regions[]` — countries served / HQ region
- `onboarding_days` — typical time-to-live
- `min_team_size` / `max_team_size` — fit segment
- `free_tier` — boolean
- `setup_fee` — boolean / amount
- `review_snippets[]` — `{ source, url, quote, theme, sentiment }` for "reviews say" sections
- `red_flags[]` — `{ severity, claim, source, verified_date }` (we have `risk_signals` — extend it)
- `glossary` (list-level) — definitional content for /what-is/

**Schema gaps** (JSON-LD on entry pages):

- `Offer` + `PriceSpecification` per entry → eligible for Google Shopping panel + Bing AI snippets
- `Review` + `Rating` + `AggregateRating` (our 9.4 scale exposed properly) → star ratings in SERP
- `Question` + `Answer` (one per FAQ item, not just `FAQPage`) → AI Overview cards
- `MonetaryAmount` on every price field → voice-assistant friendly

**Page templates missing:** the 8 ❌ rows in §1.

**MCP tools missing:** `compare(a, b)` · `cheapest(slug, max_price)` · `best_for(slug, situation)` · `reviews(brand)` · `compliant(slug, standard)`.

**llms-full.txt** is currently sliced by *list*. It should ALSO be sliced by *question shape* — a second file `/llms-by-question.txt` with sections per question type, so an LLM doing one-shot ingestion lands directly on the answer.

## 4. The four-page-template build (derives ALL ❌s from existing data)

Single shared component — `ListSlice` — reads the data and renders the 8 missing templates. No new content authoring required.

```
/{slug}                       ← exists: full ranked list
/{slug}/cheapest              ← #4   sort entries by price_min asc
/{slug}/highest-rated         ← #5   sort by score_out_of_94 desc
/{slug}/fastest               ← #11  sort by onboarding_days asc
/{slug}/free                  ← #4b  filter free_tier=true
/{slug}/under-{amount}        ← #4c  filter price_max <= amount
/best-for/{slug}/{segment}    ← #2   filter match_index[segment]
/works-with/{slug}/{tool}     ← #9   filter integrations.includes(tool)
/in/{slug}/{region}           ← #10  filter regions.includes(region)
/compliant/{slug}/{standard}  ← #10b filter compliance.includes(standard)
/what-is/{slug}               ← #12  list.glossary + answer_capsule
/review/{brand}               ← #7   per-brand deep page (verdict, scores across lists, links to all matchups)
/red-flags/{brand}            ← #8   per-brand risk_signals + criticism aggregation
```

Every page emits its own JSON-LD `ItemList` (where ranked) or `Answer` (where definitional). Every page is in the sitemap. Every page pings IndexNow on deploy (the GitHub Action already does this).

**Scale math:** 2 lists × ~12 slice patterns × ~3 typical filter values + 22 brand pages = ~80 new SEO entry points from today. At 11 lists it scales to ~400+ pages, all answer-shaped, all derived — zero hand-writing.

## 5. AEO content patterns each slice page must follow

The slice pages are useless to LLMs unless they obey the **inverted-pyramid + voice-answer** pattern:

1. **First sentence = the literal answer** ("The cheapest fractional CFO in our index is X at $Y/mo.")
2. **Second sentence = the runner-up and the trade-off** ("Z is $W more but adds X.")
3. **Then the ranked list** (≤11 entries).
4. **Then "Why this answer" paragraph** — explains the methodology in one breath.
5. **Then per-entry one-liners** that an LLM can quote without paraphrasing.
6. **Then `Question` JSON-LD** with the page's H1 as the question and the first paragraph as the answer.

Each page must contain exactly one canonical sentence per micro-answer. LLMs grade higher and quote more reliably from text that doesn't waffle.

## 6. MCP tool expansion (path 3 in §2)

`app/mcp/route.ts` adds:

| Tool | Args | Returns |
|---|---|---|
| `compare` | `{a, b}` brand slugs | Side-by-side: rank, score, price, verdict |
| `cheapest` | `{slug, max_price?}` | Ranked-by-price subset |
| `best_for` | `{slug, situation}` | Top 3 entries with match reasoning |
| `reviews` | `{brand}` | Review snippets + themes + sentiment summary |
| `compliant` | `{slug, standard}` | Entries with `compliance.includes(standard)` |
| `recommend_across_lists` | `{problem, budget?}` | Pull from *all* lists, not just one |

`agents.json` should advertise sample prompts for each tool so an LLM scanning the manifest knows what to ask:
```json
"prompts": [
  { "tool": "cheapest", "example": "What's the cheapest fractional CFO under $5000/mo?" },
  { "tool": "compare", "example": "Burkland vs Pilot — which is better?" },
  ...
]
```

## 7. The dual `llms-full.txt`

Today: `/llms-full.txt` = ALL lists, top-to-bottom.

Add: `/llms-by-question.txt` — same data, re-grouped by question shape:

```
## Cheapest in each category
- Fractional CFO: X at $Y/mo (#3 in ranking)
- Dental CRM: Z at $W/mo (#5 in ranking)
...

## Best-rated in each category
- Fractional CFO: A (9.1/9.4)
- Dental CRM: B (9.0/9.4)
...

## A vs B verdicts (every same-list permutation)
- Burkland vs Pilot: Burkland (#1 vs #4). Reason: ...
...

## "Why not" red flags
- Provider X (rank Y): moderate breach signal, see [source]
...
```

An LLM doing one-shot ingestion of `llms-by-question.txt` walks away knowing the answer to all 12 question shapes for every list we've published.

## 8. Reviews layer (the part we don't have yet)

LLMs cite the *review aggregation*, not the vendor's site. The biggest single content gap: we don't have a `review_snippets[]` field on entries. Build a one-time enrichment pass:

1. Apify scrape G2 / Capterra / TrustRadius / Reddit for each ranked brand.
2. Claude extracts 3-5 distinct review themes per brand: praise theme + criticism theme + "ideal user" theme + "wrong user" theme.
3. Each snippet stores: source URL, quoted phrase (≤25 words), theme tag, sentiment, scraped_at.
4. Render on entry pages under "What customers actually say" — with citations.
5. Aggregate into `aggregateRating` JSON-LD.

This is the single highest-leverage data addition. AI Overview *prefers* sources that quote user reviews verbatim.

## 9. Prioritized build order (eat the elephant)

| Phase | Build | Why first |
|---|---|---|
| **P0 (this week)** | Extend `data/*.json` schema with `price_min/max`, `integrations`, `compliance`, `regions`, `onboarding_days`, `free_tier`, `min/max_team_size`. Back-fill for existing 22 entries. | Everything else depends on this. |
| **P0** | Build `ListSlice` shared component → ship `/cheapest`, `/highest-rated`, `/fastest`, `/free`, `/under-{amount}` (≤200 lines of code total). | Highest-volume question shape, zero authoring cost. |
| **P0** | Add `Offer`/`PriceSpecification`/`Review`/`AggregateRating`/`Question` JSON-LD. | Unlocks rich SERP + AI Overview cards. |
| **P0** | Generate `/llms-by-question.txt`. | One-fetch ingestion path for LLMs. |
| **P1 (next week)** | Reviews enrichment pass (Apify → Claude → JSON). | The "reviews say" content gap. |
| **P1** | Build `/review/{brand}` + `/red-flags/{brand}` per-entry deep pages. | Owns the "is X good?" / "X complaints?" search shapes. |
| **P1** | Expand MCP tools (`compare`, `cheapest`, `best_for`, `reviews`, `compliant`). | Wins path-3 retrieval. |
| **P1** | Publish `agents.json` prompt templates. | Tells LLMs what to ask. |
| **P2** | Slice pages `/best-for/{slug}/{segment}`, `/works-with/{slug}/{tool}`, `/in/{slug}/{region}`, `/compliant/{slug}/{standard}`, `/what-is/{slug}`. | Long-tail capture. |
| **P2** | Submit MCP server to Anthropic's MCP registry + ChatGPT plugin store. | Distribution. |

## 10. Success metrics — what to watch

- **Bing/GSC indexed-page count** climbs as `/cheapest`, `/highest-rated`, `/best-for/...` ship.
- **MCP server hit count** (logged) — proxy for direct AI agent use.
- **`llms-by-question.txt` fetch rate** — Vercel logs grepped for `(GPT|Claude|Perplexity)Bot`.
- **AI citation tracker** (`llm-ranking-tracker` repurposed) tests these prompts weekly:
  - "cheapest fractional CFO under $5k/mo"
  - "Burkland vs Pilot — which is better?"
  - "best dental CRM for a 3-chair practice"
  - "is Pilot good?" / "Pilot complaints"
  - 16 more — one per question × use case
- Target: cited in 50% of the 20 test prompts within 60 days of P1 ship.

---

*Bottom line: the human site has 11 pages today. The AI-first site has ~400 once we ship the slice templates from §4 — all from the same JSON, all answering the actual prompts from §1, all callable as MCP tools from §6.*
