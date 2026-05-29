import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListSlice from "@/app/components/ListSlice";
import { freeTier } from "@/lib/slices";
import { listSlugs } from "@/lib/lists";
import { breadcrumbJsonLd, organizationJsonLd, personJsonLd, SITE_NAME, SITE_URL } from "@/lib/schema";

export function generateStaticParams() { return listSlugs().map((slug) => ({ slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = freeTier(slug);
  if (!r) return {};
  return {
    title: `Free ${r.list.vertical.toLowerCase()} in the Top 11 (2026)`,
    description: `Providers in the Top 11 ${r.list.title} that offer a free tier.`,
    alternates: { canonical: `${SITE_URL}/free/${slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = freeTier(slug);
  if (!r) notFound();
  const lead = r.entries.length
    ? `${r.entries.length} provider${r.entries.length === 1 ? "" : "s"} in the Top 11 ${r.list.title} offer${r.entries.length === 1 ? "s" : ""} a free tier${r.entries[0] ? `; the most credible is ${r.entries[0].name}` : ""}.`
    : `No provider in the Top 11 ${r.list.title} offers a free tier as of our last verification.`;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: SITE_NAME, url: SITE_URL },
        { name: r.list.title, url: `${SITE_URL}/${slug}` },
        { name: "Free tier", url: `${SITE_URL}/free/${slug}` },
      ])) }} />
      <ListSlice
        result={r}
        heading={`Free ${r.list.vertical.toLowerCase()} in the Top 11`}
        leadAnswer={lead}
        filterExplain={`Filtered to entries with a published free tier (not just a free trial). When the pricing page is ambiguous we err conservative — paid-only by default.`}
        crumbTrailLabel="Free tier"
        metric={(e) => e.free_tier ? "Free tier" : "—"}
      />
    </>
  );
}
