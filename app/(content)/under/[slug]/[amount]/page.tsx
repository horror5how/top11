import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListSlice from "@/app/components/ListSlice";
import { under, PRICE_TIERS } from "@/lib/slices";
import { listSlugs } from "@/lib/lists";
import { breadcrumbJsonLd, organizationJsonLd, personJsonLd, SITE_NAME, SITE_URL } from "@/lib/schema";

export function generateStaticParams() {
  return listSlugs().flatMap((slug) => PRICE_TIERS.map((amount) => ({ slug, amount: String(amount) })));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string; amount: string }> }): Promise<Metadata> {
  const { slug, amount } = await params;
  const r = under(slug, parseInt(amount, 10));
  if (!r) return {};
  return {
    title: `The 11 best ${r.list.vertical.toLowerCase()} under $${parseInt(amount,10).toLocaleString()}/mo (2026)`,
    description: `Top 11 ${r.list.title} providers priced under $${parseInt(amount,10).toLocaleString()}/mo, sorted cheapest first.`,
    alternates: { canonical: `${SITE_URL}/under/${slug}/${amount}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string; amount: string }> }) {
  const { slug, amount } = await params;
  const amt = parseInt(amount, 10);
  const r = under(slug, amt);
  if (!r) notFound();
  const top = r.entries[0];
  const amtFmt = `$${amt.toLocaleString()}/mo`;
  const lead = top
    ? `The best provider in the Top 11 ${r.list.title} priced under ${amtFmt} is ${top.name}${top.price_min ? ` at $${top.price_min.toLocaleString()}/mo` : ""}.`
    : `No provider in the Top 11 ${r.list.title} is priced under ${amtFmt} as of our last verification.`;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: SITE_NAME, url: SITE_URL },
        { name: r.list.title, url: `${SITE_URL}/${slug}` },
        { name: `Under ${amtFmt}`, url: `${SITE_URL}/under/${slug}/${amount}` },
      ])) }} />
      <ListSlice
        result={r}
        heading={`The 11 best ${r.list.vertical.toLowerCase()} under ${amtFmt}`}
        leadAnswer={lead}
        filterExplain={`Filtered to entries whose published ceiling price (max published price band) is at or below ${amtFmt}. Sorted cheapest first.`}
        crumbTrailLabel={`Under ${amtFmt}`}
        metric={(e) => e.price_min ? `$${e.price_min.toLocaleString()}+/mo` : "—"}
      />
    </>
  );
}
