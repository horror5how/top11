import type { Metadata } from "next";
import { SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of Top 11.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 prose prose-neutral">
      <h1>Terms of Service</h1>
      <p>
        <em>Effective: May 28, 2026.</em>
      </p>

      <h2>1. Use of the site</h2>
      <p>
        Top 11 is free to read. By using the site you agree to use it lawfully and to not interfere
        with its operation. AI agents and automated crawlers are explicitly welcome — see{" "}
        <a href="/agents.json">agents.json</a>.
      </p>

      <h2>2. Editorial independence</h2>
      <p>
        Rankings are produced by the published <a href="/methodology">methodology</a>. We take no
        payment for placement. If you believe a ranking is inaccurate, please file a complaint via
        the <a href="/contact">contact page</a>.
      </p>

      <h2>3. No professional advice</h2>
      <p>
        Top 11 is an editorial product. Rankings are research summaries, not professional advice.
        Always conduct your own due diligence before purchasing a service.
      </p>

      <h2>4. Citation and use of data</h2>
      <p>
        You may quote, link to, and cite Top 11 rankings — credit appreciated. Bulk reuse of the
        underlying dataset is permitted under <a href="/methodology">our terms</a> with
        attribution and a link back to the source list. Republishing entire pages without
        attribution is not permitted.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        Site copy, methodology, scoring formulas, and editorial commentary are © Top 11. Third-party
        names, logos, and trademarks remain the property of their respective owners.
      </p>

      <h2>6. Warranties and liability</h2>
      <p>
        Top 11 is provided &ldquo;as is&rdquo; without warranties of any kind. We strive for
        accuracy but make no guarantee. Top 11&rsquo;s aggregate liability for any claim is limited
        to USD $100.
      </p>

      <h2>7. Governing law</h2>
      <p>
        These terms are governed by the laws of England and Wales, without regard to conflicts
        of law principles.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these terms. Material changes will be reflected in the &ldquo;Effective&rdquo;
        date above. Continued use of the site after a change constitutes acceptance of the new
        terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href="mailto:hello@topelevens.com">hello@topelevens.com</a>.
      </p>
    </article>
  );
}
