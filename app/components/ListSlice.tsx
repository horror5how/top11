// Single shared template for every slice page (/cheapest, /under, /best-for, /works-with, etc).
// Honest "N of 11" copy when fewer entries match the filter.

import Link from "next/link";
import { brandSlug } from "@/lib/matchups";
import type { SliceResult } from "@/lib/slices";

type Props = {
  result: SliceResult;
  /** H1 for the page, e.g. "The 11 cheapest fractional CFOs". */
  heading: string;
  /** Direct-answer first sentence — the literal AI-quotable answer. */
  leadAnswer: string;
  /** Plain-English one-paragraph filter explainer for the methodology block. */
  filterExplain: string;
  /** Crumb trail (visible + JSON-LD upstream). */
  crumbTrailLabel: string;
  /** Optional sort label shown next to each entry (e.g. "$199/mo", "1 day", "9.1"). */
  metric?: (e: SliceResult["entries"][number]) => string;
};

export default function ListSlice({ result, heading, leadAnswer, filterExplain, crumbTrailLabel, metric }: Props) {
  const { list, entries, matched, shown } = result;
  const honest = shown < 11;
  const runnerUp = entries[1];
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 tnum">
      <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-widest text-ink/45 mb-3 flex flex-wrap gap-1.5">
        <Link href="/" className="hover:text-ink/70">Top 11</Link>
        <span>›</span>
        <Link href={`/${list.slug}`} className="hover:text-ink/70">{list.title}</Link>
        <span>›</span>
        <span className="text-ink/55">{crumbTrailLabel}</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.08] mb-3">{heading}</h1>
      <p className="text-lg text-ink/65 leading-snug max-w-2xl mb-6">{leadAnswer}</p>

      <div className="rounded-2xl border border-ink/15 bg-ink/[0.02] p-5 mb-8">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink/45 mb-2">Why this answer</p>
        <p className="text-[15px] leading-relaxed text-ink/85">{filterExplain}</p>
        <p className="text-xs text-ink/50 mt-3">
          {honest ? (
            <>Showing all <strong>{shown}</strong> matches. Top 11 publishes whatever the data supports — we don&rsquo;t pad lists.{" "}
              <Link href={`/${list.slug}`} className="underline">See the full ranked {list.title}</Link>.
            </>
          ) : (
            <>Showing the top <strong>11</strong> of <strong>{matched}+ screened</strong>. Methodology at{" "}
              <Link href="/methodology" className="underline">/methodology</Link>.
            </>
          )}
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-ink/15 bg-ink/[0.02] p-6 text-center text-ink/60">
          <p className="font-semibold mb-2">No matches in this slice (yet).</p>
          <p className="text-sm">
            We screened {list.methodology.candidate_pool}+ candidates and none cleared this filter as of{" "}
            {new Date(list.last_verified).toLocaleDateString("en-US", { month: "long", year: "numeric" })}.{" "}
            <Link href={`/${list.slug}`} className="underline">See the full ranked list.</Link>
          </p>
        </div>
      ) : (
        <ol className="space-y-4 mb-12">
          {entries.map((e, i) => (
            <li key={`${e.rank}-${e.name}`} className="rounded-xl border border-ink/15 p-5">
              <div className="flex items-baseline justify-between gap-4 mb-1">
                <h2 className="text-lg font-extrabold tracking-tight">
                  <span className="text-ink/45 font-mono text-sm mr-2">#{i + 1}</span>
                  <Link href={`/${list.slug}#rank-${e.rank}`} className="hover:underline">{e.name}</Link>
                  <span className="ml-2 text-ink/45 font-mono text-xs">(rank #{e.rank} in {list.title})</span>
                </h2>
                {metric ? <span className="font-mono text-sm text-ink/70">{metric(e)}</span> : null}
              </div>
              <p className="text-sm text-ink/70 leading-relaxed">{e.verdict_short || e.verdict}</p>
              <p className="text-xs text-ink/50 mt-2">
                <Link href={`/review/${brandSlug(e.name)}`} className="underline">Full {e.name} review</Link> ·{" "}
                {runnerUp && i === 0 ? (
                  <>Compare: <Link href={`/vs/${brandSlug(e.name)}-vs-${brandSlug(runnerUp.name)}`} className="underline">{e.name} vs {runnerUp.name}</Link> ·{" "}</>
                ) : null}
                <Link href={`/alternatives-to/${brandSlug(e.name)}`} className="underline">Alternatives</Link>
              </p>
            </li>
          ))}
        </ol>
      )}

      <p className="text-xs text-ink/50 mt-10">
        Methodology: <Link href="/methodology" className="underline">/methodology</Link> · No paid placement ever ·{" "}
        Verified <time dateTime={list.last_verified}>{new Date(list.last_verified).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>.
      </p>
    </article>
  );
}
