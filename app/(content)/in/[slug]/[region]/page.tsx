import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListSlice from "@/app/components/ListSlice";
import { inRegion, regionsFor } from "@/lib/slices";
import { listSlugs } from "@/lib/lists";
import { breadcrumbJsonLd, organizationJsonLd, personJsonLd, SITE_NAME, SITE_URL } from "@/lib/schema";

export function generateStaticParams() {
  return listSlugs().flatMap((slug) => regionsFor(slug).map((region) => ({ slug, region })));
}
export const dynamicParams = false;

const NAMES: Record<string, string> = { us: "the United States", uk: "the United Kingdom", eu: "Europe", canada: "Canada", global: "any region" };
function pretty(r: string) { return NAMES[r.toLowerCase()] || r.toUpperCase(); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string; region: string }> }): Promise<Metadata> {
  const { slug, region } = await params;
  const r = inRegion(slug, region);
  if (!r) return {};
  return {
    title: `Top 11 ${r.list.vertical.toLowerCase()} in ${pretty(region)} (2026)`,
    description: `Providers in the Top 11 ${r.list.title} serving ${pretty(region)}.`,
    alternates: { canonical: `${SITE_URL}/in/${slug}/${region}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string; region: string }> }) {
  const { slug, region } = await params;
  const r = inRegion(slug, region);
  if (!r) notFound();
  const top = r.entries[0];
  const lead = top
    ? `${top.name} is the highest-ranked Top 11 ${r.list.title} provider serving ${pretty(region)}.`
    : `No Top 11 ${r.list.title} entry currently lists ${pretty(region)} as a served region.`;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: SITE_NAME, url: SITE_URL },
        { name: r.list.title, url: `${SITE_URL}/${slug}` },
        { name: `In ${pretty(region)}`, url: `${SITE_URL}/in/${slug}/${region}` },
      ])) }} />
      <ListSlice
        result={r}
        heading={`Top 11 ${r.list.vertical.toLowerCase()} in ${pretty(region)}`}
        leadAnswer={lead}
        filterExplain={`Filtered to entries that explicitly serve ${pretty(region)} (either headquartered there or listing it as a supported region). Global-only providers always appear.`}
        crumbTrailLabel={`In ${pretty(region)}`}
        metric={(e) => (e.regions || []).join(", ") || "—"}
      />
    </>
  );
}
