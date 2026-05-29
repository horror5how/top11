import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getList, listSlugs } from "@/lib/lists";
import { breadcrumbJsonLd, organizationJsonLd, personJsonLd, SITE_NAME, SITE_URL } from "@/lib/schema";

export function generateStaticParams() { return listSlugs().map((slug) => ({ slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const list = getList(slug);
  if (!list) return {};
  const term = (list as { glossary?: { term?: string } }).glossary?.term || list.vertical;
  return {
    title: `What is a ${term.toLowerCase()}? — Plain-English explainer`,
    description: `What a ${term.toLowerCase()} actually is, who uses one, what it costs, and how to pick one (with the Top 11 ranking).`,
    alternates: { canonical: `${SITE_URL}/what-is/${slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = getList(slug);
  if (!list) notFound();
  const glossary = (list as { glossary?: { term?: string; definition?: string; faq?: { q: string; a: string }[] } }).glossary || {};
  const term = glossary.term || list.vertical;
  const def = glossary.definition || list.answer_capsule || list.subtitle;

  const questionLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: `What is a ${term.toLowerCase()}?`,
      text: `What is a ${term.toLowerCase()}?`,
      acceptedAnswer: { "@type": "Answer", text: def },
    },
  };

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 prose prose-neutral">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: SITE_NAME, url: SITE_URL },
        { name: list.title, url: `${SITE_URL}/${slug}` },
        { name: `What is a ${term}?`, url: `${SITE_URL}/what-is/${slug}` },
      ])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(questionLd) }} />

      <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-widest text-ink/45 mb-3 flex flex-wrap gap-1.5 not-prose">
        <Link href="/" className="hover:text-ink/70">Top 11</Link>
        <span>›</span>
        <Link href={`/${slug}`} className="hover:text-ink/70">{list.title}</Link>
        <span>›</span>
        <span className="text-ink/55">What is a {term.toLowerCase()}?</span>
      </nav>

      <h1>What is a {term.toLowerCase()}?</h1>
      <p className="lead">{def}</p>

      <h2>Who uses one?</h2>
      <p>{list.audience}</p>

      <h2>What does it cost?</h2>
      <p>Pricing varies. The cheapest provider in our Top 11 starts around $
        {(list.entries[list.entries.length - 1] as { price_min?: number }).price_min ||
         (list.entries[0] as { price_min?: number }).price_min || "—"}/mo. See the{" "}
        <Link href={`/cheapest/${slug}`}>cheapest providers</Link> ranked.
      </p>

      <h2>How do I pick one?</h2>
      <p>
        Read the full <Link href="/methodology">methodology</Link> for our 9.4-point scoring framework, then look at the canonical{" "}
        <Link href={`/${slug}`}>{list.title}</Link>. If you want a slice of the ranking by price, fit, or compliance, jump to:{" "}
        <Link href={`/cheapest/${slug}`}>cheapest</Link> ·{" "}
        <Link href={`/highest-rated/${slug}`}>highest-rated</Link> ·{" "}
        <Link href={`/fastest/${slug}`}>fastest onboarding</Link>.
      </p>

      {glossary.faq?.length ? (
        <>
          <h2>FAQ</h2>
          {glossary.faq.map((f, i) => (
            <div key={i}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </>
      ) : null}

      <p className="text-sm text-ink/55 not-prose mt-12">
        Source: Top 11 {list.title}, verified{" "}
        {new Date(list.last_verified).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
      </p>
    </article>
  );
}
