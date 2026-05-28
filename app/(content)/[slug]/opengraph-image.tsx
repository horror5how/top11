// Dynamic OG image generated per list — every Twitter/LinkedIn/Slack share gets a branded card.
// Built with Next.js's bundled ImageResponse (no extra dep).

import { ImageResponse } from "next/og";
import { getList, listSlugs } from "@/lib/lists";

export const alt = "Top 11 — independently ranked";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: { slug: string } }) {
  const list = getList(params.slug);
  const title = list?.title ?? "Top 11";
  const subtitle = list?.subtitle ?? "AI-curated rankings, refreshed continuously.";
  const vertical = list?.vertical ?? "";
  const verified = list?.last_verified
    ? new Date(list.last_verified).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";
  const pool = list?.methodology?.candidate_pool;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #08080a 0%, #1a1a1d 100%)",
          color: "#fafaf7",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 8,
              height: 48,
              background: "#ff5722",
              borderRadius: 4,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>
              Top <span style={{ color: "#ff5722" }}>11</span>
            </span>
            <span style={{ fontSize: 14, opacity: 0.55, letterSpacing: 2 }}>AI MADE FOR AI</span>
          </div>
          {vertical ? (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 14,
                letterSpacing: 3,
                opacity: 0.55,
                textTransform: "uppercase",
              }}
            >
              {vertical}
            </span>
          ) : null}
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h1
            style={{
              fontSize: title.length > 60 ? 56 : 68,
              fontWeight: 800,
              lineHeight: 1.05,
              margin: 0,
              letterSpacing: -1.5,
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: 24, opacity: 0.7, margin: 0, lineHeight: 1.3, maxWidth: 1000 }}>
            {subtitle}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 16,
            opacity: 0.6,
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            {pool ? <span>{pool}+ screened · 11 ranked</span> : <span>11 ranked, refreshed continuously</span>}
            {verified ? <span>· Verified {verified}</span> : null}
          </div>
          <span style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", letterSpacing: 1 }}>
            topelevens.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
