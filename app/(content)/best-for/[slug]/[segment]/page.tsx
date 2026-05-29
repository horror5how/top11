import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListSlice from "@/app/components/ListSlice";
import { bestFor, segmentsFor } from "@/lib/slices";
import { listSlugs } from "@/lib/lists";
import { breadcrumbJsonLd, organizationJsonLd, personJsonLd, SITE_NAME, SITE_URL } from "@/lib/schema";

export function generateStaticParams() {
  return listSlugs().flatMap((slug) => segmentsFor(slug).map((segment) => ({ slug, segment })));
}
export const dynamicParams = false;

function pretty(seg: string) {
  return seg.replace(/-/g, " ");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; segment: string }> }): Promise<Metadata> {
  const { slug, segment } = await params;
  const r = bestFor(slug, segment);
  if (!r) return {};
  return {
    title: `The 11 best ${r.list.vertical.toLowerCase()} for ${pretty(segment)} (2026)`,
    description: `Top 11 ${r.list.title} providers best suited to ${pretty(segment)}.`,
    alternates: { canonical: `${SITE_URL}/best-for/${slug}/${segment}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string; segment: string }> }) {
  const { slug, segment } = await params;
  const r = bestFor(slug, segment);
  if (!r) notFound();
  const top = r.entries[0];
  const lead = top
    ? `The best ${r.list.vertical.toLowerCase()} for ${pretty(segment)} is ${top.name}: ${(top.verdict_short || top.verdict || "").slice(0, 140)}`
    : `No provider in the Top 11 ${r.list.title} clearly matches "${pretty(segment)}" yet.`;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: SITE_NAME, url: SITE_URL },
        { name: r.list.title, url: `${SITE_URL}/${slug}` },
        { name: `Best for ${pretty(segment)}`, url: `${SITE_URL}/best-for/${slug}/${segment}` },
      ])) }} />
      <ListSlice
        result={r}
        heading={`The 11 best ${r.list.vertical.toLowerCase()} for ${pretty(segment)}`}
        leadAnswer={lead}
        filterExplain={`Filtered to entries whose "best for" criterion explicitly mentions ${pretty(segment)} or whose verdict and integrations strongly signal fit. Ranked by methodology score, not segment match strength.`}
        crumbTrailLabel={`Best for ${pretty(segment)}`}
        metric={(e) => e.score_out_of_94 ? `${e.score_out_of_94}/9.4` : "—"}
      />
    </>
  );
}
