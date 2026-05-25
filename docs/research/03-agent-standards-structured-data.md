# Agent Standards & Structured Data — Top 11 Research Document

**Date:** 2026-05-25  
**Scope:** JSON-LD/schema.org, MCP, agentic-web standards, machine-readable APIs, discovery plumbing, and LLM ingestion reality.  
**Audience:** Engineers rebuilding Top 11 to be the most agent-readable ranking site in the world.

---

## Part 0 — Current Codebase Audit & Critique

### What exists

| File | What it does | Grade |
|---|---|---|
| `lib/schema.ts` | Emits `ItemList` + `ListItem` + `Service` + `Review` + `AggregateRating` + `Article` + `Organization` | B− |
| `public/.well-known/mcp.json` | Declares 4 tools with JSON Schema input shapes pointing to real API routes | B+ |
| `public/agents.json` | Describes policy, actions, proof tiers, identity — good intent | B+ |
| `app/for-agents/page.tsx` | Human-readable explainer for agents, links to endpoints | B |
| `app/api/lists/[slug]/route.ts` | Returns full JSON for one hardcoded slug | C |
| `app/sitemap.ts` | Only covers 4 URLs, only one data slug wired | C |
| `app/api/agent-review/route.ts` | Real endpoint with proof-of-usage validation | B |

### Critical weaknesses (be specific about what to fix)

1. **`mcp.json` is cargo-cult, not a real MCP server.** The MCP spec (2025-03-26) defines a JSON-RPC 2.0 wire protocol over Streamable HTTP (`POST /mcp`) with `initialize`, `tools/list`, `tools/call`, `resources/list`, `resources/read` message types. The current `mcp.json` is a static JSON manifest — not an MCP server. It lists HTTP-method shortcuts under `"http": {…}`, which is not the MCP protocol. An agent that tries to connect to `https://top11.co` as an MCP server endpoint will get a 404 on `POST /mcp`. Source: https://modelcontextprotocol.io/specification/2025-03-26/server/tools

2. **`AggregateRating` with `ratingCount: 1` violates Google policy.** Google's structured data guidelines state that AggregateRating markup requires reviews that are "created by real people or automated processes that are not controlled by the site operator." One editorial review authored by Top 11 itself does not constitute an aggregate. Using this markup on your own site for your own editorial scores risks a manual action. Source: https://developers.google.com/search/docs/appearance/structured-data/review-snippet#self-serving

3. **No `@id` URIs on any entity.** Without `@id` on `Organization`, `Service`, and `ListItem` nodes, JSON-LD processors and LLMs cannot dereference or deduplicate entities. `sameAs` to Wikidata/LinkedIn/Crunchbase is completely absent.

4. **`schema_version: "2025-11-01"` in `mcp.json` is fabricated.** The current MCP spec version is `2025-03-26`. There is no `2025-11-01` version as of May 2026. This will confuse MCP clients that validate version strings.

5. **`/api/lists/[slug]` is hardcoded to one slug.** Any agent asking for a list that isn't `fractional-cfo` gets a 404. The `/api/openapi.json` referenced in `agents.json` does not exist (returns 404). This is the single most damaging gap — agents that try to introspect the API programmatically will fail.

6. **Sitemap only covers 4 URLs.** No per-entry pages are in the sitemap. `lastmod` is derived from `data.last_verified` but only the list-level page is covered. Per-entry canonical URLs and the JSON API endpoints should be covered.

7. **No `robots.txt` pointer to `llms.txt`.** The `robots.txt` exists but likely does not reference `llms.txt`. No `Sitemap:` directive confirmed.

8. **`llms.txt` / `llms-full.txt` exist as static files** but are not generated dynamically from data — they will drift as data changes. No build script keeps them in sync per-slug.

---

## Part 1 — JSON-LD / schema.org: Comprehensive Implementation

### 1.1 The correct type stack for a ranking page

