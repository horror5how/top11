# AI Crawler & LLM Ingestion Research
**Top11 Rebuild — Research Document 01**
*Compiled: 2026-05-25 | Author: Research Agent*

---

## 1. The Full AI/LLM Crawler Roster

### 1.1 OpenAI

| User-Agent Token | Purpose | Respects robots.txt? |
|---|---|---|
| `GPTBot/1.3` | Training-corpus crawl for GPT models | Yes |
| `OAI-SearchBot` | Search index for ChatGPT Search (live citations) | Yes |
| `ChatGPT-User` | User-triggered live fetch when ChatGPT browses | Yes |

**Full UA strings (from openai.com/gptbot, 2026-05):**
- GPTBot: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.3; +https://openai.com/gptbot)`
- OAI-SearchBot: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36; compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot`
- ChatGPT-User: similar pattern, triggers on user requests for live web content

**Critical OpenAI policy** (source: https://openai.com/gptbot): GPTBot and OAI-SearchBot are independent. A site can allow OAI-SearchBot (appear in ChatGPT Search answers) while blocking GPTBot (opt out of training). To appear in ChatGPT Search results, OAI-SearchBot **must** be allowed. Note: "it can take ~24 hours from a site's robots.txt update for our systems to adjust."

**Blocking rate** (source: darkvisitors.com/agents/gptbot, 2026-05): 23% of the world's top 1000 websites block GPTBot.

---

### 1.2 Anthropic / Claude

| User-Agent Token | Purpose | Respects robots.txt? |
|---|---|---|
| `ClaudeBot/1.0` | Training-corpus crawl | Yes |
| `Claude-SearchBot/1.0` | Search index for Claude's web search feature | Yes |
| `Claude-User` | User-triggered live fetch (Claude AI assistant browsing) | Yes |

**Full UA strings (source: darkvisitors.com, 2026-05):**
- ClaudeBot: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)`
- Claude-SearchBot: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +searchbot@anthropic.com)`

**Key distinction**: ClaudeBot (AI data scraper, 19% of top sites block it) vs. Claude-SearchBot (AI search crawler, only 9% block it). Claude-SearchBot was introduced alongside Anthropic enabling web search in Claude (launched globally May 27, 2025 per https://claude.com/blog/web-search). Claude-User handles user-triggered fetches.

---

### 1.3 Perplexity

| User-Agent Token | Purpose | Respects robots.txt? |
|---|---|---|
| `PerplexityBot/1.0` | Automated index crawl for Perplexity AI search | Yes (verified per darkvisitors.com) |
| `Perplexity-User` | User-triggered fetch when Perplexity retrieves a page | Yes |

**Full UA string**: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)`

**The controversy**: In 2024, Wired and others reported that Perplexity was ignoring robots.txt disallow directives and scraping paywalled content. Perplexity disputed this. As of 2026, darkvisitors.com/agents/perplexitybot states: "While the vast majority of agents operated by reputable companies honor these robots.txt directives, bad actors may choose to ignore them entirely." The consensus among webmasters: PerplexityBot *mostly* respects robots.txt for automated crawls; Perplexity-User (user-triggered fetches) is harder to control because it uses residential IPs and browser-like headers. **For Top11: allow PerplexityBot explicitly**; do not rely on robots.txt as the sole control for Perplexity-User.

**Blocking rate**: 16% of top 1000 sites block PerplexityBot (source: darkvisitors.com, 2026-05).

---

### 1.4 Google

| User-Agent Token | Purpose | Respects robots.txt? |
|---|---|---|
| `Googlebot` | Primary web crawler for Google Search index | Yes (always) |
| `Google-Extended` | Opt-out token for training Gemini/Bard/AI models | Yes |
| `Googlebot-Image`, `Googlebot-News`, etc. | Specialized crawlers | Yes |

**Source**: https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers

**Google-Extended** (introduced 2023): Allows site owners to disallow training data use for Google's foundation models (Gemini etc.) without blocking Googlebot from indexing for Search. Set `User-agent: Google-Extended` + `Disallow: /` to opt out of AI training but remain in Google Search.

**AI Overviews and AI Mode**: Google's AI Overviews (formerly SGE) draws citations from the standard Google Search index — the same index Googlebot builds. There is no separate "AI Overviews crawler." Being indexed by Googlebot is the prerequisite. Google does not expose a separate user-agent for AI Overview fetching.

