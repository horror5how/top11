import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allMatchupSlugs, brandSlug, lookupBrand, parseMatchup } from "@/lib/matchups";
import {
  breadcrumbJsonLd,
  organizationJsonLd,
  personJsonLd,
  SITE_NAME,
  SITE_URL,
} from "@/lib/schema";

export function generateStaticParams() {
  return allMatchupSlugs().map((matchup) => ({ matchup }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ matchup: string }> }): Promise<Metadata> {
  const { matchup } = await params;
  const parsed = parseMatchup(matchup);
  if (!parsed) return {};
  const [aSlug, bSlug] = parsed;
  const a = lookupBrand(aSlug);
  const b = lookupBrand(bSlug);
  if (!a || !b) return {};
  const title = `${a.entry.name} vs ${b.entry.name} (${a.list.vertical}, 2026) — independently ranked`;
  const desc = `Side-by-side: ${a.entry.name} (Top 11 #${a.entry.rank} in ${a.list.title}) vs ${b.entry.name} (#${b.entry.rank}). Verdicts, pricing, scores. No paid placement.`;
  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/vs/${matchup}` },
    openGraph: { title, description: desc, url: `${SITE_URL}/vs/${matchup}`, type: "article" },
  };
}

export default async function VsPage({ params }: { params: Promise<{ matchup: string }> }) {
  const { matchup } = await params;
  const parsed = parseMatchup(matchup);
  if (!parsed) notFound();
  const [aSlug, bSlug] = parsed;
  const a = lookupBrand(aSlug);
  const b = lookupBrand(bSlug);
  if (!a || !b) notFound();

  const sameList = a.list.slug === b.list.slug;
  const winner = a.entry.rank < b.entry.rank ? a : b;
  const loser = winner === a ? b : a;

  const breadcrumbLd = breadcrumbJsonLd([
    { name: SITE_NAME, url: SITE_URL },
    { name: "Comparisons", url: `${SITE_URL}/directory` },
    { name: `${a.entry.name} vs ${b.entry.name}`, url: `${SITE_URL}/vs/${matchup}` },
  ]);

  const compareLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}/vs/${matchup}#article`,
    headline: `${a.entry.name} vs ${b.entry.name} — independently ranked`,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    author: { "@id": `${SITE_URL}/authors/hayat-amin#person` },
    datePublished: a.list.published,
    dateModified: a.list.last_verified,
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: winner.entry.name,
          url: winner.entry.url,
          description: `Top 11 #${winner.entry.rank} in ${winner.list.title}.`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: loser.entry.name,
          url: loser.entry.url,
          description: `Top 11 #${loser.entry.rank} in ${loser.list.title}.`,
        },
      ],
    },
  };

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(compareLd) }} />

      <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-widest text-ink/45 mb-3 flex flex-wrap gap-1.5">
        <Link href="/" className="hover:text-ink/70">Top 11</Link>
        <span>›</span>
        <Link href="/directory" className="hover:text-ink/70">Comparisons</Link>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.08] mb-3">
        {a.entry.name} <span className="text-ink/35">vs</span> {b.entry.name}
      </h1>
      <p className="text-lg text-ink/65 leading-snug mb-8">
        Side-by-side from the Top 11 ranking{sameList ? <> of <Link href={`/${a.list.slug}`} className="underline">{a.list.title}</Link></> : <>s of <Link href={`/${a.list.slug}`} className="underline">{a.list.title}</Link> and <Link href={`/${b.list.slug}`} className="underline">{b.list.title}</Link></>}.
        Last verified {new Date(a.list.last_verified).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
      </p>

      <div className="rounded-2xl border border-ink/15 bg-ink/[0.02] p-5 mb-8">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink/45 mb-2">The short answer</p>
        <p className="text-[17px] leading-relaxed text-ink/90">
          <strong>{winner.entry.name}</strong> ranks higher on Top 11 (#{winner.entry.rank} vs #{loser.entry.rank}) for{" "}
          {sameList ? a.list.audience : `${a.list.audience} / ${b.list.audience}`}. {winner.entry.verdict_short || winner.entry.verdict}
        </p>
      </div>

      <h2 className="text-xl font-extrabold tracking-tight mb-4">At a glance</h2>
      <div className="overflow-x-auto -mx-6 sm:mx-0 mb-12">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-ink/15">
              <th className="py-2 pr-4 font-semibold text-ink/55"></th>
              <th className="py-2 pr-4 font-extrabold">{a.entry.name}</th>
              <th className="py-2 pr-4 font-extrabold">{b.entry.name}</th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr className="border-b border-ink/10"><td className="py-3 pr-4 text-ink/55">Top 11 rank</td><td className="py-3 pr-4 font-mono">#{a.entry.rank} / {a.list.title}</td><td className="py-3 pr-4 font-mono">#{b.entry.rank} / {b.list.title}</td></tr>
            <tr className="border-b border-ink/10"><td className="py-3 pr-4 text-ink/55">Score (out of 9.4)</td><td className="py-3 pr-4 font-mono">{a.entry.score_out_of_94 ?? "—"}</td><td className="py-3 pr-4 font-mono">{b.entry.score_out_of_94 ?? "—"}</td></tr>
            <tr className="border-b border-ink/10"><td className="py-3 pr-4 text-ink/55">Best for</td><td className="py-3 pr-4">{a.entry.best_for_short || a.entry.best_for || "—"}</td><td className="py-3 pr-4">{b.entry.best_for_short || b.entry.best_for || "—"}</td></tr>
            <tr className="border-b border-ink/10"><td className="py-3 pr-4 text-ink/55">Pricing</td><td className="py-3 pr-4">{a.entry.pricing_band || "—"}</td><td className="py-3 pr-4">{b.entry.pricing_band || "—"}</td></tr>
            <tr className="border-b border-ink/10"><td className="py-3 pr-4 text-ink/55">HQ</td><td className="py-3 pr-4">{a.entry.hq || "—"}</td><td className="py-3 pr-4">{b.entry.hq || "—"}</td></tr>
            <tr className="border-b border-ink/10"><td className="py-3 pr-4 text-ink/55">Founded</td><td className="py-3 pr-4">{a.entry.founded || "—"}</td><td className="py-3 pr-4">{b.entry.founded || "—"}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-12">
        <div className="rounded-xl border border-ink/15 p-5">
          <h3 className="text-lg font-extrabold tracking-tight mb-2">{a.entry.name}</h3>
          <p className="text-sm text-ink/70 leading-relaxed mb-3">{a.entry.verdict_short || a.entry.verdict}</p>
          {a.entry.url ? <a href={a.entry.url} target="_blank" rel="noopener" className="text-xs underline">{a.entry.url.replace(/^https?:\/\//, "")}</a> : null}
          <p className="text-xs text-ink/45 mt-3"><Link href={`/${a.list.slug}#rank-${a.entry.rank}`} className="underline">See full entry in {a.list.title}</Link></p>
        </div>
        <div className="rounded-xl border border-ink/15 p-5">
          <h3 className="text-lg font-extrabold tracking-tight mb-2">{b.entry.name}</h3>
          <p className="text-sm text-ink/70 leading-relaxed mb-3">{b.entry.verdict_short || b.entry.verdict}</p>
          {b.entry.url ? <a href={b.entry.url} target="_blank" rel="noopener" className="text-xs underline">{b.entry.url.replace(/^https?:\/\//, "")}</a> : null}
          <p className="text-xs text-ink/45 mt-3"><Link href={`/${b.list.slug}#rank-${b.entry.rank}`} className="underline">See full entry in {b.list.title}</Link></p>
        </div>
      </div>

      <p className="text-xs text-ink/50 mt-12">
        Methodology and scoring weights live at <Link href="/methodology" className="underline">/methodology</Link>. No vendor pays for placement — see{" "}
        <Link href="/about" className="underline">about</Link>.
      </p>
    </article>
  );
}
