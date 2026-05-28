import type { Metadata } from "next";
import { SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Top 11 collects, uses, and protects information.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 prose prose-neutral">
      <h1>Privacy Policy</h1>
      <p>
        <em>Effective: May 28, 2026.</em>
      </p>

      <h2>Summary</h2>
      <p>
        Top 11 is a public, read-only ranking site. We do not require accounts to read lists. We
        collect minimal data necessary to operate the site and improve rankings.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Server logs.</strong> Standard HTTP request logs (IP address, user-agent, URL,
          timestamp) retained up to 30 days for security and abuse detection.
        </li>
        <li>
          <strong>Aggregate analytics.</strong> Anonymous, aggregated page-view and performance
          metrics via privacy-respecting analytics (no cross-site tracking, no advertising cookies).
        </li>
        <li>
          <strong>Voluntary submissions.</strong> If you submit a complaint, vote on an entry, or
          email us, we retain your message and any contact details you provide.
        </li>
      </ul>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not sell personal data.</li>
        <li>We do not run third-party advertising trackers.</li>
        <li>We do not require sign-up to read content.</li>
        <li>We do not share user data with the providers we rank.</li>
      </ul>

      <h2>AI agents and crawlers</h2>
      <p>
        Top 11 is designed for AI agents to read. We log AI crawler hits to improve our agent
        manifest, but do not collect data about the end users of those agents.
      </p>

      <h2>Your rights</h2>
      <p>
        EU / UK / California residents: you have the right to access, correct, or delete personal
        data we hold about you. Email{" "}
        <a href="mailto:hello@topelevens.com">hello@topelevens.com</a> with the subject line
        &ldquo;Privacy request&rdquo;.
      </p>

      <h2>Cookies</h2>
      <p>
        We use only strictly necessary cookies (for example, to remember preferences set on the
        site). We do not set advertising or cross-site tracking cookies.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions: <a href="mailto:hello@topelevens.com">hello@topelevens.com</a>.
      </p>
    </article>
  );
}