---

### 1.5 Microsoft / Bing / Copilot

| User-Agent Token | Purpose |
|---|---|
| `Bingbot` | Primary Bing crawler, powers Copilot citations |
| `msnbot-media` | Media content crawl |

Microsoft Copilot answers are grounded in Bing's search index. There is no separate Copilot-specific crawler as of May 2026. Being indexed by Bingbot = being citable by Copilot. Bingbot respects robots.txt and supports IndexNow for instant URL submission. Source: https://www.indexnow.org/documentation (IndexNow co-developed by Microsoft).

---

### 1.6 Apple

| User-Agent Token | Purpose | Respects robots.txt? |
|---|---|---|
| `Applebot` | Powers Spotlight, Siri, Safari Suggestions (AI Search Crawler) | Yes |
| `Applebot-Extended` | Training Apple Intelligence / foundation models (AI Data Scraper) | Yes |

Applebot-Extended is the opt-out token for Apple's LLM training. Same pattern as Google-Extended: allow Applebot for Siri/Spotlight citations, use `Disallow: /` under `Applebot-Extended` to opt out of AI training data only. Source: darkvisitors.com/agents/applebot-extended.

---

### 1.7 Amazon

| User-Agent Token | Purpose |
|---|---|
| `Amazonbot` | AI Data Scraper — Alexa, Kindle, Amazon product intelligence, LLM training |
| `Amzn-SearchBot` | AI Search Crawler — Alexa search results |
| `Amzn-User` | AI Assistant — user-triggered fetch for Alexa answers |

Source: darkvisitors.com/agents/amazonbot. Amazonbot respects robots.txt.

---

### 1.8 Meta

| User-Agent Token | Purpose |
|---|---|
| `Meta-ExternalAgent` | Meta's AI products (web search for Meta AI) |
| `Meta-ExternalFetcher` | URL preview fetches for Facebook/Instagram link sharing |

Meta-ExternalAgent is the relevant one for AI citation purposes. Respects robots.txt. Low blocking rate among top sites (~9–12% as of 2026).

---

### 1.9 ByteDance

| User-Agent Token | Purpose | Respects robots.txt? |
|---|---|---|
| `Bytespider` | LLM training data for ByteDance/TikTok AI models | **Disputed** |

Bytespider has been reported by multiple sources (2023–2025) to be highly aggressive and to partially ignore robots.txt. Many security researchers recommend blocking it if training data opt-out is a priority. For Top11 — which *wants* maximum ingestion — allow it, but don't rely on Bytespider being a clean citation source. Source: darkvisitors.com/agents/bytespider.

---

### 1.10 Common Crawl (CCBot)

| User-Agent Token | Purpose |
|---|---|
| `CCBot` | Open non-profit web crawl used as training data by GPT-3, LLaMA, Falcon, and dozens of open models |

CCBot respects robots.txt. The Common Crawl corpus is the upstream source for many open-source models' training data. Allowing CCBot means being in the datasets that power a broad swathe of LLMs that have no direct crawler of their own. Source: darkvisitors.com/agents/ccbot.

---

### 1.11 Recommended robots.txt for Maximum AI Crawling

This robots.txt explicitly allows every major AI crawler while keeping `*` open (no blanket restrictions). It is the correct configuration for a site that wants maximum AI ingestion and citation:

```text
# Top11 — AI-first rankings site
# Goal: maximum crawl and citation by all AI systems
# Last updated: 2026-05-25

User-agent: *
Allow: /

# OpenAI — explicitly allow training + search index
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

# Anthropic — training + search + live fetch
User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

# Google (do NOT block Google-Extended — we want AI training too)
User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

# Microsoft / Bing / Copilot
User-agent: Bingbot
Allow: /

# Apple
User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

# Amazon
User-agent: Amazonbot
Allow: /

User-agent: Amzn-SearchBot
Allow: /

# Meta
User-agent: Meta-ExternalAgent
Allow: /

# ByteDance
User-agent: Bytespider
Allow: /

# Common Crawl (feeds open-source LLMs)
User-agent: CCBot
Allow: /

# Sitemap
Sitemap: https://11.market/sitemap.xml
```

---

## 2. Do These Crawlers Execute JavaScript?

