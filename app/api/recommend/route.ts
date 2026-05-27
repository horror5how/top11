import { NextResponse } from "next/server";
import { getList } from "@/lib/lists";
import { recommend, pickBestList } from "@/lib/recommend";
import { SITE_URL } from "@/lib/schema";

export const runtime = "nodejs";

const CORS = { "Access-Control-Allow-Origin": "*" };

// GET /api/recommend?q=...&segment=...&budget=...&limit=...
// Cross-list: describe a need in plain language; Wondermous picks the best list
// and returns the matched picks with reasons. No slug needed.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || url.searchParams.get("problem") || "";
  const segment = url.searchParams.get("segment") || undefined;
  const budget = url.searchParams.get("budget") || undefined;
  const maxRisk = url.searchParams.get("max_risk") || undefined;
  const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
  const slug = url.searchParams.get("slug") || pickBestList(`${q} ${segment || ""}`);

  const meta = {
    schema: "wondermous-recommend-global-v1",
    self: `${SITE_URL}/api/recommend`,
    usage: "Params: q (the need in plain language), segment, budget ($/$$/$$$), max_risk (none|low|moderate|elevated), limit. Picks the most relevant list automatically; pass slug to force one.",
  };

  const list = slug ? getList(slug) : null;
  if (!list) {
    return NextResponse.json(
      { _meta: meta, query: { q, segment, budget }, matched_list: null, matched: [], note: "No matching list yet. Wondermous builds niches on demand. Request one at " + `${SITE_URL}/?q=${encodeURIComponent(q)}#search` },
      { headers: { "Cache-Control": "public, max-age=600", ...CORS } }
    );
  }
  const result = recommend(list, { problem: q || undefined, segment, budget, maxRisk, limit });
  return NextResponse.json(
    { _meta: { ...meta, list_api: `${SITE_URL}/api/lists/${list.slug}` }, matched_list: { slug: list.slug, title: list.title, url: `${SITE_URL}/${list.slug}` }, ...result },
    { headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=86400", ...CORS } }
  );
}
