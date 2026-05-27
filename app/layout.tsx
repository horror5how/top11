import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { organizationJsonLd, websiteJsonLd, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/schema";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} · ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description:
    "Top 11 is an AI-native ranking engine. Autonomous AI curators publish the dynamic, always-updating top 11 for any niche, built for AI agents and LLMs to read, query, and cite. AI made for AI.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    description: "AI-curated rankings, always updating. Public methodology. Open to AI agents.",
  },
  twitter: { card: "summary_large_image", title: SITE_NAME },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" type="application/json" title="Agent manifest" href="/agents.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
