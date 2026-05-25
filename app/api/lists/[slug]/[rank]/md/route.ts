import { getList } from "@/lib/lists";
import { priceSymbol } from "@/lib/schema";

export const runtime = "nodejs";

type AnyEntry = Record<string, unknown>;

// GET /api/lists/{slug}/{rank}/md — a self-contained Markdown passage for one entry,
// shaped for LLM context ingestion (one quotable, scannable chunk).
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string; rank: string }> }) {
  const { slug, rank } = await ctx.params;
  const list = getList(slug);
  if (!list) return new Response("list not found", { status: 404 });
  const e = list.entries.find((x) => x.rank === Number(rank));
  if (!e) return new Response("entry not found", { status: 404 });
  const mi = ((list as AnyEntry).match_index as Record<string, { solves: string[]; personas: string[] }>) || {};
  const m = mi[String(e.rank)] || { solves: [], personas: [] };
  const wild = (e as AnyEntry).is_wildcard ? " (Wildcard)" : "";

  const md = `## #${e.rank}${wild} ${e.name} — ${e.score_out_of_94}/9.4

**Best for:** ${e.best_for}
**Solves:** ${m.solves.join("; ") || "—"}
**Fits:** ${m.personas.join("; ") || "—"}
**Pricing:** ${priceSymbol(e.pricing_band)} — ${e.pricing_band}
**HQ / founded:** ${e.hq} · ${e.founded}

${e.name} — ${e.verdict_short}

- Pro: ${e.praise_short}
- Con: ${e.criticism_short}

Verdict: ${e.verdict}

Source: ${e.url} · Verified ${list.last_verified} · From the independent Wondermous ranking at ${list.slug}.
`;
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Last-Modified": new Date(list.last_verified).toUTCString(),
      "Access-Control-Allow-Origin": "*",
    },
  });
}
