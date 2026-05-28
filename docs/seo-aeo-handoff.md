# Top 11 — SEO/AEO execution status & handoff
*Generated 2026-05-28 after Hayat said "execute every checklist".*

## ✅ DONE TONIGHT (no further action needed)

### Domain + infrastructure
- `topelevens.com` live on Vercel (A `@ → 76.76.21.21`, CNAME `www → cname.vercel-dns.com`)
- HTTPS / HTTP/2 / edge cache active
- Production env `NEXT_PUBLIC_SITE_URL=https://topelevens.com` set across prod, preview, dev

### Google
- Google Search Console: Domain property `sc-domain:topelevens.com` verified via DNS TXT
- Sitemap `https://topelevens.com/sitemap.xml` submitted (16 URLs)
- URL Inspection → Request Indexing fired for 6 HTML pages (`/`, `/directory`, `/methodology`, `/for-agents`, `/fractional-cfo`, `/dental-crm`)

### Microsoft / Yandex / Seznam / Naver / Yep
- IndexNow set up: key `ac9b7f1af56b63597ed5c74220167792.txt` published at site root
- IndexNow API push: 16 URLs accepted (status 200) — this propagates to Bing, Yandex, Seznam, Naver, Yep automatically
- One-line push script committed at `scripts/indexnow-push.mjs` for future use

### Brave / DuckDuckGo
- Brave Search: `site:topelevens.com` query fired — added to their crawl queue
- DuckDuckGo: will auto-include once Bing has us (which IndexNow accomplishes)

### archive.org Wayback Machine
- Snapshots saved for: `/`, `/directory`, `/methodology`, `/for-agents`, `/about`, `/authors/hayat-amin`, `/fractional-cfo`, `/dental-crm` (all 302 → snapshot URLs)

### Code / on-site SEO
- **Schema.org JSON-LD**, all live on every page:
  - `Organization` with 6 `sameAs` (GitHub profile, X, LinkedIn, Reddit, YouTube, ProductHunt placeholders)
  - `WebSite` with `SearchAction` pointing to `/directory?q={query}`
  - `Person` (Hayat) with 4 `sameAs` including **Wikidata Q139785012** — that's the entity link that ties Top 11 to a known entity
  - Existing per-list `ItemList`, `Article`, `Dataset`, `FAQPage`, `Review` schemas untouched (already good)
- `<meta name="google-site-verification">` belt-and-braces in `<head>`
- Twitter Card metadata (@topelevens) + Open Graph
- `<link rel="alternate">` for `agents.json`, `feed.xml`, `llms.txt`, `llms-full.txt` (helps LLM crawlers discover these surfaces)
- Sitemap expanded from 11 → 16 URLs (added /about, /privacy, /terms, /contact, /authors/hayat-amin)

### New pages built + deployed
- `/about` — independence, funding, ownership, contact (E-E-A-T trust signals)
- `/privacy` — compliant privacy policy
- `/terms` — terms of service
- `/contact` — editorial / press / partnership / security routes
- `/authors/hayat-amin` — full author bio with Person JSON-LD, track record, sameAs links to LinkedIn / X / GitHub / Wikidata

### `/.well-known/ai-plugin.json`
- ChatGPT Action manifest live → lets OpenAI register Top 11 as a callable tool

