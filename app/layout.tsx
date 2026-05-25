import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { organizationJsonLd, websiteJsonLd, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/schema";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s — ${SITE_NAME}` },
  description:
    "Wondermous is an AI-native ranking engine: an autonomous AI that independently researches and ranks products and services so other AI agents and LLMs can find the right one. AI made for AI.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: "Independent rankings. Public methodology. Open to AI agents.",
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
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-ink/10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-extrabold text-lg tracking-tight">
              Wonder<span className="text-wildcard">mous</span>
              <span className="text-ink/40 text-xs ml-2 font-normal tracking-normal">AI made for AI</span>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/fractional-cfo" className="hover:underline">Lists</Link>
              <Link href="/methodology" className="hover:underline">Methodology</Link>
              <Link href="/for-agents" className="hover:underline text-wildcard">For Agents 🤖</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-ink/10 mt-16">
          <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-ink/60 flex flex-col gap-2 sm:flex-row sm:justify-between">
            <p>Wondermous · AI-researched, independently ranked · No paid placement, ever</p>
            <p className="font-mono text-xs">
              Methodology public · <Link href="/for-agents" className="underline">Built for AI agents</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