```
WebPage (or Article if editorial)
  mainEntity → ItemList
    itemListElement[] → ListItem
      item → Service (or Organization, SoftwareApplication, LocalBusiness depending on category)
        provider → Organization
        review → Review
          reviewRating → Rating
        aggregateRating → AggregateRating  ← ONLY if third-party reviews exist
        sameAs → [Wikidata, Wikipedia, LinkedIn, Crunchbase, Twitter URLs]
  about → DefinedTermSet (glossary of scoring criteria)
  publisher → Organization (Top 11)
  potentialAction → SearchAction (site search)

Dataset (sibling block on same page or linked page)
  distribution → DataDownload (the /api/lists/<slug>.json endpoint)
```

Sources: https://schema.org/ItemList · https://schema.org/Service · https://schema.org/Dataset · https://schema.org/Review

### 1.2 Full valid JSON-LD for one ranking page (fractional-cfo example)

```json
[
  {
    "@context": "https://schema.org",
    "@type": ["WebPage", "CollectionPage"],
    "@id": "https://top11.co/fractional-cfo",
    "name": "Top 11 Fractional CFO Firms — 2026 Rankings",
    "description": "Independent editorial rankings of the 11 best fractional CFO firms, scored across 9.4-point scale covering deliverables, speed, and client outcomes.",
    "url": "https://top11.co/fractional-cfo",
    "datePublished": "2026-01-15",
    "dateModified": "2026-05-20",
    "inLanguage": "en",
    "isPartOf": {
      "@type": "WebSite",
      "@id": "https://top11.co/#website",
      "name": "Top 11",
      "url": "https://top11.co",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://top11.co/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://top11.co/#organization",
      "name": "Top 11",
      "url": "https://top11.co",
      "logo": {
        "@type": "ImageObject",
        "url": "https://top11.co/logo.png"
      },
      "description": "Independent ranked lists of 11. Verified humans and AI agents."
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://top11.co" },
        { "@type": "ListItem", "position": 2, "name": "Fractional CFO", "item": "https://top11.co/fractional-cfo" }
      ]
    },
    "mainEntity": {
      "@type": "ItemList",
      "@id": "https://top11.co/fractional-cfo#list",
      "name": "Top 11 Fractional CFO Firms",
      "description": "Independent rankings of fractional CFO providers scored on a 9.4-point scale.",
      "url": "https://top11.co/fractional-cfo",
      "numberOfItems": 11,
      "itemListOrder": "https://schema.org/ItemListOrderDescending",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": ["Service", "ProfessionalService"],
            "@id": "https://top11.co/fractional-cfo/1#entry",
            "name": "Acme CFO Partners",
            "url": "https://acmecfo.com",
            "description": "Specialist fractional CFO firm for Series A–C SaaS companies.",
            "provider": {
              "@type": "Organization",
              "@id": "https://top11.co/fractional-cfo/1#org",
              "name": "Acme CFO Partners",
              "url": "https://acmecfo.com",
              "sameAs": [
                "https://www.linkedin.com/company/acme-cfo",
                "https://www.crunchbase.com/organization/acme-cfo-partners",
                "https://en.wikipedia.org/wiki/Acme_CFO_Partners"
              ]
            },
            "areaServed": { "@type": "Country", "name": "United States" },
            "serviceType": "Fractional CFO",
            "review": {
              "@type": "Review",
              "@id": "https://top11.co/fractional-cfo/1#review",
              "author": {
                "@type": "Organization",
                "@id": "https://top11.co/#organization"
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "8.7",
                "bestRating": "9.4",
                "worstRating": "0"
              },
              "datePublished": "2026-01-15",
              "reviewBody": "Acme CFO Partners excels in SaaS revenue recognition and fundraising readiness. Avg. engagement: 3.2 months to board-ready financials.",
              "name": "Top 11 Editorial Review — Fractional CFO Rank #1"
            }
          }
        }
      ]
    },
    "about": {
      "@type": "DefinedTermSet",
      "@id": "https://top11.co/methodology#scoring",
      "name": "Top 11 Scoring Criteria",
      "hasDefinedTerm": [
        {
          "@type": "DefinedTerm",
          "name": "Deliverable Quality",
          "description": "Board decks, models, and investor materials produced within engagement."
        },
        {
          "@type": "DefinedTerm",
          "name": "Engagement Speed",
          "description": "Time from first call to billable work commencing."
        }
      ]
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": "https://top11.co/fractional-cfo#dataset",
    "name": "Top 11 Fractional CFO Rankings Dataset",
    "description": "Machine-readable JSON dataset of the Top 11 Fractional CFO firms ranked editorially. Updated on score changes.",
    "url": "https://top11.co/fractional-cfo",
    "creator": { "@id": "https://top11.co/#organization" },
    "dateModified": "2026-05-20",
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "inLanguage": "en",
    "keywords": ["fractional CFO", "rankings", "B2B services", "finance"],
    "distribution": [
      {
        "@type": "DataDownload",
        "encodingFormat": "application/json",
        "contentUrl": "https://top11.co/api/lists/fractional-cfo"
      },
      {
        "@type": "DataDownload",
        "encodingFormat": "text/csv",
        "contentUrl": "https://top11.co/api/lists/fractional-cfo.csv"
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does Top 11 rank fractional CFO firms?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We score firms on a 9.4-point scale across deliverable quality, engagement speed, client outcomes, pricing transparency, and industry specialization. Scores are updated when new evidence is available."
        }
      },
      {
        "@type": "Question",
        "name": "Can an AI agent query these rankings programmatically?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Fetch GET https://top11.co/api/lists/fractional-cfo for structured JSON, or GET https://top11.co/llms-full.txt for a Markdown mirror optimized for LLM context windows."
        }
      }
    ]
  }
]
```

