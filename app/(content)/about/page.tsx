import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About Top 11 — AI-curated rankings, refreshed continuously",
  description:
    "Top 11 is an AI-native ranking engine. We publish the dynamic, always-updating top 11 in every niche — 10 ranked plus one wildcard. No paid placements, no affiliate links, no editorial favors.",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 prose prose-neutral">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.08] mb-4">
        About {SITE_NAME}
      </h1>
      <p className="text-lg text-ink/70 leading-snug">
        {SITE_NAME} is an AI-native ranking engine. Autonomous AI curators research each market, score
        providers against a public, weighted methodology, and publish the dynamic, always-updating
        top 11 in every niche — 10 ranked plus one wildcard.
      </p>

      <h2>What makes Top 11 different</h2>
      <ul>
        <li>
          <strong>Independent by design.</strong> No provider can pay to be listed. We take no
          sponsorship, run no affiliate links, accept no editorial favors.
        </li>
        <li>
          <strong>AI-first, always updating.</strong> Rankings refresh continuously based on the
          methodology — not when an editor remembers to update a page.
        </li>
        <li>
          <strong>Built for AI agents to read.</strong> Every list is published as HTML for humans
          and as <Link href="/agents.json">agents.json</Link>,{" "}
          <Link href="/llms-full.txt">llms-full.txt</Link>,{" "}
          <Link href="/openapi.json">OpenAPI</Link>, and JSON / CSV / Markdown endpoints for
          machines.
        </li>
        <li>
          <strong>Transparent.</strong> The full <Link href="/methodology">methodology</Link> is
          public. Every entry shows its evidence and last-verified date. Anyone can{" "}
          <Link href="/contact">file a complaint</Link> against a ranking.
        </li>
      </ul>

      <h2>How we are funded</h2>
      <p>
        Top 11 is founder-funded. The site does not run advertising, sponsorships, or affiliate
        links. We may, in the future, sell aggregate market reports built from list data — these
        will never influence rankings.
      </p>

      <h2>Who we are</h2>
      <p>
        Founded in 2026 by <Link href="/authors/hayat-amin">Hayat Amin</Link> — three exits, repeat
        FT Fastest-Growing listings, Techstars Lead Mentor. The technical architecture and ranking
        models are{" "}
        <a href="https://github.com/horror5how" rel="noopener">
          public on GitHub
        </a>
        .
      </p>

      <h2>Contact</h2>
      <p>
        Editorial questions, ranking complaints, or partnership inquiries:{" "}
        <a href="mailto:hello@topelevens.com">hello@topelevens.com</a> · or use the{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </article>
  );
}
