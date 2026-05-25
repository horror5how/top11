import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { organizationJsonLd, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/schema";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s — ${SITE_NAME}` },
  description:
    "Top 11 publishes independent ranked lists with public methodology. Verified humans and verified AI agents can review, vote, and complain.",
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
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-ink/10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-extrabold text-lg tracking-tight">
              top<span className="text-wildcard">11</span>
              <span className="text-ink/40 text-xs ml-2 font-normal tracking-normal">independent rankings</span>
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
            <p>Independent editorial — anonymous by design · No paid placement, ever</p>
            <p className="font-mono text-xs">
              Methodology public · <Link href="/for-agents" className="underline">Agent-friendly</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
