import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListSlice from "@/app/components/ListSlice";
import { highestRated } from "@/lib/slices";
import { listSlugs } from "@/lib/lists";
import { breadcrumbJsonLd, organizationJsonLd, personJsonLd, SITE_NAME, SITE_URL } from "@/lib/schema";

export function generateStaticParams() { return listSlugs().map((slug) => ({ slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = highestRated(slug);
  if (!r) return {};
  return {
    title: `The 11 highest-rated ${r.list.vertical.toLowerCase()} (2026)`,
    description: `Top-scored providers in the Top 11 ${r.list.title}, sorted by our 9.4-point methodology.`,
    alternates: { canonical: `${SITE_URL}/highest-rated/${slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = highestRated(slug);
  if (!r) notFound();
  const top = r.entries[0];
  const lead = top
    ? `The highest-rated provider in the Top 11 ${r.list.title} is ${top.name} at ${top.score_out_of_94}/9.4${r.entries[1] ? `, followed by ${r.entries[1].name} (${r.entries[1].score_out_of_94}/9.4)` : ""}.`
    : "";
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: SITE_NAME, url: SITE_URL },
        { name: r.list.title, url: `${SITE_URL}/${slug}` },
        { name: "Highest-rated", url: `${SITE_URL}/highest-rated/${slug}` },
      ])) }} />
      <ListSlice
        result={r}
        heading={`The 11 highest-rated ${r.list.vertical.toLowerCase()}`}
        leadAnswer={lead}
        filterExplain={`Sorted by our 9.4-point composite score across ${r.list.methodology.criteria.length} weighted criteria (see /methodology). Identical to the canonical ranking when the canonical ranking is also score-ordered.`}
        crumbTrailLabel="Highest-rated"
        metric={(e) => e.score_out_of_94 ? `${e.score_out_of_94}/9.4` : "—"}
      />
    </>
  );
}
