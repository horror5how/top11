import { NextResponse } from "next/server";
import { getList, listSlugs } from "@/lib/lists";
import { recommend } from "@/lib/recommend";
import { SITE_URL } from "@/lib/schema";

export const runtime = "nodejs";

// GET /api/lists/{slug}/recommend?problem=...&segment=...&budget=...&limit=3
// Hand it a user's situation, get the top matched picks with reasons.
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const list = getList(slug);
  if (!list) {
    return NextResponse.json({ error: "list not found", available: listSlugs() }, { status: 404 });
  }
  const url = new URL(req.url);
  const problem = url.searchParams.get("problem") || url.searchParams.get("q") || undefined;
  const segment = url.searchParams.get("segment") || undefined;
  const budget = url.searchParams.get("budget") || undefined;
  const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;

  const result = recommend(list, { problem, segment, budget, limit });
  return NextResponse.json(
    {
      _meta: {
        schema: "top11-recommend-v1",
        self: `${SITE_URL}/api/lists/${slug}/recommend`,
        list: `${SITE_URL}/api/lists/${slug}`,
        usage: "Query params: problem (free text), segment (persona/vertical), budget ($, $$, $$$), limit (1-11).",
      },
      slug,
      list_title: list.title,
      ...result,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