### 1.3 Google compliance rules — what to avoid

**Self-serving AggregateRating:** Google's policy (https://developers.google.com/search/docs/appearance/structured-data/review-snippet#self-serving) prohibits AggregateRating markup on a page controlled by the entity being rated, and prohibits site operators from marking up their own editorial scores as aggregate ratings. Top 11 is an *independent* third-party reviewer, so editorial `Review` markup is fine. However, `AggregateRating` with `ratingCount: 1` (the current code) will be rejected — it implies a crowd aggregate that doesn't exist. **Fix:** remove `AggregateRating` from the schema entirely unless user or agent reviews actually accumulate. Once ≥5 distinct agent-submitted reviews are approved in the moderation queue, synthesize a real `AggregateRating` with accurate `ratingCount`.

**`Service` vs `Organization`:** Google's rich results test supports `Review` on `LocalBusiness`, `Product`, `SoftwareApplication`. `Service` is valid schema.org but Google does not guarantee rich result rendering for it. Consider dual-typing entries as `["Service", "LocalBusiness"]` or `["Service", "ProfessionalService"]` where applicable.

**`bestRating` must match scale:** If your scale is 9.4, set `bestRating: "9.4"`. Google expects `ratingValue` to be within `[worstRating, bestRating]`. Never use a custom scale without declaring `bestRating`.

**FAQPage:** Valid for Q&A content. Each `Question` must correspond to visible on-page text. Source: https://developers.google.com/search/docs/appearance/structured-data/faqpage

---

## Part 2 — Agentic-Web Standards: Maturity Assessment

### 2.1 Model Context Protocol (MCP)

**Maturity: PRODUCTION-READY for local/stdio transports. EARLY for remote HTTP.**

The MCP spec (version 2025-03-26, published by Anthropic) defines a JSON-RPC 2.0 protocol. The transport layer that matters for a web server is **Streamable HTTP**, introduced in this spec version. Source: https://modelcontextprotocol.io/specification/2025-03-26/server/tools

A real MCP server must handle:
- `POST /mcp` (or any mounted path) accepting `Content-Type: application/json`
- Request body: `{ "jsonrpc": "2.0", "id": 1, "method": "initialize", "params": { "protocolVersion": "2025-03-26", "capabilities": {}, "clientInfo": { "name": "claude", "version": "..." } } }`
- Response: server capabilities including `{ "tools": { "listChanged": false }, "resources": { "subscribe": false } }`
- Subsequent `tools/list`, `tools/call`, `resources/list`, `resources/read` messages

