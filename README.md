# Top 11

> **AI-native ranking engine.** The dynamic **top 11 in every niche** — 10 ranked plus one wildcard — refreshed continuously, built for AI agents to read, query, and cite.

🌐 **Live site:** https://topelevens.com
📖 **Methodology:** https://topelevens.com/methodology
🤖 **Agents:** https://topelevens.com/agents.json · https://topelevens.com/llms-full.txt · https://topelevens.com/openapi.json · https://topelevens.com/mcp
📡 **API:** `https://topelevens.com/api/lists/{slug}` → JSON · `.csv` · `.md`

## Why Top 11 exists

The web is full of ranking sites that are either:
- **Pay-to-play** (G2, Capterra) where vendors buy placement,
- **Stale** (Best-of lists updated once a year if at all), or
- **Hand-written for humans only** (no machine-readable surfaces).

Top 11 is none of those. Autonomous AI curators score providers against a **public, weighted methodology**, rankings refresh continuously, and the whole site is built so AI agents can consume it without a human intermediary.

## What's in this repo

- `app/` — Next.js 15 App Router source
- `data/` — Per-list JSON data (the source of truth for rankings)
- `lib/` — Schema generation, list loading, scoring helpers
- `scripts/` — Build helpers (`build-llms-full.mjs`, `indexnow-push.mjs`)
- `docs/seo-aeo-master.md` — Living SEO + AEO + GEO playbook

## Lists currently live

| Slug | Vertical |
|---|---|
| [`/fractional-cfo`](https://topelevens.com/fractional-cfo) | Finance |
| [`/dental-crm`](https://topelevens.com/dental-crm) | Healthcare |

## Agent / LLM integration

| Surface | Purpose |
|---|---|
| [`/llms.txt`](https://topelevens.com/llms.txt) | Concise overview for LLMs |
| [`/llms-full.txt`](https://topelevens.com/llms-full.txt) | Full machine-readable corpus |
| [`/agents.json`](https://topelevens.com/agents.json) | Agent capabilities manifest |
| [`/openapi.json`](https://topelevens.com/openapi.json) | OpenAPI spec for the public API |
| [`/mcp`](https://topelevens.com/mcp) | Model Context Protocol endpoint |
| [`/.well-known/ai-plugin.json`](https://topelevens.com/.well-known/ai-plugin.json) | ChatGPT Action manifest |
| `/api/lists/{slug}` | Per-list JSON / CSV / Markdown |

## Local dev

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # also rebuilds /llms-full.txt
```

## Contributing

Spotted a ranking error? Open an issue with the list URL, the entry rank, the specific [methodology](https://topelevens.com/methodology) criterion you believe was misapplied, and evidence. Credible complaints land in the public changelog on the affected list.

## License

Source: MIT. Editorial commentary, scoring formulas, and ranking outputs: © Top 11.
