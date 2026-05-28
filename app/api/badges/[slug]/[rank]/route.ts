// Embeddable SVG badge: "Ranked #N · Top 11 · {list title}". Every vendor that embeds = a free backlink.
// Usage: <a href="https://topelevens.com/{slug}#rank-{rank}"><img src="https://topelevens.com/api/badges/{slug}/{rank}.svg" /></a>

import { NextRequest, NextResponse } from "next/server";
import { getList } from "@/lib/lists";

export const runtime = "edge";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string; rank: string }> }) {
  const { slug, rank: rankRaw } = await params;
  // Strip .svg suffix if present (we route both /api/badges/{slug}/{rank} and /{rank}.svg)
  const rankStr = rankRaw.replace(/\.svg$/i, "");
  const rank = parseInt(rankStr, 10);
  const list = getList(slug);
  if (!list || !Number.isFinite(rank) || rank < 1 || rank > list.entries.length) {
    return new NextResponse("Not found", { status: 404 });
  }
  const entry = list.entries.find((e) => e.rank === rank);
  if (!entry) return new NextResponse("Not found", { status: 404 });

  const title = escapeXml(list.title.replace(/^The 11 Best /i, "").replace(/^Top 11 /i, ""));
  const brand = escapeXml(entry.name);
  const rankLabel = `#${rank}`;
  const verified = new Date(list.last_verified).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  // 420 × 88 badge — works at full size or scaled down to favicon
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="88" viewBox="0 0 420 88" role="img" aria-label="Top 11 ${rankLabel} ${title} — ${brand}">
  <title>Top 11 ${rankLabel} · ${title}</title>
  <desc>${brand} is ranked ${rankLabel} on the Top 11 ${title}, verified ${verified}.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0a0a"/>
      <stop offset="1" stop-color="#1a1a1d"/>
    </linearGradient>
  </defs>
  <rect width="420" height="88" rx="10" fill="url(#bg)"/>
  <rect x="0" y="0" width="6" height="88" fill="#ff5722"/>
  <text x="22" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="700" fill="#fafaf7" letter-spacing="2">TOP 11</text>
  <text x="22" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="28" font-weight="800" fill="#fafaf7">Ranked ${rankLabel}</text>
  <text x="22" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="10" fill="#fafaf7" opacity="0.55">${title} · verified ${verified}</text>
  <text x="398" y="78" text-anchor="end" font-family="ui-monospace, 'SF Mono', Menlo, monospace" font-size="9" fill="#fafaf7" opacity="0.4">topelevens.com</text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
