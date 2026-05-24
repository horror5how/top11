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

export default function FractionalCfoPage() {
  const daysSince = Math.floor((Date.now() - new Date(data.last_verified).getTime()) / 86400000);
  const recencyClass =
    daysSince <= 30 ? "bg-ok/10 text-ok" : daysSince <= 90 ? "bg-warn/10 text-warn" : "bg-bad/10 text-bad";

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
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

      <header className="space-y-3 mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50">List #001 · {data.vertical}</p>
        <h1 className="text-4xl sm:text-5xl font-serif font-medium leading-tight">{data.title}</h1>
        <p className="text-lg text-ink/70">{data.subtitle}</p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className={`px-3 py-1 rounded-full font-mono text-xs ${recencyClass}`}>
            Last verified {daysSince} day{daysSince === 1 ? "" : "s"} ago
          </span>
          <span className="text-ink/50">
            Editor: <span className="text-ink/80">{data.editor.name}</span>{" "}
            <span className="text-ink/40">(anonymous by design)</span>
          </span>
        </div>
      </header>

      <aside className="border border-ink/10 bg-ink/[0.02] rounded-xl p-5 mb-10 text-sm space-y-2">
        <p>
          <strong>TL;DR:</strong> For tech founders raising $1M–$50M, the strongest default choice is{" "}
          <strong>Burkland Associates</strong> if you're already VC-backed,{" "}
          <strong>Kruze Consulting</strong> if you want the strongest R&amp;D tax credit work, and{" "}
          <strong>Graphite Financial</strong> if you're earlier stage on a YC-style budget.{" "}
          <strong>TheCFOSquad</strong> takes the Wildcard slot at #11 for AI-native founders who want a CFO who lives in
          their LLM stack.
        </p>
        <p className="text-ink/60">
          Disclosure: {data.editor.conflict_disclosure}
        </p>
      </aside>

      <CiteWidget slug={data.slug} title={data.title} />

      <ol className="space-y-8 mt-10">
        {data.entries.map((e) => {
          const isWildcard = "is_wildcard" in e && e.is_wildcard;
          return (
            <li
              key={e.rank}
              id={`rank-${e.rank}`}
              className={`border rounded-2xl p-6 ${
                isWildcard ? "border-wildcard wildcard-glow" : "border-ink/15"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {isWildcard ? (
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-wildcard text-white">
                        WILDCARD · #11
                      </span>
                    ) : (
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-ink text-paper">#{e.rank}</span>
                    )}
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-2xl font-serif font-medium hover:underline"
                    >
                      {e.name}
                    </a>
                  </div>
                  <p className="text-xs text-ink/50 font-mono">
                    Founded {e.founded} · {e.hq} · {e.team_size_band} · {e.pricing_band}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-xs text-ink/50">SCORE</div>
                  <div className="text-2xl font-serif">{e.score_out_of_94.toFixed(1)}<span className="text-ink/40 text-base">/9.4</span></div>
                </div>
              </div>

              <p className="font-medium text-sm text-ink/70 mb-3">Best for: {e.best_for}</p>

              {isWildcard && "wildcard_reason" in e && (
                <div className="bg-wildcard/5 border-l-4 border-wildcard pl-4 py-2 mb-3 text-sm">
                  <strong className="text-wildcard">Why the Wildcard:</strong> {e.wildcard_reason}
                </div>
              )}

              <p className="mb-4 leading-relaxed">{e.verdict}</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                <div className="border-l-2 border-ok pl-3">
                  <p className="font-mono text-xs uppercase tracking-widest text-ok mb-1">Strongest praise</p>
                  <p className="text-ink/80">{e.praise}</p>
                </div>
                <div className="border-l-2 border-bad pl-3">
                  <p className="font-mono text-xs uppercase tracking-widest text-bad mb-1">Strongest criticism</p>
                  <p className="text-ink/80">{e.criticism}</p>
                </div>
              </div>

              <ReviewPulse rank={e.rank} />

              <div className="flex items-center justify-between border-t border-ink/10 pt-4 mt-4">
                <VoteWidget entrySlug={`${data.slug}-${e.rank}`} />
                <a
                  href={`#complain-${e.rank}`}
                  className="text-xs text-bad hover:underline font-mono"
                >
                  Gripe about this entry →
                </a>
              </div>
            </li>
          );
        })}
      </ol>

      <section className="mt-16 border-t border-ink/10 pt-10">
        <h2 className="text-2xl font-serif font-medium mb-4">Find your match</h2>
        <p className="text-ink/70 mb-6 text-sm">
          Six questions. Personalised top 3 from the Top 11 above. No login required.
        </p>
        <MatchmakerQuiz slug={data.slug} />
      </section>

      <section className="mt-16 border-t border-ink/10 pt-10">
        <h2 className="text-2xl font-serif font-medium mb-2">The Gripe Box</h2>
        <p className="text-ink/70 mb-6 text-sm">
          The only review form on this page. We publish complaints, not compliments — every brand has marketing for the
          rest. Moderated for libel. Right of Reply guaranteed.
        </p>
        <ComplaintForm entries={data.entries.map((e) => ({ rank: e.rank, name: e.name }))} listSlug={data.slug} />
      </section>

      <section className="mt-16 border-t border-ink/10 pt-10 text-sm space-y-2 text-ink/60">
        <h2 className="text-lg font-semibold text-ink mb-3">Honest disclosures</h2>
        <ul className="list-disc pl-5 space-y-1">
          {data.honest_disclosures.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
