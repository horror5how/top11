import { getList, toMarkdown } from "@/lib/lists";

export const runtime = "nodejs";

// GET /api/lists/{slug}/md — clean Markdown mirror, the preferred format for
// live-fetch agents (Perplexity-User, ChatGPT-User, Claude-User).
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const list = getList(slug);
  if (!list) return new Response("list not found", { status: 404 });
  return new Response(toMarkdown(list), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Last-Modified": new Date(list.last_verified).toUTCString(),
      "Access-Control-Allow-Origin": "*",
    },
  });
}
