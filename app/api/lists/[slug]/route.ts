import { NextResponse } from "next/server";
import data from "@/data/fractional-cfo.json";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (slug !== data.slug) {
    return NextResponse.json({ error: "list not found", available: [data.slug] }, { status: 404 });
  }
  return NextResponse.json({
    ...data,
    _self: `/api/lists/${slug}`,
    _human_page: `/${slug}`,
    _llms_full: "/llms-full.txt",
  });
}
