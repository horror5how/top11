# topelevens.com — SEO + AEO + GEO Master Playbook
*Goal: rank top-3 on Google for "best [category]" listicle queries AND get cited by ChatGPT / Claude / Gemini / Perplexity in 60%+ of "what's the best [X]" prompts.*

**Site type:** AI-first ranking directory (Top 11 listicles). Currently 2 lists live (`/fractional-cfo`, `/dental-crm`) with `ItemList` semantics + `llms.txt` / `agents.json` / `openapi.json` surfaces.
**Owner:** Hayat Amin / Beyond Elevation
**Last updated:** 2026-05-28

Legend: ✅ done · 🔴 critical (this week) · 🟡 important (this month) · 🟢 ongoing · 🔵 listicle-specific edge

---

## 0. SCORECARD — WHAT WE WANT TO MOVE

| KPI | Today | 30 days | 90 days | How measured |
|---|---|---|---|---|
| Google indexed pages | 0 | 11 | 50+ | `site:topelevens.com` + GSC Coverage |
| Top-10 Google rankings | 0 | 5 | 25 | GSC + Ahrefs |
| AI Overview appearances | 0 | 2 | 10 | Manual SERP audit, ZipTie |
| ChatGPT citation share for "best [cat]" prompts | 0% | 20% | 50% | Otterly AI / Peec AI |
| Perplexity source rate | 0% | 30% | 60% | Perplexity manual probes |
| Backlinks (referring domains) | 1 | 10 | 50 | Ahrefs |
| `llms-full.txt` fetches/day | 0 | 50 | 500 | Vercel access logs grep `(GPTBot|ClaudeBot|PerplexityBot)` |
| Wikidata QID for "Top 11" | none | created | linked to authors | wikidata.org search |

---

## 1. ✅ ALREADY DONE (2026-05-28 setup)

- Domain `topelevens.com` connected to Vercel project `top11` (A `@ → 76.76.21.21`, CNAME `www → cname.vercel-dns.com`).
- HTTPS active, HTTP/2, edge cache.
- `NEXT_PUBLIC_SITE_URL=https://topelevens.com` flipped → all canonicals, OG tags, sitemap URLs, JSON-LD `@id`s now use new domain.
- `robots.txt` allows every AI crawler (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Googlebot, Google-Extended, Bingbot, Applebot, Applebot-Extended, Amazonbot, Amzn-SearchBot, Meta-ExternalAgent, Bytespider, CCBot).
- `Sitemap: https://topelevens.com/sitemap.xml` referenced in robots.
- `llms.txt`, `llms-full.txt`, `agents.json` already published.
- Google Search Console: Domain property `sc-domain:topelevens.com` verified via DNS TXT (`google-site-verification=FC8HZctH-XAuFiG4h75s89VEFrdJI7ChS7sjP3ogcuM`).
- Sitemap `https://topelevens.com/sitemap.xml` submitted to GSC.
- 6 HTML URLs (`/`, `/directory`, `/methodology`, `/for-agents`, `/fractional-cfo`, `/dental-crm`) → "Request indexing" submitted.

---

## 2. 🔴 CRITICAL — DO THIS WEEK

### 2.1 Search engine registrations (one-time)

| Engine | Action | URL | Verification |
|---|---|---|---|
| **Bing Webmaster Tools** | Add site + import from GSC | https://www.bing.com/webmasters | GSC import (1-click) |
| **Yandex Webmaster** | Add `topelevens.com`, submit sitemap | https://webmaster.yandex.com | DNS TXT or meta tag |
| **Baidu Ziyuan** | Add site (English UI exists) | https://ziyuan.baidu.com | File upload, DNS, or meta |
| **Naver Search Advisor** | Korean engine, ~30% of KR search | https://searchadvisor.naver.com | HTML file |
| **Seznam Webmaster** | Czech engine | https://search.seznam.cz/wmt | Meta tag |
| **DuckDuckGo** | Auto-includes once Bing has us | — (no signup) | Verify via DDG search after Bing index |
| **Brave Search** | Submit via search.brave.com results page → "Submit a site" | https://search.brave.com | None — open index, also pulls from web |
| **Kagi** | No webmaster tool; ensure backlinks from Kagi-trusted sources (HN, GitHub) | — | — |
| **You.com** | Crawls open web; verify via search after submission | https://you.com | None |