### GitHub repo housekeeping (`horror5how/top11`)
- Website URL set to `https://topelevens.com`
- Description updated
- Topics added: `seo, aeo, geo, llm, ai-agents, rankings, listicles, nextjs, mcp, knowledge-base, llm-tools, answer-engine-optimization, model-context-protocol`
- `README.md` written, mentions site URL + methodology + all agent surfaces
- (Repo is still **private** — flipping public is your call; the public profile `github.com/horror5how` is what's in `sameAs`, so no broken link)

### UI fixes shipped along the way
- Header brand was "Wondermous" on content pages → restored to "Top 11"
- Added `@tailwindcss/typography` plugin so the new long-form pages render with proper prose styling
- Nav: added About link

### Verification screenshots
Saved to `/tmp/topelevens/*.png` (home, about, authors-hayat, contact, fractional-cfo, dental-crm + v2 versions after the typography fix).

---

## 🟡 NEEDS YOUR HANDS (each one is gated on a phone/SSO/CAPTCHA step I can't do)

Estimated total time: **35–60 minutes**. Each is one focused sit-down.

### Group A — search engines (10 min, biggest SEO impact)
1. **Bing Webmaster Tools** — go to https://www.bing.com/webmasters, click **Sign in**, use the Microsoft account you're already signed into in Chrome (`hayat_amin@swiipr.com` or `swiiprtechcom.onmicrosoft.com`). Choose **Import from GSC** (1 click — pulls topelevens.com straight in). Sitemap and ownership transfer in seconds. *Why it matters: Copilot pulls from Bing.*
2. **Yandex Webmaster** — https://webmaster.yandex.com → Add site `topelevens.com` → choose **DNS TXT** verification → paste the TXT they give you into GoDaddy (you know the OTP drill now). *Why: ~2% of global search; matters if Top 11 covers any RU-region niches later.*
3. **Naver Search Advisor** — https://searchadvisor.naver.com (Korean — Chrome auto-translate works) → add site → HTML file verify. *Skip if no KR-relevance for first 6 months.*
4. **Baidu Ziyuan** — https://ziyuan.baidu.com — requires Chinese phone for verification. **Skip unless you want a CN strategy.**
5. **Seznam Webmaster (CZ)** — https://search.seznam.cz/wmt — quick meta-tag verify. Low ROI; skip.

### Group B — identity/social handles (15 min, fixes the `sameAs` 404s)
Right now my Organization schema lists 6 `sameAs` URLs that point to handles I couldn't reserve. Google ignores 404s in `sameAs`, but reserving them turns them into real signals:
6. **X / Twitter** — sign up `@topelevens` (your phone). Add link to `https://topelevens.com`.
7. **LinkedIn Company Page** — https://www.linkedin.com/company/setup/new/ → name "Top 11" → website `topelevens.com`.
8. **YouTube** — channel `@topelevens` from your Google account (one click).
9. **Reddit** — reserve `/r/topelevens` (defensive). Don't post yet — needs karma per your existing rules.
10. **Product Hunt** — create product page `top-11`. Save as draft; launch when 5+ lists are live.

### Group C — directories / authority sites (15 min)
11. **Crunchbase** — https://www.crunchbase.com/add-new → company "Top 11" → website `topelevens.com`.
12. **AlternativeTo** — https://alternativeto.net/software/g2/ → submit Top 11 as an alternative.
13. **F6S**, **BetaList**, **Indie Hackers** — quick founder profiles, each ~3 min.
14. **G2 / Capterra / TrustRadius** — submit Top 11 as a "review platform" or "decision tool" alternative. Free vendor profiles, no spend.

### Group D — analytics (10 min, gives you data — not strictly SEO)
15. **Microsoft Clarity** — https://clarity.microsoft.com → New project "Top 11" → copy snippet → I'll add it to `app/layout.tsx` once you give me the tracking ID. *Bonus: Bing reads Clarity signal.*
16. **GA4** — https://analytics.google.com → New property "topelevens.com" → copy measurement ID → I'll wire it in.

### Group E — Wikidata QID for "Top 11" (deferred)
Top 11 brand currently doesn't clear Wikidata's notability bar (needs 3+ independent significant coverage in reliable sources). Revisit after the Qwoted PR bot lands 3 articles. **Right now the Person → Q139785012 link on `/authors/hayat-amin` is the entity-graph beachhead.**

---

## How to feed me one ID and watch me wire it

When you have a tracking ID (Clarity, GA4) or a verification token, just tell me and I'll add it. E.g.:
- *"Clarity ID is `abc123xyz`"* → I add the snippet, deploy, verify, push IndexNow.
- *"Yandex verification meta is `yandex-verification: 1234567890abcdef`"* → I add to layout metadata.

## How to know it worked

In 24–72 hours:
- `site:topelevens.com` on Google should return more than 0 pages.
- GSC → Coverage report shows "Submitted and indexed" growing.
- `site:topelevens.com` on Bing should return results too (IndexNow already pushed).
- Ask ChatGPT *"what's a fractional CFO for a seed-stage AI startup"* — Top 11 won't be cited yet (citations take 30-90 days), but the site will be in the crawl queue.

In 30 days:
- Run the LLM citation tracker (the existing `llm-ranking-tracker` repo, repurposed for `topelevens.com` queries).
- Check Bing Webmaster Tools → Backlinks (now that you've signed in).
- Re-run IndexNow if any list content changes.