### Googlebot: YES (with a caveat)
Googlebot runs an evergreen version of Chromium (updated continuously) and executes JavaScript. However, rendering is a **two-phase, queued process**: Googlebot fetches raw HTML immediately, then queues pages for a separate rendering step that can lag by hours or days. The rendered output is what gets fully indexed.

Source: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

**Google's own recommendation** (source: https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering): "we recommend that you use server-side rendering, static rendering, or hydration as a solution." Dynamic rendering (serving pre-rendered HTML to bots) is explicitly called "a workaround and not a long-term solution."

### All other AI crawlers: NO — they do NOT execute JavaScript

ClaudeBot, OAI-SearchBot, GPTBot, PerplexityBot, CCBot, Bingbot (for the most part), Applebot, Amazonbot, Bytespider, and Meta-ExternalAgent all work the same way: they issue a plain HTTP GET request, receive the HTML document as bytes, and parse that HTML. They do not launch a browser, do not execute JavaScript, and do not wait for hydration. If your rankings data is injected into the DOM by a React/Next.js client-side component, **those crawlers will see an empty shell**.

### The hard build directive

**Every ranking, every list item, every piece of content that you want AI systems to ingest must be present in the raw HTML served in the initial HTTP response — the document that arrives before any JavaScript executes.**

For Next.js specifically this means:
- Use `app/` directory with React Server Components (default in Next.js 13+), which render to HTML at build time or request time.
- Pages that use `generateStaticParams` + static export ship as pre-rendered HTML — ideal.
- Do NOT put ranking data in a client component (`'use client'`) that fetches from an API on mount. The crawler will never see that data.
- Lazy-loaded widgets (vote buttons, quiz elements) that are purely interactive are fine as client components. The *content* (ranked list, descriptions, scores) must be SSR or static.

---

## 3. The Three Ingestion Paths

### 3.1 Training-Corpus Crawl
**What it is**: Automated, batch, asynchronous. Crawlers (GPTBot, ClaudeBot, CCBot, Bytespider, Applebot-Extended) systematically download pages. Content enters a dataset. The dataset is used in a future model training run — meaning there is no immediate effect on citations, and the lag from crawl to model output can be months to a year.

**How to be in it**: Allow the relevant user-agents in robots.txt (see Section 1.11). Ensure all content is in raw HTML. Be a stable, crawlable URL.

**Limitation**: Training data cutoffs mean your content may not appear in model responses until the next training cycle. This path is critical for brand recall and base knowledge but has a long feedback loop.

### 3.2 Live Retrieval / Grounding (RAG)
**What it is**: When a user asks ChatGPT, Claude, or Perplexity a question, the system performs a web search, fetches live pages, extracts content, and synthesizes a cited answer. This is real-time. The user-agents are ChatGPT-User, Claude-User, Perplexity-User, and similar.

**How to be in it**: 
1. Be indexed by the corresponding search crawler (OAI-SearchBot for ChatGPT, Claude-SearchBot for Claude, PerplexityBot for Perplexity, Bingbot for Copilot).
2. Rank well in the underlying search index — these systems retrieve top results for a query, not random pages.
3. Respond fast (under 2 seconds TTFB) — live fetches have tight timeouts.
4. Return content in clean, parseable HTML or plain text — no JS walls.

**This is the highest-value path** for Top11 because it means immediate, attributed citation in AI answers to users asking "what are the top 11 [X]?"

### 3.3 Search Index Crawl (for traditional search + AI grounding)
**What it is**: Bingbot and Googlebot index pages for their search engines. Those search indexes are then queried by Copilot (Bing) and Gemini / AI Overviews (Google) when grounding responses. This is the bridge between traditional SEO and AI citation.

**How to be in it**: Standard search SEO — clean HTML, fast response, sitemaps, internal linking, backlinks, structured data. IndexNow (Section 6) accelerates URL discovery.

**Covering all three paths requires no specialized strategy beyond what a technically excellent static site provides** — which is why the build architecture decision in Section 2 is the highest-leverage action.

---

## 4. llms.txt and llms-full.txt

### 4.1 Spec and Format
Proposed by Jeremy Howard (fast.ai / Answer.AI), published at https://llmstxt.org/.

**Specification** (source: llmstxt.org, 2024-09-03, still the canonical reference as of 2026-05):

File location: `/llms.txt` at root (e.g., `https://11.market/llms.txt`)

