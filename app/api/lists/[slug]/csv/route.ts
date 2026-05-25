import { getList, toCsv } from "@/lib/lists";

export const runtime = "nodejs";

// GET /api/lists/{slug}/csv — CSV export (a Dataset distribution).
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const list = getList(slug);
  if (!list) return new Response("list not found", { status: 404 });
  return new Response(toCsv(list), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `inline; filename="${slug}.csv"`,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Last-Modified": new Date(list.last_verified).toUTCString(),
      "Access-Control-Allow-Origin": "*",
    },
  });
}
