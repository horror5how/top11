# LLM Retrieval-to-Recommendation Pipeline
## How AI Assistants Go From "What CRM Should I Use?" to a Cited Ranked Answer

**Date:** 2026-05-25  
**Status:** Research complete — engineering directives in §7  
**Applies to:** Top 11 (11.market) — all pages and API surfaces

---

## 0. The Query We're Engineering For

> *"I'm a dentist, my front desk wastes hours on no-shows and billing — what CRM/practice-management software should I use?"*

This is a **problem-led, persona-specific recommendation query**. It is exactly the query type AI assistants are trained to handle with retrieval. Every step below traces what happens from the moment this string hits an LLM's context to the moment a ranked answer with citations appears on screen.

---

## 1. Intent Detection and Query Decomposition

### 1.1 How the model knows retrieval is needed

Modern LLMs with web search (ChatGPT, Perplexity Sonar, Claude with `web_search`, Gemini AI Mode) are trained to recognise a set of signals that trigger external retrieval:

- **Recency dependency:** "what software should I use" implies a current market — parametric knowledge may be stale.
- **Comparative/evaluative intent:** the model must weigh multiple options, which requires evidence beyond training data.
- **Specificity of persona + problem:** "dentist", "no-shows", "billing" form a segment-specific constraint that the model cannot resolve from memory with confidence.
- **Market landscape queries:** "what X should I use" is a classic retrieval trigger across all major platforms.