Required structure, in this exact order:
1. **H1** — name of the site/project (only mandatory section)
2. **Blockquote** — one-paragraph summary with key context
3. Zero or more freeform Markdown sections (paragraphs, lists — no headings) for background detail
4. Zero or more H2 sections, each containing a "file list" — a Markdown bullet list of `[name](url)` links, with optional italic descriptions after each

Example:
```markdown
# Top 11

> Top11 is an independent AI-first rankings site that lists and ranks the top 11 providers for professional services categories. Rankings are methodology-driven, regularly updated, and optimized for AI citation.

Top11 covers fractional C-suite services, AI tools, and professional service categories. All rankings are determined by a published methodology and community input.

## Rankings

- [Top 11 Fractional CFOs](https://11.market/fractional-cfo): Ranked fractional CFO providers by experience, pricing, and industry fit.

## Methodology

- [How We Rank](https://11.market/methodology): Full methodology for how providers are evaluated and ranked.

## For AI Agents

- [Agent API](https://11.market/api/lists): Machine-readable JSON of all rankings.
- [For Agents](https://11.market/for-agents): Agent-readable explanation of the site and how to use it.
```

**llms-full.txt**: Not a separate spec element — it is a community convention for a second file at `/llms-full.txt` that contains the *full text content* of every linked URL expanded inline, so an LLM can ingest the entire site in one fetch. FastHTML's `llms_txt2ctx` CLI tool generates this from an `llms.txt`. The top11 `next.config.js` already has correct Content-Type headers for both files.

### 4.2 Adoption Status (2026)
**Who uses llms.txt**: The ModelContextProtocol (MCP) spec site at https://modelcontextprotocol.io/llms.txt is a prominent adopter — Anthropic's own docs reference it for LLM consumption. FastHTML, many developer documentation sites, and a growing number of SaaS companies. Cursor, Vercel, and Supabase have all shipped llms.txt files.