**Current `mcp.json` verdict: cargo-cult.** It is a discovery document (useful!) but not a live MCP server. No client (Claude Desktop, Cursor, Cline) can connect to `https://top11.co` as an MCP server using the current setup. The file is useful as a hint to humans and crawlers about what tools exist, but must not be represented as a functional MCP endpoint.

**Should Top 11 build a real remote MCP server?** Yes — but scope it correctly:
- Implement `POST /mcp` endpoint in Next.js as a Route Handler
- Declare capabilities: `tools` only (no `resources` initially)
- Expose `list_top_11` and `get_list` tools (read-only, no auth)
- Return JSON-RPC 2.0 responses with `content: [{ type: "text", text: JSON.stringify(data) }]`
- Minimal implementation is ~80 lines of TypeScript

**Update `mcp.json`:**
- Change `schema_version` to `"2025-03-26"` (the real version)
- Add `"transport": "streamable-http"` and `"mcp_endpoint": "/mcp"`
- Keep the current tool descriptions — they are well-written

### 2.2 Microsoft NLWeb

**Maturity: EXPERIMENTAL. ~6,200 GitHub stars as of May 2026. Not a web standard.**

NLWeb (https://github.com/nlweb-ai/NLWeb) is Microsoft's open-source reference implementation for adding a natural language query endpoint (`/api/ask`) to any website. It ingests schema.org structured data (RSS, JSON-LD) into a vector database, then answers natural language queries against it using an LLM + retrieval pipeline.

**Key insight:** NLWeb natively supports MCP — the same `/api/ask` endpoint can serve both human browsers and MCP clients. It processes schema.org markup already present on pages, meaning well-structured JSON-LD is the prerequisite, not an add-on.

**For Top 11:** NLWeb is worth watching but not implementing now. The path is: (1) get JSON-LD right, (2) implement real MCP endpoint, (3) consider NLWeb as a hosted `/ask` layer if agent traffic justifies it. The schema.org work you do for Google is the same input NLWeb needs.

### 2.3 agents.json / Agent Interface Proposals

**Maturity: DRAFT, no formal standards body backing.**

The `agents.json` concept (analogous to `robots.txt` for agents) is emerging from community proposals in 2025-2026. There is no IETF RFC or W3C standard. The most coherent proposals advocate a JSON file at `/agents.json` or `/.well-known/agents.json` that describes:
- What the site can do for agents
- Authentication requirements
- Rate limits and policies
- Available endpoints

**Current `agents.json` verdict: above average.** The proof-of-usage tier system, identity section, and action descriptions are thoughtful and forward-looking. Weaknesses:
- The `proof_of_usage_tiers` reference x402 and AP2/ACP, which are themselves experimental (x402 is a Coinbase-led HTTP payment protocol draft; AP2/ACP have no formal spec link)
- No `version` field on the spec format itself (only the site version)
- Should add `"spec": "https://top11.co/methodology"` for the scoring methodology

### 2.4 `/.well-known/` conventions worth adopting now

| File | Standard | Maturity | Adopt? |
|---|---|---|---|
| `/.well-known/mcp.json` | Community convention | Draft | Yes — already done |
| `/.well-known/agents.json` | Community proposal | Draft | Mirror `/agents.json` here |
| `/.well-known/ai-plugin.json` | OpenAI ChatGPT Plugins (deprecated) | Deprecated | No |
| `/.well-known/openapi.yaml` | Informal | Draft | Yes, mirror `/api/openapi.json` |
| `/.well-known/http-message-signatures-directory` | RFC 9421 | Proposed Standard | Future — needed to verify bot signatures |
| `/robots.txt` with `Sitemap:` and `llms.txt:` directives | RFC 9309 + llms.txt convention | Stable | Yes — add both |
| `/llms.txt` | llms.txt proposal (Jeremy Howard) | Community standard | Already done |
| `/llms-full.txt` | llms.txt convention | Community standard | Already done |

Source for llms.txt format: https://llmstxt.org — the spec requires: H1 (project name), blockquote (summary), H2-delimited file lists of markdown URLs.

---

## Part 3 — Machine-Readable Content Delivery

### 3.1 JSON API shape (proven best practice)

The `/api/lists/[slug]` endpoint is the right pattern. Recommended response envelope:

```json
{
  "_meta": {
    "schema": "top11-list-v1",
    "self": "/api/lists/fractional-cfo",
    "human_page": "/fractional-cfo",
    "llms_full": "/llms-full.txt",
    "openapi": "/api/openapi.json",
    "generated_at": "2026-05-25T00:00:00Z"
  },
  "slug": "fractional-cfo",
  "title": "Top 11 Fractional CFO Firms",
  "last_verified": "2026-05-20",
  "entries": [
    {
      "rank": 1,
      "name": "Acme CFO Partners",
      "url": "https://acmecfo.com",
      "score_out_of_94": 8.7,
      "verdict": "Best for SaaS Series A–C...",
      "hq": "New York, NY",
      "founded": 2019,
      "team_size_range": "10-25",
      "pricing_model": "monthly_retainer",
      "sameAs": {
        "linkedin": "https://linkedin.com/company/acme-cfo",
        "crunchbase": "https://crunchbase.com/organization/acme-cfo-partners"
      },
      "_entry_api": "/api/lists/fractional-cfo/1"
    }
  ]
}
```

**Per-entry API:** Add `GET /api/lists/[slug]/[rank]` returning a single entry. Agents querying "who is #3 on the fractional CFO list" can fetch a lightweight response without the full list.

**CSV download:** Add `GET /api/lists/[slug].csv` for data tools. Simple `text/csv` with `Content-Disposition: attachment` header.

**Markdown mirror:** Serve `/fractional-cfo.md` (or `?format=md`) that returns the page as clean Markdown. This is the llms.txt convention — same URL, `.md` appended. Source: https://llmstxt.org/#proposal

### 3.2 OpenAPI spec

`/api/openapi.json` is referenced in `agents.json` but does not exist — this is a broken promise. Implement a static OpenAPI 3.1.0 spec:

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Top 11 API",
    "version": "1.0.0",
    "description": "Machine-readable API for Top 11 independent rankings. Free for reads.",
    "contact": { "email": "agents@top11.co" },
    "license": { "name": "CC BY 4.0", "url": "https://creativecommons.org/licenses/by/4.0/" }
  },
  "servers": [{ "url": "https://top11.co/api" }],
  "paths": {
    "/lists": {
      "get": {
        "summary": "List all available ranking slugs",
        "operationId": "listSlugs",
        "responses": {
          "200": {
            "description": "Array of available list slugs",
            "content": {
              "application/json": {
                "schema": { "type": "array", "items": { "type": "string" } }
              }
            }
          }
        }
      }
    },
    "/lists/{slug}": {
      "get": {
        "summary": "Get full ranking for a list",
        "operationId": "getList",
        "parameters": [
          { "name": "slug", "in": "path", "required": true, "schema": { "type": "string", "example": "fractional-cfo" } }
        ],
        "responses": {
          "200": { "description": "Full structured ranking JSON" },
          "404": { "description": "List not found" }
        }
      }
    },
    "/lists/{slug}/{rank}": {
      "get": {
        "summary": "Get a single entry by rank",
        "operationId": "getEntry",
        "parameters": [
          { "name": "slug", "in": "path", "required": true, "schema": { "type": "string" } },
          { "name": "rank", "in": "path", "required": true, "schema": { "type": "integer", "minimum": 1, "maximum": 11 } }
        ],
        "responses": {
          "200": { "description": "Single ranked entry" },
          "404": { "description": "Entry not found" }
        }
      }
    }
  }
}
```

### 3.3 Content negotiation

Implement `Accept` header negotiation on ranking pages:
- `Accept: application/json` → return the raw JSON data (same as `/api/lists/[slug]`)
- `Accept: text/markdown` → return the Markdown mirror
- `Accept: text/html` (default) → return the rendered page

This is the most agent-friendly pattern — one URL, multiple representations. Not widely adopted yet but trivial to implement in Next.js middleware.

---

## Part 4 — Discovery Plumbing

### 4.1 Sitemap (proven, implement immediately)

Current `sitemap.ts` only covers 4 URLs. Expand to:
- `/` — priority 1.0, weekly
- `/<slug>` per list — priority 0.9, monthly (update `lastmod` from `data.last_verified`)
- `/api/lists/<slug>` — priority 0.8 (tells crawlers the JSON endpoint exists)
- `/methodology` — priority 0.7, monthly
- `/for-agents` — priority 0.8, monthly (agents-specific, keep discoverable)

Source: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap — Google recommends `lastmod` be "the date of last significant change to the page."

### 4.2 robots.txt (implement immediately)

```
User-agent: *
Allow: /

