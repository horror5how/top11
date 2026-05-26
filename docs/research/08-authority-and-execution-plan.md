# Wondermous — Fast-Authority Plan + Execution PRD
*2026-05-26 · builds on docs 01–07. Honest, no hype.*

## Part 0 — The honest premise
Crawling is already solved (robots allows all 18 AI bots, sitemap, IndexNow, llms.txt, MCP, clean SSR HTML). **The bottleneck is not crawling — it is being CITED and TRUSTED over Reddit/G2.** There is no instant-authority hack. The genuinely fast path is three moves:
1. **Own the long tail** with breadth of structured niche lists (low competition; AI cites positions 21–100 at 200–400% the rate Google does — doc 02).
2. **Seed presence in the sources LLMs already trust** (Reddit, Wikipedia/Wikidata, backlinks, MCP/agent directories) — honestly, never sock-puppets.
3. **Be the most machine-attributable source** (structured + dated + independent + per-claim provenance + API/MCP) so you win the citation the moment you are found, because you did the LLM's extraction work for it.

## Part 1 — Beating stale info / the "shortcut" (strategy answer)
**Why an LLM would crawl us instead of re-summarising Reddit:** Reddit is unstructured, undated, contradictory, hard to attribute. G2/Capterra/Gartner are pay-to-play and refresh ~annually. If we give the same consensus but **structured, scored, date-stamped, with cons + pricing + risk, and machine-queryable**, the LLM's job is easier and its answer is cleanly attributable → it prefers us *when it knows we exist*.

1. **What to add:** per-entry *verified-freshness* stamps ("pricing verified May 2026"); a *"what changed"* feed at real-change granularity (price/acquisition/breach/support — NOT minute-by-minute); structured *risk signals*; explicit *independence* statement; per-claim *provenance/citations*; the *agent API + MCP* (built).
2. **Frameworks (the AEO stack):** schema.org JSON-LD — `ItemList`, `Dataset`, `Review`, `FAQPage`, `DefinedTermSet`, `ClaimReview`, plus `ownershipFundingInfo` + `publishingPrinciples` (transparency signals Google/AI weight); **MCP** (+ list in MCP registries); **llms.txt/llms-full.txt**; **IndexNow** (Bing/Perplexity re-crawl in hours); **OpenAPI 3.1**; **RSS/Atom**; **Google Dataset Search** (via Dataset schema); GSC + Bing Webmaster; Perplexity publisher program.
3. **What data:** structured, dated, attributable rankings with cons/pricing/risk/"best for [segment]" — the things Reddit is NOT (structured) and G2 is NOT (independent + fresh).

## Part 2 — Fast authority-building plan (phased)
- **Phase 1 — technical authority (week 1):** verify GSC + Bing Webmaster, submit sitemap, ship `Dataset` schema → Google Dataset Search, IndexNow on every change, build the brand **entity** (Organization `sameAs`, Wikidata item, Crunchbase/LinkedIn/X), list the **MCP server in public MCP registries/directories** (agent devs discover servers there — highest-leverage, lowest-effort distribution).
- **Phase 2 — breadth (weeks 1–4):** ship 20–50 genuinely useful niche lists (quality-gated programmatic) to own long-tail queries with little competing source coverage. Each = full structured data + recommend support.
- **Phase 3 — off-site seeding (ongoing, honest):** answer real Reddit/forum/Quora questions helpfully and cite the relevant Wondermous list only where genuinely useful; pitch niche newsletters/blogs for backlinks; submit to AI-tool/agent directories; partner with agent frameworks.
- **Phase 4 — credibility assets:** publish methodology + an annual "State of [niche]" data report (linkable, citable as a data source) → earns backlinks + PR.
- **Phase 5 — measure:** reuse the existing `llm-ranking-tracker` to track AI citations; watch GSC impressions + MCP call volume.

## Part 3 — Execution PRD: the 5 winnable problems (sequenced)
1. **Agent-queryable recommendation** — STATUS: built (`/api/lists/{slug}/recommend` + MCP `recommend`). NEXT: list MCP in registries; add budget/segment/constraint filters; surface prominently on `/for-agents` + homepage.
2. **Independence vs pay-to-play** — BUILD NOW: `independence` data block + `ownershipFundingInfo`/`publishingPrinciples` JSON-LD + a visible "Independent · no paid placement · no affiliate links — unlike pay-to-play directories" trust strip on every list + homepage.
3. **Verified freshness** — BUILD NOW: `freshness` data block (cadence + what we verify + last_verified) + visible freshness strip + IndexNow on change + a quarterly re-verify cron.
4. **Structured risk signals** — BUILD (needs real research): per-entry `risk_signals` field (breaches, lawsuits, billing/hidden-fee complaints, support-rating trend) populated from real sources WITH citations; honest "No major public risk signals as of [date]" default where none verified; surface as a Risk row + JSON-LD + a recommend factor. Requires a research routine — never fabricate.
5. **Long-tail "best for [exact situation]"** — STATUS: built (`segment_tags`, `problems_solved`, situations section, `recommend`). NEXT: expand segments; ensure each maps to a `query_intent`.

**Build order:** THIS PASS → #2 + #3 (independence + verified-freshness trust layer). Then #4 (risk-signals research + build), #1 (MCP registry + filters), #5 (expansion) + Phase 1/2 authority.