**Do major LLMs actively consume it?**: As of May 2026 — **not in an automated, standardized way**. There is no confirmed behavior where ChatGPT, Claude, Gemini, or Perplexity's crawlers proactively fetch `/llms.txt` on every site they visit. The file is primarily useful when:
1. A developer pastes it into Claude/ChatGPT manually or via API to get better answers about the site.
2. Agentic systems (AutoGPT, Devin, computer-use agents) use it to navigate a site.
3. Future crawlers explicitly implement the spec (this is the spec's stated goal).

**Honest assessment**: llms.txt has genuine value as a low-cost, forward-compatible signal. It takes < 1 hour to implement, it is used by the most technically sophisticated AI practitioners who build agents, and it positions Top11 correctly for when crawlers do adopt it. Ship it. But do not mistake it for a mechanism that guarantees better rankings in ChatGPT or Perplexity answers today — the crawlers do not systematically consume it yet.

**Pros**:
- Near-zero implementation cost for a static Next.js site
- Signals AI-first intent to the developer ecosystem
- Useful for agentic systems already
- Forward-compatible: MCP, agent frameworks, and future crawler updates will likely support it
- Already partially set up in `next.config.js` (Content-Type headers present)

**Cons**:
- No confirmed automated consumption by ChatGPT, Claude, Perplexity, or Google as of 2026
- Does not affect training-corpus crawl behavior
- Not a substitute for correct SSR/static HTML

---

## 5. Content Format Preferences

### 5.1 Clean Semantic HTML is the Primary Target
All AI crawlers parse HTML. The quality of what they extract depends on the signal-to-noise ratio of the HTML. Key rules:

- Use `<article>`, `<section>`, `<h1>`–`<h3>`, `<ol>`, `<ul>`, `<p>` — semantic elements that parsers use as content signals.
- Keep `<nav>`, `<header>`, `<footer>` clearly separated from content — most extractors strip them.
- Avoid injecting content via JavaScript (see Section 2).
- Do not hide content behind `display:none` or lazy-load via intersection observer — crawlers see the initial paint, not user-triggered loads.
- Text-to-HTML ratio matters: a page with 2KB of prose buried in 40KB of `<div class="wrapper">` noise is harder to extract. Keep HTML lean.

### 5.2 Per-URL Markdown Mirrors
The llms.txt spec proposes serving a clean Markdown version of each page at `[url].md` (e.g., `/fractional-cfo/index.html.md` or with a Next.js `route.ts` returning `text/markdown`).

**Value**: Perplexity-User and ChatGPT-User live fetchers benefit from a clean markdown response — less HTML parsing noise, no nav clutter, structured content. If Top11 serves a `?format=md` or `/api/page-content` endpoint returning markdown, agents can request it directly.

**Practical implementation for Next.js App Router**:
```typescript
// app/fractional-cfo/route.ts (alongside page.tsx)
export async function GET(request: Request) {
  const ua = request.headers.get('user-agent') || '';
  const isBot = /PerplexityBot|ClaudeBot|GPTBot|OAI-SearchBot/i.test(ua);
  if (isBot || request.headers.get('accept')?.includes('text/markdown')) {
    return new Response(markdownContent, {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
    });
  }
  // else serve HTML normally
}
```

Or simpler: serve `public/fractional-cfo.md` as a static asset linked from llms.txt.

### 5.3 JSON API for Agents
Top11 already has `/api/lists/[slug]`. This is excellent — autonomous agents can fetch structured ranking data directly. Ensure it returns well-labeled JSON with `ranking`, `provider`, `score`, `summary` fields, with CORS headers (already in `next.config.js`).

---

## 6. Freshness Signals and Crawl Frequency

AI search crawlers (OAI-SearchBot, Claude-SearchBot, PerplexityBot) prioritize re-crawling pages that show freshness signals. The following measures increase recrawl frequency:

### 6.1 HTTP Headers
- `Last-Modified`: Set to the actual last-modified timestamp of the page content. Google's crawler infrastructure (and Bingbot) sends `If-Modified-Since` on recrawl and skips reindexing if unchanged, saving crawl budget. More importantly, a changing `Last-Modified` signals active maintenance.
  - Format required by Google: `"Weekday, DD Mon YYYY HH:MM:SS Timezone"` e.g. `"Mon, 25 May 2026 12:00:00 GMT"` (source: https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
- `Cache-Control: max-age=N` — set to realistic interval; don't set extremely long max-age on content pages (use it on assets). Short max-age signals crawlers to check back sooner.
- `ETag`: supports conditional GET; similar effect to Last-Modified.

### 6.2 Sitemap `<lastmod>`
Update `<lastmod>` in your sitemap when page content changes. Crawlers check this. Top11's `app/sitemap.ts` should dynamically generate `<lastmod>` from actual data modification timestamps, not static dates.

### 6.3 IndexNow
IndexNow is a protocol co-developed by Microsoft (Bing) and Yandex that allows instant URL submission. When you push a content update, you POST to `https://api.indexnow.org/indexnow` with your URL and a key file. Bing processes it within hours; Yandex within hours; other participating engines pick it up too.

Source: https://www.indexnow.org/documentation

**Implementation** (Next.js API route or post-build script):
```bash
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d '{"host":"11.market","key":"YOUR_KEY","urlList":["https://11.market/fractional-cfo"]}'
```

Top11 should call IndexNow on every content update (new ranking added, score changed, new provider). Note: Google does not currently participate in IndexNow but has stated it may in future. Google freshness is handled by GSC and sitemap.

### 6.4 Visible Dates
Pages should show a visible `<time datetime="2026-05-25">Last updated May 25, 2026</time>` tag. Both Google and AI crawlers use on-page date signals (alongside HTTP headers and sitemap lastmod) to determine freshness. Ranking pages that clearly show a recent update date are more likely to be cited as current sources.

---

## 7. Concrete Do's and Don'ts

### DO

- **Return 200 for all public content pages** — 301s are followed but add latency; 302s can confuse crawl attribution; 404/410 removes pages from indices.
- **TTFB under 500ms** — live-fetch user-agents (Claude-User, ChatGPT-User, Perplexity-User) have tight timeouts. A page that loads slowly may be abandoned and not cited. Vercel Edge Network helps.
- **No soft paywalls or JS gates** — if content requires JavaScript to become visible (loading spinner → content), most AI crawlers will see the spinner state, not the content.
- **Canonical tags** — use `<link rel="canonical" href="https://11.market/fractional-cfo" />` on every page. Prevents duplicate content dilution if scrapers find alternate URLs.
- **XML Sitemap with accurate `<lastmod>`** — submit to Google Search Console, Bing Webmaster Tools, and call IndexNow on updates.
- **Structured data (JSON-LD)** — use `ItemList`, `Product`, `Review`, `AggregateRating` schema from schema.org. Google uses structured data to populate AI Overviews. Example for a rankings page:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Top 11 Fractional CFOs",
    "description": "The top 11 fractional CFO providers ranked by experience and value",
    "numberOfItems": 11,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Provider Name",
        "url": "https://provider.com",
        "description": "Short description"
      }
    ]
  }
  ```
- **Internal linking** — link between ranking pages and from the homepage. Crawlers follow `<a href>` links to discover pages. Every ranking page should be linked from the homepage and sitemap.
- **Serve llms.txt and llms-full.txt as plain text** — already configured in `next.config.js`.
- **Include a `/for-agents` page** — Top11 already has `app/for-agents/page.tsx`. Keep this as SSR, make it comprehensive: explain the data model, how rankings work, how to query the API.
- **Use `<meta name="description">` with factual, citable summary text** — search crawlers use this as the page excerpt in results; AI systems use it as a first-pass summary.

### DON'T

- **Don't put ranking data in client-side JS** — if `useEffect` fetches rankings from an API and renders them into the DOM, all non-Google AI crawlers see an empty list.
- **Don't use `User-agent: *` with `Disallow: /api/`** — your structured data API (`/api/lists/[slug]`) is exactly what agents need. Keep it open.
- **Don't use infinite scroll for rankings** — crawlers will not scroll. Put all 11 items in the initial HTML payload.
- **Don't gate content with CAPTCHA or challenge pages** — Cloudflare's bot management, if misconfigured, will block AI crawlers. Ensure your Vercel/CF setup allows these user-agents through.
- **Don't use `<iframe>` for main content** — crawlers generally do not follow or render iframe content.
- **Don't set `Cache-Control: no-store` on content pages** — this tells crawlers not to cache or re-serve your content.
- **Don't use `<meta name="robots" content="noindex">` on ranking pages** — this removes them from all search indices.
- **Don't use URL fragments (#) for content navigation** — fragment-based routing (e.g., `top11.vercel.app/#fractional-cfo`) means crawlers see one page, not 11. Each ranking must be its own URL.

