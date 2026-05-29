import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allBrandSlugs, allEntriesByBrand, brandSlug, lookupBrand } from "@/lib/matchups";
import { breadcrumbJsonLd, organizationJsonLd, personJsonLd, SITE_NAME, SITE_URL } from "@/lib/schema";

export function generateStaticParams() { return allBrandSlugs().map((brand) => ({ brand })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  const ref = lookupBrand(brand);
  if (!ref) return {};
  const title = `${ref.entry.name} review (2026) — Top 11 independent ranking`;
  const desc = `Independent review of ${ref.entry.name}: rank #${ref.entry.rank} in ${ref.list.title}, score ${ref.entry.score_out_of_94}/9.4, pricing ${ref.entry.pricing_band}. Praise, criticism, alternatives.`;
  return { title, description: desc, alternates: { canonical: `${SITE_URL}/review/${brand}` }, openGraph: { type: "article", title, description: desc, url: `${SITE_URL}/review/${brand}` } };
}

export default async function Page({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const ref = lookupBrand(brand);
  if (!ref) notFound();
  const allRefs = allEntriesByBrand().get(brand) || [];
  const e = ref.entry as typeof ref.entry & {
    price_min?: number | null; price_max?: number | null;
    integrations?: string[]; compliance?: string[]; regions?: string[];
    onboarding_days?: number | null; free_tier?: boolean;
  };

  const reviewLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    "@id": `${SITE_URL}/review/${brand}#review`,
    itemReviewed: { "@type": "Service", name: e.name, url: e.url, provider: { "@id": `${SITE_URL}/#organization` } },
    author: { "@id": `${SITE_URL}/authors/hayat-amin#person` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    datePublished: ref.list.last_verified,
    reviewBody: e.verdict,
    reviewRating: { "@type": "Rating", ratingValue: e.score_out_of_94, bestRating: 9.4, worstRating: 0 },
    positiveNotes: e.praise ? { "@type": "ItemList", itemListElement: [{ "@type": "ListItem", position: 1, name: e.praise_short || e.praise }] } : undefined,
    negativeNotes: e.criticism ? { "@type": "ItemList", itemListElement: [{ "@type": "ListItem", position: 1, name: e.criticism_short || e.criticism }] } : undefined,
  };

  const offerLd = e.price_min ? {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: `${e.name} — starting price`,
    priceCurrency: "USD",
    price: e.price_min,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: e.price_min,
      priceCurrency: "USD",
      referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
    },
    availability: "https://schema.org/InStock",
    url: e.url,
  } : null;

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 prose prose-neutral">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewLd) }} />
      {offerLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: SITE_NAME, url: SITE_URL },
        { name: ref.list.title, url: `${SITE_URL}/${ref.list.slug}` },
        { name: `${e.name} review`, url: `${SITE_URL}/review/${brand}` },
      ])) }} />

      <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-widest text-ink/45 mb-3 flex flex-wrap gap-1.5 not-prose">
        <Link href="/" className="hover:text-ink/70">Top 11</Link>
        <span>›</span>
        <Link href={`/${ref.list.slug}`} className="hover:text-ink/70">{ref.list.title}</Link>
        <span>›</span>
        <span className="text-ink/55">{e.name}</span>
      </nav>

      <h1>{e.name} review</h1>
      <p className="lead">{e.verdict_short || e.verdict}</p>

      <div className="not-prose rounded-2xl border border-ink/15 bg-ink/[0.02] p-5 my-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div><p className="text-ink/45 text-xs">Top 11 rank</p><p className="font-mono font-bold">#{e.rank} of {ref.list.entries.length}</p></div>
        <div><p className="text-ink/45 text-xs">Score</p><p className="font-mono font-bold">{e.score_out_of_94}/9.4</p></div>
        <div><p className="text-ink/45 text-xs">Pricing</p><p className="font-mono">{e.pricing_band || "—"}</p></div>
        <div><p className="text-ink/45 text-xs">HQ</p><p className="font-mono">{e.hq || "—"}</p></div>
      </div>

      <h2>Verdict</h2>
      <p>{e.verdict}</p>

      <h2>What customers praise</h2>
      <p>{e.praise || "No praise summary recorded yet."}</p>

      <h2>What customers criticise</h2>
      <p>{e.criticism || "No criticism summary recorded yet."}</p>

      <h2>Best for</h2>
      <p>{e.best_for}</p>

      {e.integrations?.length || e.compliance?.length ? (
        <>
          <h2>At a glance</h2>
          <ul>
            {e.integrations?.length ? <li><strong>Integrations:</strong> {e.integrations.join(", ")}</li> : null}
            {e.compliance?.length ? <li><strong>Compliance:</strong> {e.compliance.join(", ")}</li> : null}
            {e.regions?.length ? <li><strong>Regions served:</strong> {e.regions.join(", ")}</li> : null}
            {e.onboarding_days != null ? <li><strong>Typical onboarding:</strong> {e.onboarding_days} day{e.onboarding_days === 1 ? "" : "s"}</li> : null}
            {e.free_tier ? <li><strong>Free tier:</strong> yes</li> : null}
          </ul>
        </>
      ) : null}

      <h2>Red flags</h2>
      <p>
        Public risk signals as of {new Date(ref.list.last_verified).toLocaleDateString("en-US", { month: "long", year: "numeric" })}:{" "}
        <strong>{e.risk_signals?.level || "none"}</strong>. {e.risk_signals?.summary || "No major public risk signals found."}{" "}
        <Link href={`/red-flags/${brand}`}>See the full red-flag report</Link>.
      </p>

      <h2>Alternatives</h2>
      <p>
        See <Link href={`/alternatives-to/${brand}`}>alternatives to {e.name}</Link>, or compare against the next-ranked entry:{" "}
        {ref.list.entries[ref.entry.rank] ? (
          <Link href={`/vs/${brand}-vs-${brandSlug(ref.list.entries[ref.entry.rank].name)}`}>
            {e.name} vs {ref.list.entries[ref.entry.rank].name}
          </Link>
        ) : null}.
      </p>

      {allRefs.length > 1 ? (
        <>
          <h2>Where else this brand ranks</h2>
          <ul>
            {allRefs.map((r) => (
              <li key={r.list.slug}><Link href={`/${r.list.slug}#rank-${r.entry.rank}`}>{r.list.title} — #{r.entry.rank}</Link></li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="text-sm text-ink/55 not-prose mt-12">
        Source: Top 11 {ref.list.title}, verified {new Date(ref.list.last_verified).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} — no paid placement.
      </p>
    </article>
  );
}
