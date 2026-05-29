import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListSlice from "@/app/components/ListSlice";
import { worksWith, integrationsFor } from "@/lib/slices";
import { listSlugs } from "@/lib/lists";
import { breadcrumbJsonLd, organizationJsonLd, personJsonLd, SITE_NAME, SITE_URL } from "@/lib/schema";

export function generateStaticParams() {
  return listSlugs().flatMap((slug) => integrationsFor(slug).map((tool) => ({ slug, tool })));
}
export const dynamicParams = false;

function pretty(t: string) { return t.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string; tool: string }> }): Promise<Metadata> {
  const { slug, tool } = await params;
  const r = worksWith(slug, tool);
  if (!r) return {};
  return {
    title: `Top 11 ${r.list.vertical.toLowerCase()} that work with ${pretty(tool)} (2026)`,
    description: `Providers in the Top 11 ${r.list.title} that integrate with ${pretty(tool)}.`,
    alternates: { canonical: `${SITE_URL}/works-with/${slug}/${tool}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string; tool: string }> }) {
  const { slug, tool } = await params;
  const r = worksWith(slug, tool);
  if (!r) notFound();
  const top = r.entries[0];
  const lead = top
    ? `${top.name} is the highest-ranked provider in the Top 11 ${r.list.title} that integrates with ${pretty(tool)}.`
    : `No Top 11 ${r.list.title} entry currently documents a ${pretty(tool)} integration.`;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: SITE_NAME, url: SITE_URL },
        { name: r.list.title, url: `${SITE_URL}/${slug}` },
        { name: `Works with ${pretty(tool)}`, url: `${SITE_URL}/works-with/${slug}/${tool}` },
      ])) }} />
      <ListSlice
        result={r}
        heading={`Top 11 ${r.list.vertical.toLowerCase()} that work with ${pretty(tool)}`}
        leadAnswer={lead}
        filterExplain={`Filtered to entries that publicly document a ${pretty(tool)} integration. We do not include "API available" as proof of integration — there has to be a named connector or first-class workflow.`}
        crumbTrailLabel={`Works with ${pretty(tool)}`}
        metric={(e) => e.score_out_of_94 ? `${e.score_out_of_94}/9.4` : "—"}
      />
    </>
  );
}
