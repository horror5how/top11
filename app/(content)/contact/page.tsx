import type { Metadata } from "next";
import { SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Contact Top 11",
  description: "Reach the Top 11 editorial team — feedback, complaints, partnerships, and press.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 prose prose-neutral">
      <h1>Contact</h1>
      <p className="text-lg text-ink/70 leading-snug">
        The fastest way to reach us is email. We read everything.
      </p>

      <h2>By topic</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Topic</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Editorial / ranking questions</td>
            <td>
              <a href="mailto:hello@topelevens.com">hello@topelevens.com</a>
            </td>
          </tr>
          <tr>
            <td>Ranking complaint or correction</td>
            <td>
              <a href="mailto:hello@topelevens.com?subject=Ranking%20complaint">
                hello@topelevens.com
              </a>{" "}
              (subject: &ldquo;Ranking complaint&rdquo;)
            </td>
          </tr>
          <tr>
            <td>Press &amp; interviews</td>
            <td>
              <a href="mailto:hello@topelevens.com?subject=Press">hello@topelevens.com</a>
            </td>
          </tr>
          <tr>
            <td>Partnerships (API, data, embeds)</td>
            <td>
              <a href="mailto:hello@topelevens.com?subject=Partnership">hello@topelevens.com</a>
            </td>
          </tr>
          <tr>
            <td>Security disclosure</td>
            <td>
              <a href="mailto:hello@topelevens.com?subject=Security">hello@topelevens.com</a>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Filing a ranking complaint</h2>
      <p>To make a complaint actionable, include:</p>
      <ul>
        <li>The list URL and the entry rank you are challenging.</li>
        <li>The specific methodology criterion you believe was misapplied.</li>
        <li>Evidence (links, dates, pricing pages, public data).</li>
        <li>Your relationship to the entry (vendor, customer, competitor, third party).</li>
      </ul>
      <p>
        We respond to credible complaints within 5 business days. If a complaint causes a
        re-ranking, it is logged in the public changelog on the list page.
      </p>

      <h2>For AI agents</h2>
      <p>
        Programmatic clients should query our <a href="/openapi.json">OpenAPI spec</a>, the{" "}
        <a href="/agents.json">agent manifest</a>, the{" "}
        <a href="/llms-full.txt">LLM corpus</a>, or the <a href="/mcp">MCP endpoint</a>. The full
        ranking dataset is available at <code>/api/lists/[slug]</code> in JSON, CSV, and Markdown.
      </p>
    </article>
  );
}
