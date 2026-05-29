import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListSlice from "@/app/components/ListSlice";
import { compliant, compliancesFor } from "@/lib/slices";
import { listSlugs } from "@/lib/lists";
import { breadcrumbJsonLd, organizationJsonLd, personJsonLd, SITE_NAME, SITE_URL } from "@/lib/schema";

export function generateStaticParams() {
  return listSlugs().flatMap((slug) => compliancesFor(slug).map((standard) => ({ slug, standard })));
}
export const dynamicParams = false;

function pretty(s: string) { return s.toUpperCase(); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string; standard: string }> }): Promise<Metadata> {
  const { slug, standard } = await params;
  const r = compliant(slug, standard);
  if (!r) return {};
  return {
    title: `Top 11 ${pretty(standard)}-compliant ${r.list.vertical.toLowerCase()} (2026)`,
    description: `Providers in the Top 11 ${r.list.title} that hold ${pretty(standard)} compliance.`,
    alternates: { canonical: `${SITE_URL}/compliant/${slug}/${standard}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string; standard: string }> }) {
  const { slug, standard } = await params;
  const r = compliant(slug, standard);
  if (!r) notFound();
  const top = r.entries[0];
  const lead = top
    ? `${top.name} is the highest-ranked Top 11 ${r.list.title} provider holding ${pretty(standard)} compliance.`
    : `No Top 11 ${r.list.title} entry currently documents ${pretty(standard)} compliance.`;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: SITE_NAME, url: SITE_URL },
        { name: r.list.title, url: `${SITE_URL}/${slug}` },
        { name: `${pretty(standard)}-compliant`, url: `${SITE_URL}/compliant/${slug}/${standard}` },
      ])) }} />
      <ListSlice
        result={r}
        heading={`Top 11 ${pretty(standard)}-compliant ${r.list.vertical.toLowerCase()}`}
        leadAnswer={lead}
        filterExplain={`Filtered to entries that publicly document ${pretty(standard)} compliance (in their security page, trust center, or marketing collateral). "In progress" claims do not qualify.`}
        crumbTrailLabel={`${pretty(standard)}-compliant`}
        metric={(e) => (e.compliance || []).join(", ") || "—"}
      />
    </>
  );
}
