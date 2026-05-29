import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListSlice from "@/app/components/ListSlice";
import { fastest } from "@/lib/slices";
import { listSlugs } from "@/lib/lists";
import { breadcrumbJsonLd, organizationJsonLd, personJsonLd, SITE_NAME, SITE_URL } from "@/lib/schema";

export function generateStaticParams() { return listSlugs().map((slug) => ({ slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = fastest(slug);
  if (!r) return {};
  return {
    title: `The 11 fastest-to-onboard ${r.list.vertical.toLowerCase()} (2026)`,
    description: `Sorted by typical days-to-live for the Top 11 ${r.list.title}.`,
    alternates: { canonical: `${SITE_URL}/fastest/${slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = fastest(slug);
  if (!r) notFound();
  const top = r.entries[0];
  const lead = top
    ? `The fastest to onboard in the Top 11 ${r.list.title} is ${top.name}${top.onboarding_days ? ` (typical go-live in ${top.onboarding_days} day${top.onboarding_days === 1 ? "" : "s"})` : ""}.`
    : "";
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: SITE_NAME, url: SITE_URL },
        { name: r.list.title, url: `${SITE_URL}/${slug}` },
        { name: "Fastest to onboard", url: `${SITE_URL}/fastest/${slug}` },
      ])) }} />
      <ListSlice
        result={r}
        heading={`The 11 fastest-to-onboard ${r.list.vertical.toLowerCase()}`}
        leadAnswer={lead}
        filterExplain={`Sorted by typical days from contract signature to live system, using each provider's publicly stated onboarding timeline. Entries without a published timeline fall to the bottom.`}
        crumbTrailLabel="Fastest"
        metric={(e) => e.onboarding_days ? `${e.onboarding_days} day${e.onboarding_days === 1 ? "" : "s"}` : "—"}
      />
    </>
  );
}