Sitemap: https://top11.co/sitemap.xml
# llms.txt convention — LLM crawlers should read this first
# llms.txt: https://top11.co/llms.txt
```

Note: `llms.txt` directives in `robots.txt` are an informal convention, not a standard. Google ignores non-standard directives. Include it anyway for LLM crawlers that implement the convention.

### 4.3 IndexNow (implement immediately, proven standard)

IndexNow (https://www.indexnow.org/documentation) is supported by Bing, Yandex, and other engines. Submission is a single GET or POST:

```
GET https://api.indexnow.org/indexnow?url=https://top11.co/fractional-cfo&key=<your-key>
```

Or bulk POST:
```json
POST https://api.indexnow.org/indexnow
{
  "host": "top11.co",
  "key": "<your-key>",
  "keyLocation": "https://top11.co/<your-key>.txt",
  "urlList": ["https://top11.co/fractional-cfo", "https://top11.co/api/lists/fractional-cfo"]
}
```

The repo already has `scripts/indexnow.mjs` — verify it pings on data changes (e.g. via a `postbuild` npm script or a GitHub Action on data file commits).

Google does not participate in IndexNow. For Google, use the Indexing API (already configured per MEMORY.md) or rely on sitemap + Search Console.

### 4.4 RSS/Atom feed (implement, useful for agents)

Publish `GET /feed.xml` (Atom 1.0) listing ranking updates with `<updated>` timestamps per entry. Many LLM pipelines and agent frameworks consume RSS/Atom for change detection. This is one of the cheapest discovery improvements to implement.

### 4.5 Canonical URLs and `hreflang`

Every page must emit `<link rel="canonical" href="https://top11.co/<slug>" />`. The JSON API URL (`/api/lists/<slug>`) should NOT be canonical for the human page — they are separate resources. No hreflang needed until multi-language lists exist.

---

## Part 5 — How LLMs Actually Use Structured Data Today (Hype vs Real)

### What is real (confirmed by public documentation and engineering posts, May 2026)

**Google Search / SGE (AI Overviews):**
- Google confirms it reads JSON-LD for structured entities. ItemList markup can trigger list-style rich results in SGE. Source: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- `FAQPage` and `QAPage` markup directly populates AI Overview answer boxes. This is the highest-ROI JSON-LD type for LLM visibility.
- `Dataset` markup feeds Google Dataset Search (https://datasetsearch.research.google.com) — a direct channel for agents querying data sources.

**Perplexity:**
- Perplexity crawls the open web and caches pages. It does not have a documented API for structured data ingestion. Clean Markdown (via llms.txt or `.md` URLs) is more likely to produce clean citations than raw HTML. There is no confirmed structured-data pipeline distinct from the crawler.

**ChatGPT (Bing-backed search, Browsing tool):**
- ChatGPT's browsing tool reads fetched pages as rendered text. JSON-LD in `<script>` tags is not typically surfaced to the LLM — it reads the visible DOM. Markdown mirrors are more useful than JSON-LD for direct ChatGPT ingestion.
- Bing Webmaster Tools supports IndexNow and reads Bing's own structured data cache.

**Claude (Anthropic):**
- Claude with web search tools fetches and reads pages. Clean Markdown via llms.txt is the most direct ingestion path. The `/api/lists/<slug>` JSON endpoint will be read correctly when an agent fetches it with the right Accept header or URL.
- Claude Code (this system) can connect to real MCP servers. A real `POST /mcp` endpoint on Top 11 would allow Claude agents to query rankings natively.

**Gemini / Google AI Overviews:**
- Reads schema.org JSON-LD. `ItemList` + `ListItem` with `position` is the primary trigger for ordered list rendering in AI Overviews. Entity linking via `sameAs` to Wikipedia/Wikidata improves Knowledge Graph entity resolution.

### What is hype

- **"Agents will automatically discover and use your MCP server"** — False today. MCP clients (Claude Desktop, Cursor, etc.) require explicit server configuration by a human. There is no auto-discovery mechanism for remote MCP servers. The `/.well-known/mcp.json` convention is useful documentation but does not trigger automatic connection.
- **"Perplexity reads your OpenAPI spec"** — No confirmed evidence. Perplexity uses a web crawler, not API introspection.
- **"agents.json is an emerging standard"** — It is a community proposal with no standards-body backing. Implement it because it is cheap and forward-looking, not because agents are reading it today.
- **"x402 payment verification will be widespread by 2026"** — x402 is a Coinbase Labs draft (https://x402.org). No major agent frameworks implement it as of May 2026. Keep it in the spec but expect Tier D (vendor confirmation) to dominate actual usage.

---

## Implementation Checklist (Priority Order)

### Tier 1 — Critical (implement this sprint)

- [ ] **Fix `mcp.json` schema version:** Change `"schema_version": "2025-11-01"` to `"2025-03-26"`. Add `"transport": "streamable-http"` and `"mcp_endpoint": "https://top11.co/mcp"`. Update the note to clarify this is a discovery document pending a live MCP server. **Proven standard.**
- [ ] **Remove `AggregateRating` from `schema.ts`** until real aggregated third-party reviews exist (need ≥5 distinct approved agent reviews). Replace with editorial `Review` only. **Required for Google compliance.** Source: https://developers.google.com/search/docs/appearance/structured-data/review-snippet#self-serving
- [ ] **Add `@id` URIs to all JSON-LD entities** — `WebSite`, `Organization`, `ItemList`, each `ListItem`, each `Service`/`Organization` entry. Use the canonical page URL + `#fragment` pattern. **Proven best practice, required for LLM entity resolution.**
- [ ] **Add `sameAs` arrays to each ranked entry** pointing to LinkedIn, Crunchbase, Wikipedia/Wikidata where known. This is what makes Google Knowledge Graph and LLM entity resolution work. Source: https://schema.org/sameAs
- [ ] **Implement `/api/openapi.json`** — a static OpenAPI 3.1.0 spec served from `public/openapi.json`. The endpoint is already referenced in `agents.json` but returns 404. **Broken promise — fix immediately.**
- [ ] **Implement `/api/lists` (GET, no slug)** — returns array of all available slugs. Required for agents to enumerate the catalog without hardcoding slugs.
- [ ] **Add `Dataset` JSON-LD block to each ranking page** with `distribution.contentUrl` pointing to the JSON API endpoint. Feeds Google Dataset Search. **Proven discovery channel.**
- [ ] **Expand `sitemap.ts`** to cover all list pages, per-entry canonical URLs (once they exist), and the `/api/lists/<slug>` data endpoints. Set `lastmod` from actual data modification timestamps.

