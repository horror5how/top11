import type { Metadata } from "next";
import data from "@/data/fractional-cfo.json";
import {
  articleJsonLd,
  datasetJsonLd,
  faqJsonLd,
  listJsonLd,
  priceSymbol,
  SITE_URL,
} from "@/lib/schema";
import VoteWidget from "@/app/components/VoteWidget";
import ComplaintForm from "@/app/components/ComplaintForm";
import MatchmakerQuiz from "@/app/components/MatchmakerQuiz";
import CiteWidget from "@/app/components/CiteWidget";
import ReviewPulse from "@/app/components/ReviewPulse";

export const metadata: Metadata = {
  title: data.title,
  description: data.answer_capsule.slice(0, 300),
  alternates: { canonical: `${SITE_URL}/${data.slug}` },
  openGraph: { title: data.title, description: data.subtitle, url: `${SITE_URL}/${data.slug}`, type: "article" },
};

function priceDetail(band: string) {
  return band.replace(/^\$+\s*\(/, "").replace(/\)$/, "").replace(/^typically\s*/, "");
}
function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function FractionalCfoPage() {
  const daysSince = Math.floor((Date.now() - new Date(data.last_verified).getTime()) / 86400000);
  const verifiedLabel = new Date(data.last_verified).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const recencyClass =
    daysSince <= 30 ? "bg-ok/10 text-ok" : daysSince <= 90 ? "bg-warn/10 text-warn" : "bg-bad/10 text-bad";
  const faqLd = faqJsonLd(data);

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 tnum">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd(data)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd(data)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(data)) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      {/* header */}
      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50 mb-3">List #001 · {data.vertical}</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.08] mb-3">{data.title}</h1>
        <p className="text-lg text-ink/60 leading-snug max-w-2xl">{data.subtitle}</p>
        <div className="flex flex-wrap gap-2 mt-5 text-xs">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold ${recencyClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <time dateTime={data.last_verified}>Verified {verifiedLabel}</time>
          </span>
          <span className="px-3 py-1.5 rounded-full border border-ink/15 text-ink/60 font-medium">
            {data.methodology.candidate_pool}+ firms screened · 11 ranked
          </span>
          <span className="px-3 py-1.5 rounded-full border border-ink/15 text-ink/60 font-medium">
            No paid placement
          </span>
        </div>
      </header>

      {/* ANSWER CAPSULE — the extractable, citation-ready answer, first thing on the page */}
      <div className="rounded-2xl border border-ink/15 bg-ink/[0.02] p-5 mb-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink/45 mb-2">The short answer</p>
        <p className="text-[17px] leading-relaxed text-ink/90">{data.answer_capsule}</p>
      </div>

      {/* how this list was built — trust block (substitutes for named author) */}
      <div className="text-sm text-ink/65 leading-relaxed mb-8 flex flex-wrap gap-x-6 gap-y-1">
        <span>
          Scored on a <strong className="text-ink/80">9.4-point</strong> scale across{" "}
          <a href="/methodology" className="underline decoration-ink/20 hover:decoration-ink">
            5 weighted criteria
          </a>
          , reviewed {data.methodology.review_cadence}.
        </span>
        <span>No firm paid to appear. The editor holds no stake in any firm listed.</span>
      </div>

      <CiteWidget slug={data.slug} title={data.title} />

      {/* THE RANKING — semantic comparison table, all 11, AI-extractable */}
      <section className="mb-12" aria-labelledby="ranking-heading">
        <div className="flex items-center gap-3 mb-3">
          <h2 id="ranking-heading" className="text-xs font-extrabold uppercase tracking-[0.12em]">
            The Ranking
          </h2>
          <span className="text-[11px] text-ink/40 font-bold tracking-wider">ALL 11</span>
          <div className="flex-1 h-0.5 bg-ink" />
        </div>
        <div className="border border-ink/15 rounded-2xl overflow-hidden">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Ranked comparison of the top 11 fractional CFO firms for tech startups, with best-for segment, price band,
              and score out of 9.4. Updated {verifiedLabel}.
            </caption>
            <thead>
              <tr className="bg-ink/[0.03] text-[10.5px] uppercase tracking-wider text-ink/45 font-bold">
                <th scope="col" className="py-2.5 px-4 sm:px-5 font-bold w-10">#</th>
                <th scope="col" className="py-2.5 pr-3 font-bold">Provider · best for</th>
                <th scope="col" className="py-2.5 px-2 font-bold hidden sm:table-cell w-12 text-center">Price</th>
                <th scope="col" className="py-2.5 px-4 sm:px-5 font-bold text-right w-24">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((e) => {
                const isWild = "is_wildcard" in e && e.is_wildcard;
                const top = e.rank <= 3;
                const pct = ((e.score_out_of_94 / 9.4) * 100).toFixed(1);
                return (
                  <tr key={e.rank} className={`border-t border-ink/10 ${isWild ? "bg-wildcard/[0.06]" : ""}`}>
                    <th
                      scope="row"
                      className={`py-3 px-4 sm:px-5 align-middle text-lg font-extrabold tracking-tight ${
                        isWild ? "text-wildcard" : "text-ink"
                      }`}
                    >
                      {e.rank}
                    </th>
                    <td className="py-3 pr-3 align-middle">
                      <a href={`#rank-${e.rank}`} className="block group">
                        <span className="font-bold text-[15px] sm:text-base tracking-tight group-hover:underline">
                          {e.name}
                          {isWild && (
                            <span className="ml-2 align-middle text-[9px] font-extrabold tracking-wider bg-wildcard text-white px-1.5 py-0.5 rounded">
                              WILDCARD
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-ink/55 font-medium">{e.best_for_short}</span>
                      </a>
                    </td>
                    <td className="py-3 px-2 align-middle text-center text-xs font-bold text-ink/55 hidden sm:table-cell">
                      {priceSymbol(e.pricing_band)}
                    </td>
                    <td className="py-3 px-4 sm:px-5 align-middle text-right">
                      <span className="inline-flex items-center justify-end gap-2.5">
                        <span className="hidden sm:block w-12 h-1.5 rounded-full bg-ink/10 overflow-hidden" aria-hidden>
                          <span
                            className={`block h-full rounded-full ${isWild ? "bg-wildcard" : top ? "bg-ok" : "bg-ink"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </span>
                        <span
                          className={`text-base font-extrabold tracking-tight ${
                            isWild ? "text-wildcard" : top ? "text-ok" : "text-ink"
                          }`}
                        >
                          {e.score_out_of_94.toFixed(1)}
                          <span className="text-[11px] text-ink/40 font-medium">/9.4</span>
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* BY THE NUMBERS — sourced statistics (GEO: +33% citation lift) */}
      <section className="mb-12" aria-labelledby="numbers-heading">
        <div className="flex items-center gap-3 mb-3">
          <h2 id="numbers-heading" className="text-xs font-extrabold uppercase tracking-[0.12em]">
            By the numbers
          </h2>
          <div className="flex-1 h-0.5 bg-ink" />
        </div>
        <ul className="space-y-2.5">
          {data.stats.map((s, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-snug text-ink/80">
              <span className="text-ink/30 font-bold shrink-0">›</span>
              <span>
                {s.text} <span className="text-ink/40 text-xs">({s.source})</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* THE BREAKDOWN — self-contained chunk per entry */}
      <section className="mb-14" aria-labelledby="breakdown-heading">
        <div className="flex items-center gap-3 mb-2">
          <h2 id="breakdown-heading" className="text-xs font-extrabold uppercase tracking-[0.12em]">
            The Breakdown
          </h2>
          <div className="flex-1 h-0.5 bg-ink" />
        </div>

        {data.entries.map((e) => {
          const isWild = "is_wildcard" in e && e.is_wildcard;
          return (
            <div
              key={e.rank}
              id={`rank-${e.rank}`}
              className={`grid grid-cols-[52px_1fr] sm:grid-cols-[64px_1fr] gap-4 sm:gap-5 py-6 scroll-mt-20 ${
                isWild
                  ? "bg-gradient-to-b from-wildcard/[0.05] to-transparent border-2 border-wildcard/30 rounded-2xl px-4 sm:px-5 mt-4"
                  : "border-t border-ink/10"
              }`}
            >
              <div className="text-center">
                <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${isWild ? "text-wildcard" : ""}`}>
                  {e.rank}
                </div>
                <div className={`mt-2 text-lg sm:text-xl font-extrabold tracking-tight ${isWild ? "text-wildcard" : "text-ok"}`}>
                  {e.score_out_of_94.toFixed(1)}
                  <span className="block text-[9px] text-ink/40 font-bold tracking-wider uppercase">/9.4</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                  <a href={e.url} target="_blank" rel="noreferrer" className={`hover:text-wildcard ${isWild ? "text-wildcard" : ""}`}>
                    {e.name}
                  </a>
                  {isWild && (
                    <span className="ml-2 align-middle text-[9px] font-extrabold tracking-wider bg-wildcard text-white px-1.5 py-0.5 rounded">
                      WILDCARD · #11
                    </span>
                  )}
                </h3>

                <div className="flex flex-wrap gap-2 my-3 text-xs">
                  <span className="font-semibold px-2.5 py-1 rounded-md bg-[#EEF4FB] text-[#2563A8]">
                    Best for: {e.best_for_short}
                  </span>
                  <span className="font-semibold px-2.5 py-1 rounded-md bg-ink/[0.05] text-ink/60">
                    {priceSymbol(e.pricing_band)} · {priceDetail(e.pricing_band)}
                  </span>
                  <span className="font-semibold px-2.5 py-1 rounded-md bg-ink/[0.05] text-ink/60">
                    {e.hq} · est. {e.founded}
                  </span>
                </div>

                {isWild && "wildcard_reason_short" in e && (
                  <div className="text-sm text-ink/65 leading-relaxed bg-wildcard/[0.06] rounded-lg px-3.5 py-3 mb-3">
                    <strong className="text-wildcard">Why the Wildcard:</strong> {e.wildcard_reason_short}
                  </div>
                )}

                <p className="text-[16px] sm:text-[17px] font-semibold tracking-tight leading-snug mb-3">
                  {e.name} — {e.verdict_short}
                </p>

                <div className="flex flex-col gap-1.5 max-w-2xl">
                  <p className="flex gap-2.5 text-sm text-ink/65 leading-snug">
                    <span className="font-extrabold text-ok shrink-0">✓</span>
                    {e.praise_short}
                  </p>
                  <p className="flex gap-2.5 text-sm text-ink/65 leading-snug">
                    <span className="font-extrabold text-bad shrink-0">✕</span>
                    {e.criticism_short}
                  </p>
                </div>

                <p className="text-xs text-ink/45 mt-3">
                  Primary source:{" "}
                  <a href={e.url} target="_blank" rel="noreferrer" className="underline hover:text-ink/70">
                    {hostOf(e.url)}
                  </a>{" "}
                  · Data verified {verifiedLabel}
                </p>

                <div className="mt-4">
                  <ReviewPulse rank={e.rank} />
                </div>

                <div className="flex items-center justify-between border-t border-ink/10 pt-3 mt-4">
                  <VoteWidget entrySlug={`${data.slug}-${e.rank}`} />
                  <a href="#gripe-box" className="text-xs text-bad hover:underline font-medium">
                    Gripe →
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* BUYER'S GUIDE — sub-intent coverage for query fan-out */}
      <section className="mb-14 border-t border-ink/10 pt-10 space-y-8" aria-labelledby="guide-heading">
        <h2 id="guide-heading" className="text-2xl font-extrabold tracking-tight">
          Fractional CFO buyer&apos;s guide
        </h2>

        <div>
          <h3 className="text-lg font-bold tracking-tight mb-2">What is a fractional CFO?</h3>
          <p className="text-ink/70 leading-relaxed">{data.context.definition}</p>
        </div>

        <div>
          <h3 className="text-lg font-bold tracking-tight mb-2">How much does a fractional CFO cost in 2026?</h3>
          <p className="text-ink/70 leading-relaxed">{data.context.cost}</p>
        </div>

        <div>
          <h3 className="text-lg font-bold tracking-tight mb-2">
            Fractional CFO vs full-time vs part-time CFO: what&apos;s the difference?
          </h3>
          <p className="text-ink/70 leading-relaxed">{data.context.vs}</p>
        </div>

        <div>
          <h3 className="text-lg font-bold tracking-tight mb-2">How to choose a fractional CFO</h3>
          <ul className="space-y-2">
            {data.context.how_to_choose.map((h, i) => (
              <li key={i} className="flex gap-3 text-ink/70 leading-relaxed">
                <span className="text-ink/30 font-bold shrink-0">{i + 1}.</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ — question-phrased headings, self-contained answers (mirrors FAQPage schema) */}
      <section className="mb-14 border-t border-ink/10 pt-10" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-2xl font-extrabold tracking-tight mb-6">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {data.faqs.map((f, i) => (
            <div key={i}>
              <h3 className="text-base font-bold tracking-tight mb-1.5">{f.q}</h3>
              <p className="text-ink/70 leading-relaxed text-[15px]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14 border-t border-ink/10 pt-10">
        <h2 className="text-2xl font-extrabold tracking-tight mb-2">Find your match</h2>
        <p className="text-ink/60 mb-6 text-sm">Six questions. Personalised top 3 from the Top 11 above. No login required.</p>
        <MatchmakerQuiz slug={data.slug} />
      </section>

      <section id="gripe-box" className="mb-14 border-t border-ink/10 pt-10 scroll-mt-20">
        <h2 className="text-2xl font-extrabold tracking-tight mb-2">The Gripe Box</h2>
        <p className="text-ink/60 mb-6 text-sm">
          The only review form on this page. We publish complaints, not compliments — every brand has marketing for the
          rest. Moderated for libel. Right of Reply guaranteed.
        </p>
        <ComplaintForm entries={data.entries.map((e) => ({ rank: e.rank, name: e.name }))} listSlug={data.slug} />
      </section>

      <section className="mb-8 border-t border-ink/10 pt-8 text-sm space-y-2 text-ink/60">
        <h2 className="text-base font-bold text-ink mb-3">Honest disclosures</h2>
        <ul className="list-disc pl-5 space-y-1">
          {data.honest_disclosures.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
        <p className="pt-3 text-xs text-ink/45">
          Machine-readable: <a href={`/api/lists/${data.slug}`} className="underline">JSON</a> ·{" "}
          <a href={`/api/lists/${data.slug}/md`} className="underline">Markdown</a> ·{" "}
          <a href={`/api/lists/${data.slug}/csv`} className="underline">CSV</a> ·{" "}
          <a href="/for-agents" className="underline">agent guide</a>
        </p>
      </section>
    </article>
  );
}
