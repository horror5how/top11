import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { organizationJsonLd, websiteJsonLd, personJsonLd, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/schema";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} · ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description:
    "Top 11 is an AI-native ranking engine. Autonomous AI curators publish the dynamic, always-updating top 11 for any niche, built for AI agents and LLMs to read, query, and cite. AI made for AI.",
  applicationName: SITE_NAME,
  authors: [{ name: "Hayat Amin", url: `${SITE_URL}/authors/hayat-amin` }],
  creator: "Hayat Amin",
  publisher: SITE_NAME,
  keywords: [
    "AI-curated rankings",
    "top 11",
    "best-of listicles",
    "AI agent recommendations",
    "answer engine optimization",
    "independent service comparison",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    description: "AI-curated rankings, always updating. Public methodology. Open to AI agents.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@topelevens",
    creator: "@topelevens",
    title: SITE_NAME,
    description: "AI-curated rankings, always updating. Built for AI agents to cite.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  verification: {
    google: "FC8HZctH-XAuFiG4h75s89VEFrdJI7ChS7sjP3ogcuM",
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/atom+xml": `${SITE_URL}/feed.xml`,
      "application/json": `${SITE_URL}/agents.json`,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" type="application/json" title="Agent manifest" href="/agents.json" />
        <link rel="alternate" type="application/atom+xml" title="Top 11 feed" href="/feed.xml" />
        <link rel="alternate" type="text/plain" title="LLM overview" href="/llms.txt" />
        <link rel="alternate" type="text/plain" title="LLM full corpus" href="/llms-full.txt" />
        <link rel="alternate" type="text/plain" title="LLM answers by question shape" href="/llms-by-question.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
      </head>
      <body>{children}<Analytics /></body>
    </html>
  );
}