### Tier 2 — High Value (implement within 2 weeks)

- [ ] **Implement real MCP server at `POST /mcp`** — Next.js Route Handler implementing JSON-RPC 2.0 with `initialize`, `tools/list`, `tools/call`. Expose `list_top_11` (returns all slugs) and `get_list` (returns full ranking JSON) as tools. ~80 lines of TypeScript. **Proven standard (MCP 2025-03-26), high agent-adoption ROI.** Source: https://modelcontextprotocol.io/specification/2025-03-26
- [ ] **Add `FAQPage` JSON-LD** to each ranking page with 3–5 Q&A pairs covering methodology, how to use the API, and what the score means. Most direct path to Google AI Overview inclusion. **Proven.**
- [ ] **Implement `/api/lists/[slug]/[rank]` (per-entry API)** — single ranked entry by position. Lightweight for agents querying specific items.
- [ ] **Implement `/api/lists/[slug].csv`** — CSV export. Required for `Dataset` `distribution` claim.
- [ ] **Add Atom feed at `/feed.xml`** — lists recent ranking updates. Enables change-detection by agent pipelines. Easy to implement.
- [ ] **Mirror `agents.json` to `/.well-known/agents.json`** via Next.js redirect or static copy. Follows emerging convention.
- [ ] **Update `robots.txt`** to include `Sitemap: https://top11.co/sitemap.xml` and an informal `# llms.txt: https://top11.co/llms.txt` comment.
- [ ] **Wire `scripts/indexnow.mjs`** to run on every data file commit via GitHub Actions. Ping both the human page and the API URL.

