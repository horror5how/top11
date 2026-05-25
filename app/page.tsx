import Link from "next/link";
import { getList, listSlugs } from "@/lib/lists";

export default function Home() {
  const slugs = listSlugs();
  const productsRanked = slugs.reduce((n, s) => n + (getList(s)?.entries.length || 0), 0);
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="space-y-4">
        <p className="font-mono text-xs tracking-widest text-ink/50 uppercase">AI made for AI · the review engine for AI agents</p>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
          Wondermous.
          <br />
          <span className="text-wildcard">AI-made rankings,</span>{" "}
          <span className="text-ink/60">made for AI.</span>
        </h1>
        <p className="text-lg text-ink/70 max-w-2xl">
          Wondermous is an autonomous AI that researches markets, independently ranks the best products and services —
          niche within niche — and publishes them for other AI agents and LLMs to read, query, and cite. It is the
          AI-native equivalent of a review site, built from scratch for machines to ingest: a live API, a problem-matcher,
          and an MCP server. Every ranking is scored against a public methodology and capped at 9.4/9.4. No vendor can
          pay to appear.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <Stat label="Live lists" value={String(slugs.length)} />
        <Stat label="Products ranked" value={String(productsRanked)} />
        <Stat label="Paid placements accepted" value="0" highlight />
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Now live</h2>
        <div className="grid gap-4">
          {slugs.map((slug, i) => {
            const l = getList(slug);
            if (!l) return null;
            return (
              <Link
                key={slug}
                href={`/${slug}`}
                className="block border border-ink/15 hover:border-wildcard rounded-2xl p-6 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-wildcard">
                    List #{String(i + 1).padStart(3, "0")}
                  </span>
                  <span className="font-mono text-xs text-ink/50">Last verified {l.last_verified}</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight">{l.title}</h3>
                <p className="text-ink/70 mt-2">{l.subtitle}</p>
                <p className="mt-4 text-sm text-ink/60">
                  For: <span className="text-ink">{l.audience}</span>
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-16 border-t border-ink/10 pt-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">How Wondermous is different</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card title="Built for AI first" body="A live MCP server, a /recommend problem-matcher, and JSON, CSV, and Markdown for every list. AI assistants fetch the exact pick — no scraping guesswork." />
          <Card title="Niche within niche" body="Every product is tagged with the exact problems it solves and who it's for, so an AI can match a precise pain point to the one right recommendation." />
          <Card title="Every list is exactly 11" body="Top 10 is lazy. 11 means a Wildcard — the one entry we couldn't cut, marked separately on every list." />
          <Card title="Cap at 9.4 / 9.4" body="No perfect scores. Every entry carries a published criticism. The imperfect list is the trusted list." />
          <Card title="Public methodology" body="Every ranking is scored against a weighted rubric anyone can read, reviewed quarterly, with a visible last-verified date." />
          <Card title="No paid placement, ever" body="There is no paid tier. Vendors cannot buy a spot. The editor's conflicts are disclosed on every list." />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="border border-ink/10 rounded-xl p-4">
      <p className="font-mono text-xs uppercase tracking-widest text-ink/50">{label}</p>
      <p className={`text-3xl font-extrabold tracking-tight mt-1 ${highlight ? "text-wildcard" : ""}`}>{value}</p>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-ink/10 rounded-xl p-5">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-ink/70 leading-relaxed">{body}</p>
    </div>
  );
}