### 2.2 IndexNow (one API call = instant push to Bing, Yandex, Seznam, Naver, Yep)

```bash
# Generate a key file and host it at root
echo "topelevens-indexnow-2026-XXXX" > public/topelevens-indexnow-2026-XXXX.txt
# Push every URL change:
curl -X POST "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "topelevens.com",
    "key": "topelevens-indexnow-2026-XXXX",
    "keyLocation": "https://topelevens.com/topelevens-indexnow-2026-XXXX.txt",
    "urlList": [
      "https://topelevens.com/",
      "https://topelevens.com/directory",
      "https://topelevens.com/methodology",
      "https://topelevens.com/for-agents",
      "https://topelevens.com/fractional-cfo",
      "https://topelevens.com/dental-crm"
    ]
  }'
```
Wire this into the existing list-publish pipeline so every new `/best-X` page auto-pings IndexNow on deploy.

### 2.3 Schema.org / structured data (the single biggest AEO lever)

Required JSON-LD blocks per page type. Validate every change at https://search.google.com/test/rich-results AND https://validator.schema.org.

| Page | Required schema | Already present? |
|---|---|---|
| `/` (home) | `Organization` + `WebSite` (with `SearchAction`) + `ItemList` of featured lists | Partial — add `SearchAction` |
| `/directory` | `CollectionPage` + `ItemList` of all lists | Add |
| `/methodology` | `Article` + `Person` (Hayat) author + `publishingPrinciples` link | Add |
| `/for-agents` | `WebAPI` + `TechArticle` | Add |
| `/[slug]` (each list) | `ItemList` (numbered, each `ListItem` → `name`, `url`, `description`, `image`) + `Article` + `Person` author + `BreadcrumbList` + `FAQPage` (3-5 Q&A at bottom) + `DefinedTerm` for ranking criteria | Partial |
| `/api/lists/*` | `Dataset` (so Google Dataset Search indexes us — Google has dedicated Dataset Search at https://datasetsearch.research.google.com) | Add — huge differentiator |

**Critical missing schema right now: `Organization` block with `sameAs` graph.** This is what lets Google build the Knowledge Panel.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://topelevens.com/#organization",
  "name": "Top 11",
  "alternateName": ["TopElevens", "topelevens.com"],
  "url": "https://topelevens.com",
  "logo": "https://topelevens.com/logo.png",
  "description": "AI-first independent rankings — the top 11 in every category, refreshed continuously.",
  "founder": { "@id": "https://meethayat.com/#person" },
  "sameAs": [
    "https://www.linkedin.com/company/top11",
    "https://x.com/topelevens",
    "https://github.com/horror5how/top11",
    "https://www.crunchbase.com/organization/top-11",
    "https://www.producthunt.com/products/top-11",
    "https://www.wikidata.org/wiki/<Q-ID-when-created>"
  ]
}
```

### 2.4 On-page essentials (per page audit)

For every list page (`/[slug]`):

- [ ] `<title>` 50-60 chars, primary keyword first. Pattern: `Best [Category] in 2026 — Top 11 Ranked & Updated | Top 11`
- [ ] `<meta description>` 150-160 chars, mentions year + count + value prop + CTA
- [ ] Single `<h1>` matching the search query verbatim
- [ ] First paragraph = direct answer in ≤60 words ("The best [X] in 2026 is [winner], followed by …") — AEO inverted-pyramid pattern
- [ ] H2/H3 phrased as questions people Google ("What makes [tool] the best?", "How is this ranking decided?")
- [ ] **Numbered list** for the 11 entries (numbered lists win featured snippets 36% of the time vs paragraphs)
- [ ] **Comparison table** below the list — sortable columns (price, rating, use case). Tables = #1 cited content type for ChatGPT
- [ ] FAQPage section (3-5 Qs), each Q matches a `People Also Ask` query from `keywordtool.io` or Ahrefs
- [ ] "Last verified: [date]" visible AND in `dateModified` JSON-LD — recency is a top GEO ranking factor
- [ ] Inline citations to authoritative sources (link out to G2/Capterra/official docs) — Princeton GEO research shows citations = +40% AI visibility
- [ ] At least one specific statistic per entry with source link (Princeton: stats = +37%)
- [ ] Author byline + photo + credentials (E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness)

### 2.5 Open Graph + Twitter Cards (for social previews → backlinks → citations)

In `app/layout.tsx` / per-page metadata:
```ts
openGraph: {
  type: 'article',
  url: `https://topelevens.com/${slug}`,
  title: `Best ${category} in 2026 — Top 11`,
  description: '...',
  images: [{ url: `https://topelevens.com/og/${slug}.png`, width: 1200, height: 630 }],
  siteName: 'Top 11',
},
twitter: { card: 'summary_large_image', site: '@topelevens', creator: '@hayatamin' }
```
Generate per-list OG images via `@vercel/og` so every share has a unique branded card.

### 2.6 Performance (Core Web Vitals — Google ranking factor since 2021)

Target on PageSpeed Insights / CrUX:
- LCP < 2.5s · INP < 200ms · CLS < 0.1 · TTFB < 800ms
- Use `next/image` with `priority` flag on hero, AVIF + WebP fallbacks
- Inline above-fold CSS, lazy-load below-fold
- Preconnect to font/CDN origins in `<head>`

---

## 3. 🟡 IMPORTANT — DO THIS MONTH

### 3.1 Entity / knowledge-graph registrations

| Where | Why | What to do |
|---|---|---|
| **Wikidata** | 7.8% of all ChatGPT citations link to Wikipedia/Wikidata. Creating QID = mandatory for Knowledge Panel | Create QID for "Top 11" (the brand) and link to Hayat's existing QID `Q139785012`. Use https://www.wikidata.org/wiki/Special:NewItem |
| **Wikipedia** | Notability bar: 3+ independent significant coverage. Once we have press, create draft. | Save for month 2-3. Draft at `User:HayatAmin/Top_11`. |
| **Google Knowledge Panel** | After Wikidata + schema sameAs, Google may auto-build panel. Claim it via `g.co/kgpanel` once it appears | Watch for panel; when it shows, click "Claim this knowledge panel" |
| **Crunchbase** | High-DA, indexed by Bing → ChatGPT | Add Top 11 as a "Company" or "Product" |
| **Product Hunt** | Launch day = backlink + Reddit/HN tailwind | Schedule launch when 5+ lists live |
| **AlternativeTo** | Captures "Top 11 vs X" search intent | List Top 11 as alternative to existing ranking sites (G2, TrustRadius) |
| **OpenCorporates** | Free, auto-syndicates to many entity DBs | Add corporate entity if registered |
| **F6S, BetaList, Indie Hackers** | Founder-friendly DA8+ profiles | Submit |

### 3.2 LLM-targeted surfaces (GEO)

| Surface | Purpose | Status |
|---|---|---|
| `/llms.txt` | Anthropic-proposed concise overview for LLMs | ✅ exists — audit content monthly |
| `/llms-full.txt` | Full machine-readable corpus | ✅ exists — keep under 100K tokens |
| `/agents.json` | Agent capabilities manifest | ✅ exists |
| `/openapi.json` | API spec for agentic consumption | ✅ exists |
| `/mcp` | MCP (Model Context Protocol) endpoint for AI agents | Build — gives ChatGPT / Claude direct query access to lists |
| `/.well-known/ai-plugin.json` | ChatGPT Action manifest (legacy but still parsed) | Add |
| `/feed.xml` | RSS for entity-tracking tools | ✅ exists |

**Build the MCP server** at `/mcp` so Claude Desktop, ChatGPT, etc can query Top 11 directly — this turns the site into a *tool* AI agents can call, which means citations follow naturally.

### 3.3 Off-site authority — the citation network

Princeton GEO research: appearing on cited domains beats anything you do on your own site. Targets:

- **Reddit**: post each new list to /r/SaaS, /r/Entrepreneur, /r/smallbusiness, /r/dentistry (for the dental-crm list), etc. Comment-format, no spam. ⚠️ Reddit warm-up rule from memory — accounts need karma ≥250 before linking out.
- **Hacker News**: "Show HN: Top 11 — AI-curated rankings refreshed continuously" on a Tuesday/Wednesday morning EST.
- **Quora**: claim relevant topics ("best fractional CFO", "dental CRM"), answer with light reference to the list (no spam).
- **YouTube**: 60-sec Shorts walking through each list — YouTube transcripts are crawled by Google + cited heavily by Gemini.
- **Medium / Substack / Dev.to**: syndicate methodology posts with canonical link back. Memory rule `feedback_syndication_no_linkedin.md` — DO syndicate to Medium/Substack/Dev.to, NOT LinkedIn (Hayat manages LinkedIn manually).
- **G2 / Capterra**: get Top 11 listed as a "Review Site" or "Decision Tool" alternative — backlink + trusted-DA boost.
- **Industry roundups**: pitch to "best directory sites" listicles via Qwoted bot (already running 2x/day) and HARO / Help A B2B Writer.
- **GitHub**: open-source the methodology + entry-evaluation scripts under `horror5how/top11` (already on GH) — GitHub README is highly cited by Claude and Copilot.
- **Awesome lists**: PR Top 11 into `sindresorhus/awesome` and category-specific awesome lists.

### 3.4 Content velocity — listicle expansion

Each new `/best-[category]` page = a new entry point. Build out:
- /best-ai-coding-assistants
- /best-prompt-engineering-tools
- /best-fractional-cfo-firms-for-saas
- /best-vector-databases
- /best-rag-frameworks
- /best-llm-evals-platforms
- /best-ai-agent-builders
- /best-dental-software (broader than CRM)

Target ≥1 new list/week. Each list = `ItemList` schema, `Article` author byline, full Q&A, comparison table, FAQ block, last-verified date, citation links. Hand off generation to existing `answer_page_generator.py` pattern from meethayat.com (memory: `meethayat_page_generators.md`).

### 3.5 Internal linking + topical authority

- Every list page links to `/methodology` + `/for-agents` + 2-3 sister lists.
- `/directory` is the hub — group lists by vertical (AI Tools / Fintech / Healthcare / Marketing / etc).
- Breadcrumb: `Home › Directory › [Vertical] › [List]` — exposed in UI + `BreadcrumbList` JSON-LD.
- Anchor text: descriptive ("best fractional CFO firms") not "click here".

### 3.6 E-E-A-T signals

- Author bio page `/authors/hayat-amin` with `Person` schema + `sameAs` (LinkedIn, X, Crunchbase, Wikidata Q139785012, Wikipedia draft, Substack, Medium, Quora, GitHub).
- "About" page with company history, methodology, conflict-of-interest policy.
- "Contact" page with real email + phone (already in master.env — US +1 571 380 7699, UK +44 7476 383531).
- Privacy policy + terms of service (boilerplate is fine, but must exist).
- Visible "Last verified [date]" on every list — this is the recency signal LLMs use to prefer one source over another.

### 3.7 Bing/Microsoft-ecosystem boost (Copilot pulls from Bing)

- Verify Bing Webmaster Tools.
- Enable Microsoft Clarity (free analytics) on the site — gives Bing a behaviour signal.
- Cross-post methodology to LinkedIn Articles (Microsoft-owned) — but per memory rule `feedback_linkedin_profile.md`, leave Hayat's profile to him; this is about *organic content* posted by him manually, not auto-posting.
- Submit to https://www.bing.com/webmaster/help/submit-urls-0c1700a6 (URL submission API).

---

## 4. 🟢 ONGOING — MONTHLY / WEEKLY CADENCE

### 4.1 Monitoring

| Metric | Tool | Cadence |
|---|---|---|
| AI visibility per query | Otterly AI / Peec AI / ZipTie | Weekly |
| GSC impressions, clicks, CTR, avg position | Google Search Console | Weekly digest |
| Backlinks gained/lost | Ahrefs / Webmaster Tools | Weekly |
| Indexed page count | `site:topelevens.com` + GSC Coverage | Weekly |
| Core Web Vitals (real users) | GSC CrUX | Monthly |
| Broken links, redirect chains | Screaming Frog | Monthly |
| Schema validation errors | Rich Results Test (CI step) | Per deploy |
| `llms-full.txt` AI crawler hit rate | Vercel logs grep `User-Agent: (GPT|Claude|Perplexity)Bot` | Monthly |
| ChatGPT/Claude/Gemini citation probes | Manual 20-query test set, save to `data/llm-citations-YYYYMM.json` | Monthly |

### 4.2 Build the citation-tracker cron (cloud, laptop-off)

Adapt the existing `llm-ranking-tracker` repo (see memory: `Hayat LLM Ranking Pipeline`) to run on topelevens.com queries. ~50 prompts × 5 engines = 250 API calls/run, weekly. Auto-Slack the digest to Hayat (`D0B3MPYGLS3`).

### 4.3 Refresh cadence (the listicle moat)

The "AI-first, always updating" positioning ONLY works if:
- Every list updates `dateModified` whenever any entry changes
- A weekly cron re-checks every entry's pricing/feature status (use Claude + Apify)
- The "Last verified" badge on the page reflects actual reality, not a static date
- A `<!-- changelog -->` HTML comment block lists what changed (search engines + LLMs both parse this)

---

## 5. 🔵 LISTICLE-SPECIFIC EDGES (topelevens unique advantages)

### 5.1 Be the Wikipedia of rankings

- Citable methodology (live at `/methodology` — make this the most-linked-to URL on the site).
- Public data export (`/api/lists/[slug]`, `/api/lists/[slug]/csv`, `/api/lists/[slug]/md`) — already exists, surface it.
- `Dataset` schema on every `/api/lists/*` so we appear in Google Dataset Search.
- Open-source the ranking criteria on GitHub (`horror5how/top11`).

### 5.2 Win the "vs" and "alternative" queries

Build:
- `/vs/[brand-a]-vs-[brand-b]` comparison pages (sourced from list data).
- `/alternatives-to/[brand]` pages (sourced from "where does brand X rank across our lists").
These are highest-intent commercial queries and AI loves to cite comparison pages (Section 4 of the GEO research — comparison articles = ~33% of AI citations).

### 5.3 Embeddable widgets → free backlinks

Create a "Top 11 in [X]" embed widget (iframe / JS snippet) — vendors who rank #1-3 will gladly embed it on their site, every embed = a backlink. Memory: this is the strategy that built G2's authority.

### 5.4 Refreshed-monthly badges

For #1 entries in each list, generate a "Ranked #1 in Top 11 — May 2026" SVG badge they can embed (links back with UTM). Free authority transfer.

### 5.5 AI agent integrations

- MCP server at `/mcp` so Claude Desktop users can query lists.
- ChatGPT Action manifest at `/.well-known/ai-plugin.json`.
- Anthropic skill that wraps topelevens.com queries (`top11.SKILL.md`).
- Pitch to OpenAI / Anthropic / Google for inclusion in their "trusted source" allowlists.

---

## 6. REGISTRATION TICKLIST (paste-and-go URLs)

| # | Where | URL | Done? |
|--:|---|---|:--:|
| 1 | Google Search Console | https://search.google.com/search-console | ✅ |
| 2 | Bing Webmaster Tools | https://www.bing.com/webmasters | ☐ |
| 3 | Yandex Webmaster | https://webmaster.yandex.com | ☐ |
| 4 | Baidu Ziyuan | https://ziyuan.baidu.com | ☐ |
| 5 | Naver Search Advisor | https://searchadvisor.naver.com | ☐ |
| 6 | Seznam Webmaster (CZ) | https://search.seznam.cz/wmt | ☐ |
| 7 | IndexNow key publish | self-host `/topelevens-indexnow-*.txt` | ☐ |
| 8 | Cloudflare Crawler Hints | (only if proxying through CF) | n/a |
| 9 | Wikidata QID for "Top 11" | https://www.wikidata.org/wiki/Special:NewItem | ☐ |
| 10 | Crunchbase company | https://www.crunchbase.com/add-new | ☐ |
| 11 | Product Hunt | https://www.producthunt.com/posts/new | ☐ |
| 12 | AlternativeTo | https://alternativeto.net/manage/software/ | ☐ |
| 13 | F6S | https://www.f6s.com | ☐ |
| 14 | BetaList | https://betalist.com/submit | ☐ |
| 15 | Indie Hackers product | https://www.indiehackers.com/products | ☐ |
| 16 | GitHub Awesome lists (PRs) | github search `topic:awesome` | ☐ |
| 17 | OpenAI ChatGPT plugin/Action manifest | `/.well-known/ai-plugin.json` | ☐ |
| 18 | Anthropic MCP registry | https://github.com/modelcontextprotocol/registry | ☐ |
| 19 | Microsoft Clarity (Bing signal) | https://clarity.microsoft.com | ☐ |
| 20 | Google Analytics 4 | https://analytics.google.com | ☐ |
| 21 | Google Dataset Search ping | (auto once Dataset schema lives) | ☐ |
| 22 | archive.org Wayback | https://web.archive.org/save/https://topelevens.com | ☐ |
| 23 | Common Crawl seed list | https://commoncrawl.org/contact-us | ☐ |
| 24 | LinkedIn company page → website field | (Hayat does manually) | ☐ |
| 25 | X / Twitter @topelevens handle | https://x.com/signup | ☐ |
| 26 | YouTube channel (for Shorts) | youtube.com/create_channel | ☐ |
| 27 | Reddit subreddit /r/topelevens (defensive) | https://www.reddit.com/subreddits/create | ☐ |
| 28 | Quora topic claim | quora.com (search & claim) | ☐ |
| 29 | Medium publication | https://medium.com/new-publication | ☐ |
| 30 | Substack newsletter | https://substack.com/signup | ☐ |
| 31 | Dev.to organization | https://dev.to/settings/organization | ☐ |
| 32 | HARO / Help A B2B Writer | https://www.helpareporter.com | ☐ |
| 33 | Qwoted (already running bot) | ✅ via existing qwoted-bot v2 | ✅ |
| 34 | G2 vendor profile | https://www.g2.com/products/new | ☐ |
| 35 | Capterra profile | https://www.capterra.com/vendors/sign-up | ☐ |
| 36 | TrustRadius profile | https://www.trustradius.com | ☐ |

---

## 7. TECHNICAL TICKLIST (paste into Linear / Jira)

### 7.1 Code changes in `~/repos/top11`

- [ ] `app/layout.tsx` — add full `Organization` + `WebSite` JSON-LD with `sameAs` array
- [ ] `app/layout.tsx` — add `google-site-verification` meta tag (belt-and-braces alongside DNS verify)
- [ ] `lib/schema.ts` — add `breadcrumbJsonLd()`, `faqJsonLd()`, `datasetJsonLd()`, `personJsonLd()` helpers
- [ ] `app/[slug]/page.tsx` — wire `ItemList` + `Article` + `BreadcrumbList` + `FAQPage` + `Person` author into `<head>`
- [ ] `app/api/lists/[slug]/route.ts` — emit `Dataset` JSON-LD in HTML fallback (when accessed via browser, not JSON Accept)
- [ ] `app/sitemap.ts` — add `images` block per URL (Google indexes images separately)
- [ ] Build `app/mcp/route.ts` — MCP server endpoint
- [ ] Build `public/.well-known/ai-plugin.json` — ChatGPT Action manifest
- [ ] `app/[slug]/opengraph-image.tsx` — dynamic OG image per list via `@vercel/og`
- [ ] `app/robots.ts` — convert static `public/robots.txt` to dynamic, so any new AI crawler can be added in one place
- [ ] `lib/indexnow.ts` — module that pings IndexNow on any list publish/update; wire into existing publish flow
- [ ] `next.config.js` — add `headers()` for `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- [ ] `app/[slug]/page.tsx` — render "Last verified: {{date}}" prominently + changelog block
- [ ] `lib/og-meta.ts` — centralize `openGraph` + `twitter` metadata per page
- [ ] Build `/authors/hayat-amin` page with full `Person` schema
- [ ] Build `/about`, `/privacy`, `/terms`, `/contact` pages (trust signals)
- [ ] Build `/vs/[a]-vs-[b]` dynamic comparison page template
- [ ] Build `/alternatives-to/[brand]` page template
- [ ] Build embeddable badge SVG generator at `/api/badges/[slug]/[rank].svg`

### 7.2 Scripts / crons to add

- [ ] `scripts/indexnow-push.ts` — invoked on every `pnpm publish-list`
- [ ] Weekly cron: `scripts/llm-citation-tracker.ts` — probes ChatGPT/Claude/Gemini/Perplexity for ~50 target queries, logs % cited, Slacks digest
- [ ] Weekly cron: `scripts/entry-freshness-check.ts` — re-checks pricing/features on every entry via Apify, updates `last_verified`
- [ ] Weekly cron: `scripts/backlink-monitor.ts` — Ahrefs API → new/lost referring domains → Slack
- [ ] Daily cron: `scripts/gsc-digest.ts` — pulls top queries, impressions, CTR → Slack one-liner
- [ ] Monthly cron: `scripts/schema-validation.ts` — re-runs Google Rich Results Test against every URL → fails build if any errors

### 7.3 CI gates

- [ ] PR check: Lighthouse score ≥90 on Performance / SEO / Accessibility for every changed page
- [ ] PR check: schema validation must pass on every page that emits JSON-LD
- [ ] PR check: every new `/best-X` page must include `ItemList`, `Article`, `FAQPage`, `BreadcrumbList`, `dateModified`, ≥3 citations, ≥1 statistic

---

## 8. AEO-SPECIFIC CONTENT TEMPLATE (use for every list)

```md
# Best [Category] in 2026 — Top 11 Ranked

> **Quick answer:** The best [category] in 2026 is **[Winner]**, with **[Runner-up]** and **[Third]** rounding out the top three. Rankings refresh continuously based on [criteria].

**Last verified:** May 28, 2026 · **Methodology:** [link]/methodology · **Data export:** [JSON](/api/lists/[slug]) · [CSV](/api/lists/[slug]/csv)

## TL;DR
- 🥇 **#1 [Winner]** — [one-line why]
- 🥈 **#2 [Runner-up]** — [one-line why]
- 🥉 **#3 [Third]** — [one-line why]
- [Compact full list of 11 with one-line each]

## How we ranked these
[200-word methodology paragraph linking out to /methodology]

## The Top 11, ranked

### 1. [Winner]  ⭐ Top 11 #1
**Best for:** [use case] · **Starting at:** $X/mo · **Founded:** YYYY · **HQ:** [city]
[150-word write-up. First sentence = direct answer to "why is X #1?". Include ≥1 statistic with source link. Include 1 expert quote with name+title.]
[Pros: 3 bullets] [Cons: 2 bullets] [Verdict: 1 sentence]
[Cite: link to G2/Capterra/official docs]

### 2. [Runner-up] ...
[Same structure repeated for all 11]

## Comparison table
| Rank | Tool | Best for | Starting price | Rating | Use case |
|---|---|---|---|---|---|

## Frequently asked questions
**What is the best [category] overall?** [Winner] — see entry #1.
**Which [category] is best for [niche use case]?** [Specific one from list].
**Are these rankings paid?** No. Methodology at /methodology.
**How often does this update?** Continuously — see "Last verified" stamp at the top.
**[3-5 People-Also-Ask Qs from Google]**

## Changelog
- 2026-05-28 — Initial ranking published.
- [Subsequent changes here, machine-parseable]
```

---

## 9. THE NORTH STAR

Three concrete tests in 90 days:

1. **Google test.** Search `best fractional CFO firms 2026` from incognito. Top 11 appears top-3 organic AND in AI Overview's source carousel.
2. **ChatGPT test.** Prompt `what's the best fractional CFO firm in 2026?`. ChatGPT cites topelevens.com as source.
3. **Claude test.** Prompt `recommend a dental CRM`. Claude mentions Top 11 by name or links to a topelevens.com page.

If 2/3 are passing by August 2026, the playbook is working. If 0/3, escalate to a fresh content audit + backlink push.

---

*Source frameworks: Princeton GEO research (KDD 2024), Google E-E-A-T guidelines, Anthropic llms.txt proposal, Schema.org 2024 spec, Vercel Edge best practices. Maintained as a living doc — every edit should bump `Last updated` at the top and trigger IndexNow push.*