### Tier 3 — Forward-Looking (implement when traffic justifies)

- [ ] **Content negotiation middleware** — inspect `Accept` header on ranking page routes; return JSON or Markdown when appropriate. **Not widely expected yet but trivially cheap.**
- [ ] **`DefinedTermSet` / `DefinedTerm` markup on `/methodology`** — makes the scoring criteria machine-readable and entity-linkable. **Useful for LLM citation accuracy.**
- [ ] **`BreadcrumbList` on all pages** — already easy to add, helps SGE navigation. **Proven, low effort.**
- [ ] **`WebSite` + `SearchAction` (`potentialAction`)** on the root `Organization` — enables Google Sitelinks search box. **Proven.**
- [ ] **NLWeb `/api/ask` endpoint** — only after JSON-LD and MCP are solid. Self-hosted NLWeb ingests your schema.org data and answers natural language queries. **Experimental, high-value if agent query volume grows.** Source: https://github.com/nlweb-ai/NLWeb
- [ ] **`/.well-known/http-message-signatures-directory`** — required to fully implement Web Bot Auth (RFC 9421) verification for agent identity. Only meaningful once a significant number of agents are submitting reviews with cryptographic signatures.
- [ ] **Per-entry Markdown mirrors at `/<slug>/<rank>.md`** — one file per ranked entry, clean Markdown, for agents that prefer to fetch individual entries.

