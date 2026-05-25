import type { Metadata } from "next";
import data from "@/data/fractional-cfo.json";
import { articleJsonLd, listJsonLd, SITE_URL } from "@/lib/schema";
import VoteWidget from "@/app/components/VoteWidget";
import ComplaintForm from "@/app/components/ComplaintForm";
import MatchmakerQuiz from "@/app/components/MatchmakerQuiz";
import CiteWidget from "@/app/components/CiteWidget";
import ReviewPulse from "@/app/components/ReviewPulse";

export const metadata: Metadata = {
  title: data.title,
  description: data.subtitle,
  alternates: { canonical: `${SITE_URL}/${data.slug}` },
  openGraph: { title: data.title, description: data.subtitle, url: `${SITE_URL}/${data.slug}` },
};

function priceSymbol(band: string) {
  return (band.match(/^\$+/) || ["$$"])[0];
}
function priceDetail(band: string) {
  return band.replace(/^\$+\s*\(/, "").replace(/\)$/, "").replace(/^typically\s*/, "");
}

export default function FractionalCfoPage() {
  const daysSince = Math.floor((Date.now() - new Date(data.last_verified).getTime()) / 86400000);
  const recencyClass =
    daysSince <= 30 ? "bg-ok/10 text-ok" : daysSince <= 90 ? "bg-warn/10 text-warn" : "bg-bad/10 text-bad";

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 tnum">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd(data.slug, data.title, data.entries)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(data.slug, data.title, data.subtitle, data.published, data.last_verified)),
        }}
      />

      {/* compact header */}
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50 mb-3">List #001 · {data.vertical}</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.08] mb-3">{data.title}</h1>
        <p className="text-lg text-ink/60 leading-snug max-w-2xl">{data.subtitle}</p>
        <div className="flex flex-wrap gap-2 mt-5 text-xs">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold ${recencyClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Verified {daysSince} day{daysSince === 1 ? "" : "s"} ago
          </span>
          <span className="px-3 py-1.5 rounded-full border border-ink/15 text-ink/60 font-medium">
            Editor: {data.editor.name} · anonymous
          </span>
          <span className="px-3 py-1.5 rounded-full border border-ink/15 text-ink/60 font-medium">
            Capped at 9.4/9.4 · no perfect scores
          </span>
        </div>
      </header>

      <CiteWidget slug={data.slug} title={data.title} />

      {/* THE RANKING — scannable leaderboard, all 11 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.12em]">The Ranking</h2>
          <span className="text-[11px] text-ink/40 font-bold tracking-wider">ALL 11</span>
          <div className="flex-1 h-0.5 bg-ink" />
        </div>
        <div className="border border-ink/15 rounded-2xl overflow-hidden">
          {data.entries.map((e) => {
            const isWild = "is_wildcard" in e && e.is_wildcard;
            const top = e.rank <= 3;
            const pct = ((e.score_out_of_94 / 9.4) * 100).toFixed(1);
            return (
              <a
                key={e.rank}
                href={`#rank-${e.rank}`}
                className={`flex items-center gap-3 px-4 sm:px-5 py-3 border-t border-ink/10 first:border-t-0 transition-colors hover:bg-ink/[0.03] ${
                  isWild ? "bg-wildcard/[0.06]" : ""
                }`}
              >
                <span className={`w-7 text-center text-lg font-extrabold tracking-tight ${isWild ? "text-wildcard" : "text-ink"}`}>
                  {e.rank}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[15px] sm:text-base tracking-tight truncate">
                    {e.name}
                    {isWild && (
                      <span className="ml-2 align-middle text-[9px] font-extrabold tracking-wider bg-wildcard text-white px-1.5 py-0.5 rounded">
                        WILDCARD
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-ink/55 font-medium truncate">{e.best_for_short}</span>
                </span>
                <span className="hidden sm:block w-10 text-center text-xs font-bold text-ink/55">
                  {priceSymbol(e.pricing_band)}
                </span>
                <span className="flex items-center justify-end gap-2.5 w-[88px] sm:w-32">
                  <span className="hidden sm:block w-12 h-1.5 rounded-full bg-ink/10 overflow-hidden">
                    <span
                      className={`block h-full rounded-full ${isWild ? "bg-wildcard" : top ? "bg-ok" : "bg-ink"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className={`text-base font-extrabold tracking-tight ${isWild ? "text-wildcard" : top ? "text-ok" : "text-ink"}`}>
                    {e.score_out_of_94.toFixed(1)}
                    <span className="text-[11px] text-ink/40 font-medium">/9.4</span>
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* THE BREAKDOWN — lean detail per entry */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.12em]">The Breakdown</h2>
          <div className="flex-1 h-0.5 bg-ink" />
        </div>

        {data.entries.map((e) => {
          const isWild = "is_wildcard" in e && e.is_wildcard;
          const top = e.rank <= 3;
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
                <a
                  href={e.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`text-lg sm:text-xl font-bold tracking-tight hover:text-wildcard ${isWild ? "text-wildcard" : ""}`}
                >
                  {e.name}
                  {isWild && (
                    <span className="ml-2 align-middle text-[9px] font-extrabold tracking-wider bg-wildcard text-white px-1.5 py-0.5 rounded">
                      WILDCARD
                    </span>
                  )}
                </a>

                <div className="flex flex-wrap gap-2 my-3 text-xs">
                  <span className="font-semibold px-2.5 py-1 rounded-md bg-[#EEF4FB] text-[#2563A8]">{e.best_for_short}</span>
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

                <p className="text-[16px] sm:text-[17px] font-semibold tracking-tight leading-snug mb-3">{e.verdict_short}</p>

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

      <section className="mb-16 border-t border-ink/10 pt-10">
        <h2 className="text-2xl font-extrabold tracking-tight mb-2">Find your match</h2>
        <p className="text-ink/60 mb-6 text-sm">Six questions. Personalised top 3 from the Top 11 above. No login required.</p>
        <MatchmakerQuiz slug={data.slug} />
      </section>

      <section id="gripe-box" className="mb-16 border-t border-ink/10 pt-10 scroll-mt-20">
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
      </section>
    </article>
  );
}
