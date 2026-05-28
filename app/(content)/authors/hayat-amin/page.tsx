import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, personJsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Hayat Amin — Founder of Top 11",
  description:
    "Hayat Amin is the founder of Top 11. Three exits, repeat FT Fastest-Growing listings, Techstars Lead Mentor. He builds AI-native ranking systems used by other AI agents.",
  alternates: { canonical: `${SITE_URL}/authors/hayat-amin` },
  openGraph: {
    type: "profile",
    title: "Hayat Amin — Founder of Top 11",
    description:
      "Founder of Top 11. Three exits, FT Fastest-Growing listings, Techstars Lead Mentor.",
    url: `${SITE_URL}/authors/hayat-amin`,
  },
};

export default function HayatAminPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 prose prose-neutral">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
      />
      <h1>Hayat Amin</h1>
      <p className="text-lg text-ink/70 leading-snug">
        Founder of Top 11. Three exits, repeat <em>Financial Times</em> Fastest-Growing listings,
        Techstars Lead Mentor.
      </p>

      <h2>What he is building</h2>
      <p>
        Top 11 is an AI-native ranking engine: autonomous AI curators research each market, score
        providers against a public weighted methodology, and publish the dynamic top 11 in every
        niche. The whole system is built so that other AI agents can read, query, and cite the
        results without a human intermediary.
      </p>

      <h2>Track record</h2>
      <ul>
        <li>Three exits across the portfolio (acquired by buyers including American Express, TripAdvisor, and Cooper Parry).</li>
        <li>Three <em>Financial Times</em> Fastest-Growing company listings.</li>
        <li>Techstars Lead Mentor.</li>
        <li>Network includes Andreessen Horowitz, the Gates Foundation, and top-tier UK/US VCs.</li>
      </ul>

      <h2>Editorial role at Top 11</h2>
      <p>
        Hayat sets the editorial direction and approves the public{" "}
        <Link href="/methodology">methodology</Link>. He does not write individual entry summaries
        (those are AI-curated), but he reviews every ranking change that follows a credible
        complaint.
      </p>

      <h2>Find him elsewhere</h2>
      <ul>
        <li>
          <a href="https://www.linkedin.com/in/hayatamin" rel="noopener">
            LinkedIn — /in/hayatamin
          </a>
        </li>
        <li>
          <a href="https://x.com/hayatamin" rel="noopener">
            X / Twitter — @hayatamin
          </a>
        </li>
        <li>
          <a href="https://github.com/horror5how" rel="noopener">
            GitHub — @horror5how
          </a>
        </li>
        <li>
          <a href="https://www.wikidata.org/wiki/Q139785012" rel="noopener">
            Wikidata — Q139785012
          </a>
        </li>
      </ul>

      <p className="text-sm text-ink/50 mt-12">
        For interviews or commentary, email{" "}
        <a href="mailto:hello@topelevens.com?subject=Press%20-%20Hayat%20Amin">
          hello@topelevens.com
        </a>
        .
      </p>
    </article>
  );
}