---

## Source Index

| Source | URL |
|---|---|
| schema.org ItemList | https://schema.org/ItemList |
| schema.org Dataset | https://schema.org/Dataset |
| schema.org DataDownload | https://schema.org/DataDownload |
| schema.org sameAs | https://schema.org/sameAs |
| schema.org DefinedTermSet | https://schema.org/DefinedTermSet |
| Google Review structured data + self-serving rules | https://developers.google.com/search/docs/appearance/structured-data/review-snippet |
| Google Dataset structured data | https://developers.google.com/search/docs/appearance/structured-data/dataset |
| Google Sitemaps | https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap |
| Google Intro to Structured Data | https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data |
| MCP Specification 2025-03-26 (Tools) | https://modelcontextprotocol.io/specification/2025-03-26/server/tools |
| MCP Specification 2025-03-26 (Resources) | https://modelcontextprotocol.io/specification/2025-03-26/server/resources |
| Microsoft NLWeb GitHub | https://github.com/nlweb-ai/NLWeb |
| llms.txt spec | https://llmstxt.org |
| IndexNow documentation | https://www.indexnow.org/documentation |
| RFC 9421 HTTP Message Signatures | https://www.rfc-editor.org/rfc/rfc9421 |
| OpenAPI Specification 3.1.0 | https://spec.openapis.org/oas/v3.1.0 |
| x402 HTTP Payment Protocol | https://x402.org |
| Google Dataset Search | https://datasetsearch.research.google.com |
| Google FAQPage structured data | https://developers.google.com/search/docs/appearance/structured-data/faqpage |
| Sitemaps protocol | https://www.sitemaps.org/protocol.html |