---

## 8. Summary Reference Table

| Crawler | Company | Purpose | JS? | robots.txt |
|---|---|---|---|---|
| GPTBot | OpenAI | Training | No | Yes |
| OAI-SearchBot | OpenAI | ChatGPT Search | No | Yes |
| ChatGPT-User | OpenAI | Live fetch | No | Yes |
| ClaudeBot | Anthropic | Training | No | Yes |
| Claude-SearchBot | Anthropic | Claude Search index | No | Yes |
| Claude-User | Anthropic | Live fetch | No | Yes |
| PerplexityBot | Perplexity | Search index | No | Yes |
| Perplexity-User | Perplexity | Live fetch | No | Mostly |
| Googlebot | Google | Search + AI Overviews | YES (queued) | Yes |
| Google-Extended | Google | Training opt-out token | N/A | Yes |
| Bingbot | Microsoft | Bing + Copilot | Partial | Yes |
| Applebot | Apple | Siri/Spotlight | No | Yes |
| Applebot-Extended | Apple | Apple Intelligence training | No | Yes |
| Amazonbot | Amazon | Alexa/LLM training | No | Yes |
| Amzn-SearchBot | Amazon | Alexa search | No | Yes |
| Meta-ExternalAgent | Meta | Meta AI search | No | Yes |
| Bytespider | ByteDance | LLM training | No | Disputed |
| CCBot | Common Crawl | Open training datasets | No | Yes |

---

## Sources

- https://openai.com/gptbot — OpenAI crawler documentation (2026-05)
- https://darkvisitors.com/agents — Known Agents / Dark Visitors (live, 2026-05)
- https://darkvisitors.com/agents/gptbot
- https://darkvisitors.com/agents/claudebot
- https://darkvisitors.com/agents/claude-searchbot
- https://darkvisitors.com/agents/perplexitybot
- https://darkvisitors.com/agents/applebot-extended
- https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering
- https://llmstxt.org/ — Jeremy Howard / Answer.AI (2024-09-03, current spec)
- https://modelcontextprotocol.io/llms.txt — MCP docs llms.txt (Anthropic, 2025)
- https://claude.com/blog/web-search — Anthropic Claude web search launch (March 20, 2025)
- https://www.indexnow.org/documentation — IndexNow protocol (Microsoft/Yandex)
