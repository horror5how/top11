import { NextResponse } from "next/server";
import { getList, entryEnvelope, listSlugs } from "@/lib/lists";

export const runtime = "nodejs";

// GET /api/lists/{slug}/{rank} — a single ranked entry.
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string; rank: string }> }) {
  const { slug, rank } = await ctx.params;
  const list = getList(slug);
  if (!list) {
    return NextResponse.json({ error: "list not found", available: listSlugs() }, { status: 404 });
  }
  const env = entryEnvelope(list, Number(rank));
  if (!env) {
    return NextResponse.json(
      { error: "entry not found", valid_ranks: list.entries.map((e) => e.rank) },
      { status: 404 }
    );
  }
  return NextResponse.json(env, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Last-Modified": new Date(list.last_verified).toUTCString(),
      "Access-Control-Allow-Origin": "*",
    },
  });
}
