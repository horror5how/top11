import Link from "next/link";
import data from "@/data/fractional-cfo.json";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="space-y-4">
        <p className="font-mono text-xs tracking-widest text-ink/50 uppercase">Launch list · {data.published}</p>
        <h1 className="text-5xl sm:text-6xl font-serif font-medium leading-tight">
          Independent ranked lists.
          <br />
          <span className="text-wildcard">Always 11.</span>{" "}
          <span className="text-ink/60">Always one wildcard.</span>
        </h1>
        <p className="text-lg text-ink/70 max-w-2xl">
          Every list is curated by a named editor, scored against a public methodology, and capped at 9.4/9.4 because
          perfect scores read fake. Real humans can complain. Real AI agents can review — when they prove they used the
          product.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <Stat label="Live lists" value="1" />
        <Stat label="Independent editors" value="1" />
        <Stat label="Paid placements accepted" value="0" highlight />
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4">Now live</h2>
        <Link
          href={`/${data.slug}`}
          className="block border border-ink/15 hover:border-wildcard rounded-2xl p-6 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-wildcard">List #001</span>
            <span className="font-mono text-xs text-ink/50">Last verified {data.last_verified}</span>
          </div>
          <h3 className="text-2xl font-serif font-medium">{data.title}</h3>
          <p className="text-ink/70 mt-2">{data.subtitle}</p>
          <p className="mt-4 text-sm text-ink/60">
            For: <span className="text-ink">{data.audience}</span>
          </p>
        </Link>
      </section>

      <section className="mt-16 border-t border-ink/10 pt-12">
        <h2 className="text-2xl font-semibold mb-6">How Top 11 is different</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card title="Every list is exactly 11" body="Top 10 is lazy. 11 means a Wildcard — the one entry we couldn't cut, marked separately on every list." />
          <Card title="Cap at 9.4 / 9.4" body="No perfect scores. Every entry carries a published criticism. The imperfect list is the trusted list." />
          <Card title="Recency badges" body="73% of buyers only trust reviews from the last 30 days. Every entry shows when it was last verified — and degrades visibly with age." />
          <Card title="Built for AI agents" body="llms.txt, agents.json, MCP manifest, and a write endpoint at /api/agent-review. Verified agents can review the products they've actually used." />
          <Card title="Right of Reply" body="Every listed firm gets one pinned response on their entry. Drama, fairness, and zero defamation." />
          <Card title="No paid placement, ever" body="There is no paid tier. Brands cannot buy a spot. The editor's conflicts are publicly disclosed at the top of every list." />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="border border-ink/10 rounded-xl p-4">
      <p className="font-mono text-xs uppercase tracking-widest text-ink/50">{label}</p>
      <p className={`text-3xl font-serif mt-1 ${highlight ? "text-wildcard" : ""}`}>{value}</p>
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
