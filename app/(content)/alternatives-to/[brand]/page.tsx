import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allBrandSlugs, allEntriesByBrand, brandSlug, lookupBrand } from "@/lib/matchups";
import {
  breadcrumbJsonLd,
  organizationJsonLd,
  personJsonLd,
  SITE_NAME,
  SITE_URL,
} from "@/lib/schema";
import { getList, listSlugs } from "@/lib/lists";

export function generateStaticParams() {
  return allBrandSlugs().map((brand) => ({ brand }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  const ref = lookupBrand(brand);
  if (!ref) return {};
  const title = `Alternatives to ${ref.entry.name} (2026) — Top 11 independently ranked`;
  const desc = `Looking for an alternative to ${ref.entry.name}? Here are the better-ranked options from the Top 11 ${ref.list.title}, with scores, pricing, and verdicts.`;
  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/alternatives-to/${brand}` },
    openGraph: { title, description: desc, url: `${SITE_URL}/alternatives-to/${brand}`, type: "article" },
  };
}

export default async function AlternativesPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const ref = lookupBrand(brand);
  if (!ref) notFound();

  // All lists this brand appears in, plus all OTHER entries in those lists.
  const refs = allEntriesByBrand().get(brand) || [];
  const candidateLists = Array.from(new Set(refs.map((r) => r.list.slug))).map((s) => getList(s)!).filter(Boolean);

  // Higher-ranked alternatives across all candidate lists.
  const higher = candidateLists.flatMap((l) =>
    l.entries
      .filter((e) => brandSlug(e.name) !== brand && refs.some((r) => r.list.slug === l.slug && e.rank < r.entry.rank))
      .map((e) => ({ list: l, entry: e })),
  );
  // If brand is #1, show the rest of the list as alternatives.
  const fallback = candidateLists.flatMap((l) =>
    l.entries.filter((e) => brandSlug(e.name) !== brand).map((e) => ({ list: l, entry: e })),
  );
  const alternatives = (higher.length ? higher : fallback).slice(0, 11);

  const breadcrumbLd = breadcrumbJsonLd([
    { name: SITE_NAME, url: SITE_URL },
    { name: "Alternatives", url: `${SITE_URL}/directory` },
    { name: `Alternatives to ${ref.entry.name}`, url: `${SITE_URL}/alternatives-to/${brand}` },
  ]);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/alternatives-to/${brand}#itemlist`,
    name: `Alternatives to ${ref.entry.name}`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: alternatives.length,
    itemListElement: alternatives.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.entry.name,
      url: a.entry.url,
      description: a.entry.verdict_short || a.entry.verdict,
    })),
  };

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

      <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-widest text-ink/45 mb-3 flex flex-wrap gap-1.5">
        <Link href="/" className="hover:text-ink/70">Top 11</Link>
        <span>›</span>
        <Link href="/directory" className="hover:text-ink/70">Alternatives</Link>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.08] mb-3">
        Alternatives to {ref.entry.name}
      </h1>
      <p className="text-lg text-ink/65 leading-snug mb-3 max-w-2xl">
        {ref.entry.name} ranks <strong>#{ref.entry.rank}</strong> on the Top 11 {ref.list.title}. Below: the higher-ranked alternatives we&rsquo;d steer you to instead, by use case.
      </p>
      <p className="text-xs text-ink/50 mb-10">
        Verified <time dateTime={ref.list.last_verified}>{new Date(ref.list.last_verified).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>. No paid placement — see{" "}
        <Link href="/methodology" className="underline">methodology</Link>.
      </p>

      {alternatives.length === 0 ? (
        <p className="text-ink/60">No higher-ranked alternatives in our index for this niche. See the full <Link href={`/${ref.list.slug}`} className="underline">{ref.list.title}</Link>.</p>
      ) : (
        <ol className="space-y-5 mb-12">
          {alternatives.map((a) => (
            <li key={`${a.list.slug}-${a.entry.rank}`} className="rounded-xl border border-ink/15 p-5">
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <h2 className="text-lg font-extrabold tracking-tight">
                  <span className="text-ink/45 font-mono text-sm mr-2">#{a.entry.rank}</span>
                  <Link href={`/${a.list.slug}#rank-${a.entry.rank}`} className="hover:underline">{a.entry.name}</Link>
                </h2>
                <span className="font-mono text-xs text-ink/55">{a.entry.score_out_of_94 ?? "—"} / 9.4</span>
              </div>
              <p className="text-sm text-ink/70 leading-relaxed mb-2">{a.entry.verdict_short || a.entry.verdict}</p>
              <p className="text-xs text-ink/45">
                Best for: {a.entry.best_for_short || a.entry.best_for || "—"} · Pricing: {a.entry.pricing_band || "—"}
                {a.entry.url ? <> · <a href={a.entry.url} target="_blank" rel="noopener" className="underline">{a.entry.url.replace(/^https?:\/\//, "")}</a></> : null}
              </p>
            </li>
          ))}
        </ol>
      )}

      <p className="text-xs text-ink/50 mt-12">
        See the full ranked list: <Link href={`/${ref.list.slug}`} className="underline">{ref.list.title}</Link>. Or compare any two:{" "}
        <Link href={`/vs/${brand}-vs-${brandSlug(alternatives[0]?.entry.name || ref.entry.name)}`} className="underline">side-by-side</Link>.
      </p>
    </article>
  );
}
