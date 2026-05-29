import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allBrandSlugs, allEntriesByBrand, lookupBrand } from "@/lib/matchups";
import { breadcrumbJsonLd, organizationJsonLd, personJsonLd, SITE_NAME, SITE_URL } from "@/lib/schema";

export function generateStaticParams() { return allBrandSlugs().map((brand) => ({ brand })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  const ref = lookupBrand(brand);
  if (!ref) return {};
  const level = ref.entry.risk_signals?.level || "none";
  const title = `${ref.entry.name} red flags & complaints (2026) — Top 11 risk report`;
  const desc = `Verified public risk signals for ${ref.entry.name}: ${level}. What we found across data breaches, lawsuits, billing complaints, and review trends.`;
  return { title, description: desc, alternates: { canonical: `${SITE_URL}/red-flags/${brand}` } };
}

export default async function Page({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const ref = lookupBrand(brand);
  if (!ref) notFound();
  const allRefs = allEntriesByBrand().get(brand) || [];
  const e = ref.entry;
  const signals = e.risk_signals?.signals || [];

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 prose prose-neutral">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: SITE_NAME, url: SITE_URL },
        { name: ref.list.title, url: `${SITE_URL}/${ref.list.slug}` },
        { name: `${e.name} red flags`, url: `${SITE_URL}/red-flags/${brand}` },
      ])) }} />

      <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-widest text-ink/45 mb-3 flex flex-wrap gap-1.5 not-prose">
        <Link href="/" className="hover:text-ink/70">Top 11</Link>
        <span>›</span>
        <Link href={`/${ref.list.slug}`} className="hover:text-ink/70">{ref.list.title}</Link>
        <span>›</span>
        <span className="text-ink/55">{e.name} red flags</span>
      </nav>

      <h1>{e.name} red flags &amp; complaints</h1>
      <p className="lead">
        Verified public risk signal level for {e.name}: <strong>{e.risk_signals?.level || "none"}</strong> (as of{" "}
        {e.risk_signals?.checked ? new Date(e.risk_signals.checked).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}).
      </p>
      <p>{e.risk_signals?.summary || "No risk signals report has been compiled yet for this provider."}</p>

      {signals.length ? (
        <>
          <h2>Signals on file</h2>
          {signals.map((s, i) => (
            <div key={i} className="not-prose rounded-xl border border-ink/15 p-4 mb-3">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink/55 mb-1">
                {s.category} · {s.level}{s.date_observed ? ` · ${s.date_observed}` : ""}
              </p>
              <p className="text-sm">{s.note}</p>
              {s.source_url ? <p className="text-xs mt-1"><a href={s.source_url} target="_blank" rel="noopener" className="underline">Source</a></p> : null}
            </div>
          ))}
        </>
      ) : (
        <>
          <h2>Signals on file</h2>
          <p>None. We searched data breaches, court filings, BBB billing complaints, and support-rating trend lines — nothing material surfaced as of our last verification.</p>
        </>
      )}

      <h2>What customers criticise (separate from risk signals)</h2>
      <p>{e.criticism || "No formal criticism summary recorded yet."}</p>

      <h2>If you&rsquo;re reconsidering</h2>
      <p>
        See <Link href={`/alternatives-to/${brand}`}>alternatives to {e.name}</Link>, or read the full{" "}
        <Link href={`/review/${brand}`}>{e.name} review</Link>.
      </p>

      {allRefs.length > 1 ? (
        <>
          <h2>Where else this brand ranks</h2>
          <ul>{allRefs.map((r) => (<li key={r.list.slug}><Link href={`/${r.list.slug}#rank-${r.entry.rank}`}>{r.list.title} — #{r.entry.rank}</Link></li>))}</ul>
        </>
      ) : null}

      <p className="text-sm text-ink/55 not-prose mt-12">
        Source: Top 11 risk-signal review, last checked{" "}
        {e.risk_signals?.checked ? new Date(e.risk_signals.checked).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}.{" "}
        We publish complaints, not compliments. <Link href={`/${ref.list.slug}#gripe-box`}>File a new complaint</Link>.
      </p>
    </article>
  );
}
