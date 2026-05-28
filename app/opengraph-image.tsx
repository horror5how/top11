// Default site-level OG image (for / and any page without a per-route override).

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Top 11 — AI-curated rankings, refreshed continuously";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #08080a 0%, #1a1a1d 100%)",
          color: "#fafaf7",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 10, height: 60, background: "#ff5722", borderRadius: 4 }} />
          <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
            Top <span style={{ color: "#ff5722" }}>11</span>
          </span>
          <span style={{ marginLeft: 8, fontSize: 16, opacity: 0.55, letterSpacing: 3 }}>AI MADE FOR AI</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <h1 style={{ fontSize: 96, fontWeight: 800, lineHeight: 0.98, margin: 0, letterSpacing: -3 }}>
            The top 11
            <br />
            in every niche.
          </h1>
          <p style={{ fontSize: 28, opacity: 0.75, margin: 0, lineHeight: 1.25, maxWidth: 1000 }}>
            AI-curated rankings, refreshed continuously. No paid placement. Built for AI agents to read, query, and cite.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, opacity: 0.55 }}>
          <span>10 ranked + 1 wildcard · per niche</span>
          <span style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", letterSpacing: 1 }}>
            topelevens.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
