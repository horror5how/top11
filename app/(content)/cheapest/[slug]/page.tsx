import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListSlice from "@/app/components/ListSlice";
import { cheapest } from "@/lib/slices";
import { listSlugs } from "@/lib/lists";
import { breadcrumbJsonLd, organizationJsonLd, personJsonLd, SITE_NAME, SITE_URL } from "@/lib/schema";

export function generateStaticParams() { return listSlugs().map((slug) => ({ slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = cheapest(slug);
  if (!r) return {};
  const title = `The 11 cheapest ${r.list.vertical.toLowerCase()} in 2026 — independently ranked`;
  const desc = `Cheapest providers from the Top 11 ${r.list.title}, sorted low to high. Real prices, no paid placement.`;
  return { title, description: desc, alternates: { canonical: `${SITE_URL}/cheapest/${slug}` } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = cheapest(slug);
  if (!r) notFound();
  const top = r.entries[0];
  const lead = top
    ? `The cheapest provider in the Top 11 ${r.list.title} is ${top.name}${top.price_min ? ` at $${top.price_min.toLocaleString()}/mo` : ""}${r.entries[1] ? `, followed by ${r.entries[1].name}` : ""}.`
    : `No priced entries in this slice yet.`;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: SITE_NAME, url: SITE_URL },
        { name: r.list.title, url: `${SITE_URL}/${slug}` },
        { name: "Cheapest", url: `${SITE_URL}/cheapest/${slug}` },
      ])) }} />
      <ListSlice
        result={r}
        heading={`The 11 cheapest ${r.list.vertical.toLowerCase()}`}
        leadAnswer={lead}
        filterExplain={`Sorted by published starting price, lowest first. We use each provider's lowest documented price band; where pricing is undisclosed, the entry falls to the bottom of the list.`}
        crumbTrailLabel="Cheapest"
        metric={(e) => e.price_min ? `$${e.price_min.toLocaleString()}/mo+` : "—"}
      />
    </>
  );
}