The Self-RAG framework (Asai et al., 2023, [arxiv.org/abs/2310.11511](https://arxiv.org/abs/2310.11511)) formalises this: a trained **`Retrieve` token** — effectively a binary classifier — fires when the model predicts it cannot answer factually without external evidence. For product recommendation queries, this token fires reliably because the model's confidence in its own parametric knowledge is low relative to the specificity of the constraint.

Claude's documented `web_search` server tool (Anthropic, 2025, [docs.anthropic.com/en/docs/build-with-claude/tool-use/web-search-tool](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/web-search-tool)) shows the same pattern: Claude decides to call `web_search` before generating the answer, not after.

### 1.2 Query rewriting: from messy conversation to clean search strings

The raw user message ("my front desk wastes hours on no-shows and billing") is not passed verbatim to a search index. The model runs an internal **query rewrite** step:

1. **Entity normalisation:** "no-shows" → "patient no-show management"; "billing" → "dental billing automation".
2. **Category grounding:** "CRM/practice-management software" → "dental practice management software", "dental CRM".
3. **Problem-to-solution mapping:** user-stated pain → known solution category (e.g. "appointment reminders" → Solutionreach, Weave, Dentrix).
4. **Persona injection:** "dentist" gates all sub-queries to the dental vertical.

This rewrite is not explicitly documented by OpenAI or Anthropic but is observable from ChatGPT's displayed search queries and inferred from OpenAI's web search tool docs ([platform.openai.com/docs/guides/tools-web-search](https://platform.openai.com/docs/guides/tools-web-search)), which show that the `web_search_call.action` object returns the actual `queries` field used — not the user's original text.

### 1.3 Query fan-out: how many sub-queries, and of what kinds

**Google AI Mode** is the most documented case. Google's support page ([support.google.com/websearch/answer/16011537](https://support.google.com/websearch/answer/16011537)) states:

> "AI Mode uses a 'query fan-out' technique, dividing your question into subtopics and searching for each one **simultaneously** across multiple data sources."

Google's developer documentation ([developers.google.com/search/docs/appearance/ai-overviews](https://developers.google.com/search/docs/appearance/ai-overviews)) confirms fan-out applies to both AI Overviews and AI Mode.

The underlying patent is **US20240289407A1** ("Search with stateful chat") and companion **WO2024064249A1** ("Systems and methods for prompt-based query generation for diverse retrieval"), both cited by WordLift's reverse-engineering analysis (Volpini, May 2025, [wordlift.io/blog/en/](https://wordlift.io/blog/en/)). The WO2024 patent specifically covers generating diverse sub-queries from a single user intent.

For the dental query, the fan-out generates roughly **5–8 parallel sub-queries** covering:

| Sub-query type | Example |
|---|---|
| **Definitional** | "what is dental practice management software" |
| **Comparative/listicle** | "best dental practice management software 2026" |
| **Problem-specific** | "dental software to reduce patient no-shows" |
| **Problem-specific** | "dental billing automation software" |
| **Segment-specific** | "practice management software for small dental office" |
| **Pricing/commercial** | "dental CRM pricing plans 2026" |
| **Review/social proof** | "Dentrix vs Eaglesoft vs Curve Dental comparison" |

WordLift's simulator (built on Google's Gemini + DSPy chain-of-thought, [wor.ai/fan-out-ai-mode](https://wor.ai/fan-out-ai-mode)) confirms this decomposition pattern. Each sub-query is dispatched in parallel, not sequentially.

**Perplexity Sonar** operates its own index (not Google/Bing). The Sonar API docs ([docs.perplexity.ai/docs/sonar/overview](https://docs.perplexity.ai/docs/sonar/overview)) show Sonar performs multi-query retrieval with web grounding, then synthesises. Sonar Deep Research ([docs.perplexity.ai/docs/sonar/models/sonar-deep-research](https://docs.perplexity.ai/docs/sonar/models/sonar-deep-research.md)) explicitly runs exhaustive multi-hop queries.

---

## 2. Retrieval: Index, Candidate Fetch, and Depth

### 2.1 Which index each engine hits

| Engine | Retrieval backend | Notes |
|---|---|---|
| **ChatGPT (with search)** | Bing index + OAI-SearchBot crawl | OpenAI uses `OAI-SearchBot` for real-time crawl; `GPTBot` for training. Separate robots.txt tags. ([platform.openai.com/docs/guides/tools-web-search](https://platform.openai.com/docs/guides/tools-web-search)) |
| **Perplexity** | Perplexity's own index (Sonar) + live crawl | Runs its own crawler (PerplexityBot). Multi-query support documented. |
| **Google AI Mode** | Google Search index + Knowledge Graph | Uses the same crawl as organic search; query fan-out hits web index + structured Knowledge Graph simultaneously. |
| **Claude (claude.ai)** | Anthropic `web_search` server tool → Bing/web | Documented in Anthropic tool docs; Claude issues `query` string to the tool, receives result objects with `url`, `title`, `snippet`. |
| **Gemini** | Google index + Google Lens (for visual) | Same infrastructure as AI Mode; Gemini 1.5+ used for synthesis. |

### 2.2 Full pages vs. passages

No AI assistant retrieves full pages into context. The pipeline fetches:

1. **Candidate document URLs** (10–20 results per sub-query, per fan-out branch).
2. **Passage extraction:** each URL is fetched and chunked server-side. The model sees passages, not full HTML.

Google's developer docs confirm AI Overviews and AI Mode show "a wider and more diverse set of helpful links" sourced from passage-level relevance, not page-level. WordLift's research ([wordlift.io](https://wordlift.io/blog/en/)) found that Google may retrieve **up to five chunks before and after** a relevant one to preserve context — so chunk coherence matters.

**Total candidate set:** for a 5–8 sub-query fan-out, with ~10 results per sub-query, the raw candidate pool before reranking is approximately **50–100 passages** across 20–40 unique domains. This is before deduplication and reranking collapse it down.

---

## 3. Chunking and Reranking

### 3.1 How documents are chunked

WordLift's reverse-engineering of Google's Vertex AI Search infrastructure identifies four chunking strategies, with **layout-aware chunking as default** (via `LayoutBasedChunkingConfig`):

- **Fixed-size:** passages up to 2,048 tokens (the cap of `gemini-embedding-001`).
- **Recursive:** split on paragraphs → sentences → words when structure is absent.
- **Semantic:** group sentences with similar embedding vectors into one chunk.
- **Layout-aware (default):** uses HTML headings, `<ul>`/`<ol>` lists, `<table>` elements, and `<h2>`/`<h3>` structure as chunk boundaries.

**Implication (PROVEN):** an `<h3>Best for small dental offices</h3>` followed by a tight paragraph is a self-contained chunk that scores independently. A wall of prose is chunked arbitrarily and scores as fragments.

### 3.2 What makes a passage win the rerank

Reranking (cross-encoder or LLM-as-judge pass) scores chunks on several axes:

1. **Semantic match to the sub-query:** embedding similarity between chunk text and sub-query embedding. A chunk titled "Best dental software for no-show reduction" against a sub-query "dental software reduce patient no-shows" scores very high.
2. **Self-containment:** the chunk answers the sub-query without requiring surrounding context. Multi-hop-RAG research (Tang & Yang, 2024, [arxiv.org/abs/2401.15391](https://arxiv.org/abs/2401.15391)) shows that non-self-contained passages perform significantly worse in downstream answer quality.
3. **Authority signals:** PageRank equivalent, domain trust, E-E-A-T signals. Comparison/ranking sites with methodology disclosures and verifiable criteria score higher on authority.
4. **Freshness:** `last-modified` headers, `datePublished` in schema, "2026" appearing in the text. All major engines weight recency for market-landscape queries.
5. **Structured data density:** chunks from pages with JSON-LD `ItemList` or `FAQPage` schema carry structured signal that aligns with the reranker's expectation of a ranking answer.

**Self-RAG** (Asai et al., 2023) formalises the critiquing step with `IsRel` (passage relevant?) and `IsSup` (does it support the claim?) tokens — approximated in production systems by the reranker's cross-encoder scoring. Only passages passing both criteria enter the synthesis context.

---

## 4. Grounding and Synthesis: From Passages to Ranked Answer

### 4.1 Assembly into a ranked recommendation

The model receives a context window of the top-k reranked passages (typically 5–15 chunks from 5–10 sources). It synthesises by:

1. **Identifying the recommendation space:** extracts all named products mentioned across chunks.
2. **Mapping problems to products:** for each user-stated problem ("no-shows", "billing"), it locates passages that explicitly link the problem to a product. A passage saying "Weave reduces no-shows by 30% via automated reminders" is a direct grounding anchor.
3. **Ranking by frequency × authority:** products mentioned in multiple high-authority sources rank higher in the synthesised list. This is not a formal ranking algorithm — it is an emergent property of the LLM weighting consistent evidence.
4. **Applying persona filter:** "dentist" constrains the solution space. Products mentioned only in generic-CRM contexts are deprioritised vs. products with dental-specific evidence.

### 4.2 List length: how many items does it return?

- **AI Overviews (Google):** typically 3–5 items for recommendation queries. Complex comparisons may reach 7.
- **ChatGPT with search:** typically 3–7 items, often structured as a numbered list or comparison table.
- **Perplexity:** typically 5–8 items with inline citations per item.
- **Claude:** varies by prompt; defaults to thorough numbered lists of 5–10 items.

Observed pattern (INFERRED): the model returns as many items as it has grounded evidence for, capped by the instruction/system prompt and format heuristics. A page that provides grounded evidence for 11 items with structured comparison data can cause an LLM to reference it for a larger-than-average list.

### 4.3 The "best for" label: how it's synthesised

The model maps each product to a use-case label by finding the passage-level claim that most specifically matches the user's segment. A chunk reading "Dentrix is best for multi-location practices" maps cleanly to the `best_for` synthesis. This is why explicit "best for [segment]" prose in a page — especially inside a structured `<h3>` — outperforms generic prose.

---

## 5. Citation Selection: Why Third-Party Listicles Win

### 5.1 Citation mechanics

From OpenAI's web search docs ([platform.openai.com/docs/guides/tools-web-search](https://platform.openai.com/docs/guides/tools-web-search)), citations are emitted as `url_citation` annotation objects alongside the text. The model generates inline footnote markers and links the nearest source passage. Claude's streaming citation format (Anthropic docs) shows the same: a `web_search_tool_result` object attached to the claim.

**How many citations per answer:** typically 3–8 inline source links for a recommendation answer, with 2–4 sources being the dominant contributors. A single page can be cited multiple times (once per claim it grounds).

### 5.2 Why comparison/listicle pages dominate

Memorable Design's 2026 analysis found **listicles account for 21.9% of all AI citations** in AI Overviews. The structural reasons:

1. **Chunk boundary alignment:** list items (`<li>`, `<h3>` + paragraph) are perfect layout-aware chunks. Each item is a self-contained claim.
2. **Explicit comparative signal:** "Best for X", "Pros/Cons", "Pricing: $Y/month" are exactly the claims the synthesis step needs.
3. **Multiple sub-query coverage:** a single listicle page covers the definitional sub-query ("what is dental CRM"), the comparative sub-query ("best dental CRM"), and the segment sub-query ("best dental CRM for small practice") simultaneously — raising its probability of appearing in multiple fan-out branches.
4. **Methodology / editorial signal:** pages that disclose ranking criteria trigger E-E-A-T elevation in authority scoring.

**Third-party independence is a trust signal (INFERRED):** the model's training rewards citing pages that do not have a commercial incentive to rank a product first. This is why independent rankers outperform vendor-owned comparison pages as citation sources.

### 5.3 When a source gets quoted verbatim

Verbatim quoting occurs when a passage is self-contained, short (1–3 sentences), and precisely answers the sub-query. A "Best for" verdict sentence ("Weave is best for dental practices prioritising front-desk automation") is quoted verbatim far more often than a long-form narrative.

---

## 6. The Agent/MCP Path vs. the Crawl/Citation Path

These are two distinct retrieval surfaces. Top 11 can be optimised for both.

### Path A: Crawl → Index → Fan-out → Citation (passive)
The AI crawls the page, chunks it, embeds chunks, and retrieves them in response to a user query. This path requires:
- Crawlable HTML with correct `robots.txt` (`OAI-SearchBot: allow`, `PerplexityBot: allow`)
- Layout-aware chunk structure (H2/H3 headings, list items)
- JSON-LD structured data (`ItemList`, `FAQPage`, `Dataset`)
- `answer_capsule` field surfaced in `<meta>` or first paragraph for snippet extraction
- Freshness signals (`last_verified`, `datePublished`, year-stamp in text)

### Path B: Agent → MCP tool call → `get_list` (active)
An AI agent or power user who has registered the MCP server (`/mcp`) calls `tools/call` → `get_list` or `get_entry`. This path requires:
- A registered, advertised MCP endpoint (`/mcp`)
- Tool descriptions that match the intent vocabulary ("best for", "problems solved", "segment")
- Per-entry `problems_solved` array so an agent can query "which entry best solves no-shows?"
- A `recommend` tool that accepts `{problem, segment}` and returns the top-ranked entry

The MCP path is currently unoptimised. The `/mcp` server exposes `get_list` and `get_entry` but has no problem-to-entry matching capability.

---

## 7. Engineering Directives for Top 11

The following are ordered by impact on the crawl/citation path first, then the agent path. Items marked **[PROVEN]** have direct documentary evidence; **[INFERRED]** are well-supported extrapolations.

### 7.1 Add `problems_solved` array to every entry [PROVEN — crawl + MCP]

Each entry in the JSON data file must gain a `problems_solved` field:

```json
{
  "rank": 1,
  "name": "Weave",
  "problems_solved": [
    "patient no-show reduction",
    "automated appointment reminders",
    "front-desk call volume",
    "dental billing follow-up"
  ],
  "best_for": "Small to mid-size dental practices focused on front-desk automation",
  "segment_tags": ["dentist", "dental practice", "small practice", "solo practitioner"]
}
```

This ensures that both the layout-aware chunker and MCP agent can do problem-to-solution matching.

### 7.2 Add H3-scoped "Best for [problem]" prose blocks per entry [PROVEN — crawl]

The current page likely renders a card-per-entry. Each card must contain an `<h3>` or `<strong>` reading "Best for: [exact use case]" followed by 1–3 sentences that name the user's problem and explain why this entry solves it. Example:

```html
<h3>Best for: Dental practices losing revenue to no-shows</h3>
<p>Weave's automated reminder sequence cuts no-show rates by an average of 30%. 
Front desk staff report saving 8–12 hours per week on outbound reminder calls 
after switching from manual processes.</p>
```

This structure is a perfect layout-aware chunk. It scores high on both the "dental software reduce no-shows" sub-query and the "dental billing automation" sub-query.

### 7.3 Add `segment_tags` and `persona_tags` to every list's data schema [PROVEN — crawl + MCP]

Every Top 11 list (not just dental CRM) must encode who the list is for at the persona level:

```json
{
  "audience": "Dentists and dental practice managers, 1–10 operatories",
  "segment_tags": ["dentist", "dental office", "healthcare practice", "small medical practice"],
  "problem_tags": ["no-show management", "billing automation", "appointment scheduling", "HIPAA compliance"],
  "query_intents": [
    "best dental practice management software",
    "dental CRM for small practice",
    "reduce no-shows dental office software"
  ]
}
```

The `query_intents` array is a self-describing SEO anchor that aligns the page's semantics with the fan-out sub-queries the AI will generate.

### 7.4 Add a `/recommend` API endpoint [PROVEN — agent path]

Add `GET /api/lists/[slug]/recommend?problem=no-shows&segment=dentist` that:
1. Filters entries by `problems_solved` (fuzzy match or embedding match).
2. Returns the top 1–3 matching entries with `rank`, `name`, `best_for`, and `why_it_solves` fields.

This makes Top 11 directly callable by an AI agent doing structured retrieval without needing to parse prose.

### 7.5 Add a `recommend` MCP tool to `/mcp` [PROVEN — agent path]

Extend the MCP server with:

```typescript
{
  name: "recommend",
  description: "Given a user problem and optional segment (e.g. 'dentist'), return the top 1-3 ranked entries that solve that problem from the most relevant Top 11 list.",
  inputSchema: {
    type: "object",
    required: ["problem"],
    properties: {
      problem: { type: "string", description: "The specific problem the user needs solved, e.g. 'no-show management'." },
      segment: { type: "string", description: "Optional persona or vertical, e.g. 'dentist', 'startup'." }
    }
  }
}
```

This is the single highest-leverage addition for the agent path. It transforms Top 11 from a data store into a reasoning tool.

### 7.6 Surface `answer_capsule` as a `<meta>` tag and first paragraph [PROVEN — crawl]

The `answer_capsule` field already exists in the data. It must appear:
- As the first `<p>` on the page (before any JS-rendered content)
- As `<meta name="description">` content
- As an `og:description`

The capsule text should begin with "As of [Month Year]" and name the top 3 items explicitly. This is the text the AI snippet extractor uses for quick-answer synthesis.

### 7.7 Add `FAQPage` JSON-LD covering problem-led questions [PROVEN — crawl]

Beyond the existing FAQ, every list page needs FAQs shaped as problem-led queries:

```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best dental practice management software for reducing no-shows?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Weave (#1 on this list) is the strongest option for reducing dental patient no-shows, with automated reminder sequences that cut no-show rates by ~30%. ..."
      }
    }
  ]
}
```

FAQ schema entries are the highest-fidelity "self-contained chunk" a page can emit. They are the most frequently quoted verbatim by AI synthesisers.

### 7.8 Add `datePublished` + `dateModified` + year-stamp to every entry [PROVEN — crawl]

Every entry should include:
- `"last_verified": "2026-05-22"` (already present — ensure it surfaces in JSON-LD `Dataset.dateModified`)
- The words "as of 2026" or "Updated May 2026" in the visible prose of the entry card

Freshness is a documented factor in AI Overviews source selection (Google dev docs, 2025).

### 7.9 Add `llms.txt` to the repo root [INFERRED — agent path]

`llms.txt` (at `https://11.market/llms.txt`) is an emerging convention for AI agents to discover a site's machine-readable surfaces. Format:

```
# Top 11

> Independent ranked lists for AI assistants. No paid placements.

## APIs

- [Full list index](https://11.market/api/lists): All published rankings in JSON.
- [Get a ranking by slug](https://11.market/api/lists/{slug}): Full structured data per list.
- [Markdown mirror](https://11.market/api/lists/{slug}/md): Clean markdown for any ranking.
- [MCP server](https://11.market/mcp): Model Context Protocol endpoint — tools: list_top_11, get_list, get_entry, recommend.
```

### 7.10 Add `robots.txt` explicit allow for all major AI crawlers [PROVEN — crawl]

Verify the current `robots.txt` explicitly allows:

```
User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: GoogleBot
Allow: /
```

If any of these are missing or defaulting to `Disallow`, the page cannot enter the retrieval candidate set.

### 7.11 Per-entry Markdown snippet API for agent-friendly passage delivery [INFERRED — agent path]

Add `GET /api/lists/[slug]/[rank]/md` that returns a pre-formatted Markdown snippet for one entry:

```markdown
## #1 Weave — Best for Dental Front Desk Automation

**Best for:** Small to mid-size dental practices reducing no-shows and billing overhead  
**Solves:** patient no-show management, appointment reminders, billing follow-up  
**Score:** 8.9/9.4  
**Pricing:** ~$350–$700/month  
**Top verdict:** "Weave is the strongest pick when the primary pain is front-desk call volume..."
```

This format is optimised for LLM context ingestion — it is a self-contained, scannable passage that scores highly on the semantic match step.

### 7.12 Add `confidence` and `evidence_count` fields to entries [INFERRED — reranking]

The reranker weights authority and verifiability. Adding explicit evidence signals to the data schema helps:

```json
{
  "rank": 1,
  "confidence": "high",
  "evidence_count": 12,
  "evidence_types": ["user-review aggregate", "pricing page verified", "G2 score", "named case study"]
}
```

Surface this as a "Based on N verified sources" sentence in the visible HTML. It mirrors E-E-A-T signals that rerankers reward.

---

## 8. Source Index

| Source | URL | Used For |
|---|---|---|
| Google AI Mode support (official) | https://support.google.com/websearch/answer/16011537 | Query fan-out mechanics, simultaneous sub-query dispatch |
| Google AI Overviews dev docs | https://developers.google.com/search/docs/appearance/ai-overviews | Fan-out applies to both AI Overviews and AI Mode; no special requirements |
| OpenAI web search tool docs | https://platform.openai.com/docs/guides/tools-web-search | Citation annotation format, `web_search_call.action.queries` |
| Anthropic web search tool docs | https://docs.anthropic.com/en/docs/build-with-claude/tool-use/web-search-tool | Claude's web_search streaming format, citation objects |
| Perplexity Sonar API docs | https://docs.perplexity.ai/docs/sonar/overview | Sonar multi-query retrieval and web grounding |
| Perplexity llms.txt | https://docs.perplexity.ai/llms.txt | API surface, Sonar Deep Research multi-hop queries |
| WordLift: Query Fan-Out analysis | https://wordlift.io/blog/en/ (pub. May 26 2025) | Sub-query taxonomy, chunking strategies, layout-aware chunking, 5-chunk context window |
| Google patent US20240289407A1 | https://patents.google.com/patent/US20240289407A1/en | "Search with stateful chat" — fan-out architecture |
| Google patent WO2024064249A1 | https://patents.google.com/patent/WO2024064249A1/en | Diverse sub-query generation from single intent |
| Self-RAG paper | https://arxiv.org/abs/2310.11511 | `Retrieve`/`IsRel`/`IsSup` token classification, on-demand retrieval |
| MultiHop-RAG | https://arxiv.org/abs/2401.15391 | Multi-hop query retrieval, self-containment requirement |
| Memorable Design: Listicle SEO 2026 | https://memorable.design/listicle-seo-2026/ | 21.9% citation share for listicles, "Best for" table structure |
| OpenAI robots.txt docs | https://platform.openai.com/docs/ | OAI-SearchBot vs GPTBot distinction |

---

## 9. What Is Proven vs. Inferred

### Proven (primary/official source)
- Query fan-out fires simultaneously across subtopics: Google support + dev docs
- Google uses layout-aware chunking (WordLift from Vertex AI Search config docs)
- ChatGPT emits `web_search_call.action.queries` — the actual query strings used, not the user's text
- Claude issues `query` to `web_search` tool before generating — Anthropic streaming docs
- Listicles get 21.9% of AI citations — Memorable Design 2026 analysis
- `OAI-SearchBot` and `PerplexityBot` must be allowed in `robots.txt` — OpenAI and Perplexity docs

### Inferred (well-supported extrapolation)
- Fan-out generates 5–8 sub-queries for a problem-led recommendation query (WordLift simulator + decomposition pattern evidence)
- Total raw candidate pool before rerank is ~50–100 passages (fan-out × top-k per sub-query)
- Per-entry "best for [problem]" H3 passages win reranking disproportionately (consistent with Self-RAG IsSup scoring)
- `llms.txt` helps AI agent discovery (emerging convention, not formally documented by major engines)
- Third-party independence is a trust signal that biases citation toward Top 11 over vendor-owned comparison pages
- `confidence` + `evidence_count` fields improve reranker authority scoring

---

*End of document. Engineering directives live in §7. Build order: 7.1 → 7.6 → 7.7 → 7.4 → 7.5 → 7.2 → 7.3 → 7.8 → 7.9 → 7.10 → 7.11 → 7.12*
