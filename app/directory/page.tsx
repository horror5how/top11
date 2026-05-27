import type { Metadata } from "next";
import Link from "next/link";
import { getList, listSlugs } from "@/lib/lists";
import { SITE_URL } from "@/lib/schema";
import DirectorySearch from "@/app/components/landing/DirectorySearch";
import Reveal from "@/app/components/landing/Reveal";

export const metadata: Metadata = {
  title: "Directory · Mission Control",
  description: "Every Wondermous list in one place. Search any niche, see what moved this week, and browse by sector. Built for humans and the AI agents they work with.",
  alternates: { canonical: `${SITE_URL}/directory` },
};

const COMING_SOON = ["Marketing & Sales", "Legal & Compliance", "HR & People", "Developer Tools", "E-commerce", "Real Estate"];
const WEEK = 7 * 86400000;

export default function Directory() {
  const slugs = listSlugs();
  const lists = slugs.map((s) => getList(s)!);
  const catalog = lists.map((l) => ({
    slug: l.slug, title: l.title, subtitle: l.subtitle, audience: l.audience,
    tags: [...(l.segment_tags || []), ...(l.problem_tags || []), ...(l.query_intents || [])].join(" "),
  }));
  const byDate = [...lists].sort((a, b) => b.last_verified.localeCompare(a.last_verified));
  const spotlight = byDate[0];
  const spotTop = spotlight.entries[0];
  const spotWild = spotlight.entries.find((e) => "is_wildcard" in e && e.is_wildcard);

  const activity = lists
    .flatMap((l) => (l.changelog || []).map((c) => ({ ...c, list: l })))
    .sort((a, b) => b.date.localeCompare(a.date));
  const now = Date.now();
  const thisWeek = activity.filter((a) => now - new Date(a.date).getTime() <= WEEK);
  const productsRanked = lists.reduce((n, l) => n + l.entries.length, 0);
  const sectors = Array.from(new Set(lists.map((l) => l.category)));

  const byCategory: Record<string, typeof lists> = {};
  for (const l of lists) (byCategory[l.category] ||= []).push(l);

  return (
    <div className="relative min-h-screen bg-[#08080a] text-white overflow-x-hidden antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="wm-aurora absolute -top-40 left-1/4 w-[55vw] h-[55vw] rounded-full bg-[#ff5722]/15 blur-[140px]" />
        <div className="wm-aurora2 absolute top-1/4 right-0 w-[40vw] h-[40vw] rounded-full bg-fuchsia-600/10 blur-[140px]" />
      </div>

      {/* nav */}
      <nav className="relative z-20 max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-lg tracking-tight">
          Wonder<span className="text-[#ff5722]">mous</span>
        </Link>
        <div className="flex items-center gap-5 text-sm text-white/60">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/methodology" className="hover:text-white transition hidden sm:inline">Methodology</Link>
          <Link href="/for-agents" className="hover:text-white transition text-[#ff8a5c]">For Agents</Link>
        </div>
      </nav>

      {/* header + massive search */}
      <header className="relative z-10 max-w-4xl mx-auto px-6 pt-10 sm:pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-semibold tracking-widest uppercase text-white/55 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#28c840] wm-dot" /> Mission control
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.02]">
          Every list. <span className="wm-grad">One search.</span>
        </h1>
        <p className="mt-4 text-white/55 max-w-xl mx-auto">
          The directory for humans, and the fastest way for an agent to find the exact ranking its user needs.
        </p>
        <div className="mt-8"><DirectorySearch catalog={catalog} /></div>
      </header>

      {/* this-week stat band */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat value={String(thisWeek.length)} label="Lists changed this week" accent />
          <Stat value={String(lists.length)} label="Live lists" />
          <Stat value={String(productsRanked)} label="Products ranked" />
          <Stat value="LIVE" label="Re-rank tracking" pulse />
        </div>
      </section>

      {/* what changed this week. Mission control log */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <Reveal>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#28c840] wm-dot" />
            <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/80">What moved this week</h2>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/8">
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4">
                <span className="font-mono text-[11px] text-white/35 shrink-0 pt-0.5 w-20">{a.date}</span>
                <span className="text-[#ff8a5c] text-xs font-bold uppercase tracking-wider shrink-0 pt-0.5 w-14">{now - new Date(a.date).getTime() <= WEEK ? "NEW" : ". "}</span>
                <span className="text-white/70 text-sm leading-relaxed">
                  <Link href={`/${a.list.slug}`} className="font-semibold text-white hover:text-[#ff8a5c]">{a.list.title}</Link>
                  {". "}{a.text}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/35">Re-rank tracking is live. When a product climbs or falls, the move lands here the day it happens.</p>
        </Reveal>
      </section>

      {/* spotlight niche */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <Reveal>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/80">Spotlight niche</h2>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <Link href={`/${spotlight.slug}`} className="group block rounded-3xl border border-[#ff5722]/30 bg-gradient-to-br from-[#ff5722]/[0.08] to-transparent p-7 sm:p-9 hover:border-[#ff5722]/60 transition">
            <span className="font-mono text-[11px] tracking-widest uppercase text-[#ff8a5c]">{spotlight.category} · {spotlight.subsector}</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 group-hover:text-[#ff8a5c] transition">{spotlight.title}</h3>
            <p className="text-white/55 mt-2 max-w-2xl">{spotlight.subtitle}</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">#1 pick</span>
                <p className="font-bold text-white mt-1">{spotTop.name} <span className="text-[#ff8a5c] font-mono text-sm">{spotTop.score_out_of_94.toFixed(1)}/9.4</span></p>
                <p className="text-white/50 text-sm mt-1">{spotTop.verdict_short}</p>
              </div>
              {spotWild && (
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff8a5c]">#11 wildcard</span>
                  <p className="font-bold text-white mt-1">{spotWild.name}</p>
                  <p className="text-white/50 text-sm mt-1">{spotWild.best_for_short}</p>
                </div>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-[#ff8a5c]">Open the full ranking <span className="group-hover:translate-x-0.5 transition">→</span></span>
          </Link>
        </Reveal>
      </section>

      {/* latest lists */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <Reveal>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/80">Latest lists</h2>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {byDate.map((l, i) => (
              <Link key={l.slug} href={`/${l.slug}`} className="group block rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#ff5722]/50 p-6 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-[#ff8a5c]">{l.category} · Top 11 + wildcard</span>
                  {now - new Date(l.last_verified).getTime() <= WEEK && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#28c840] border border-[#28c840]/30 rounded-full px-2 py-0.5">New</span>
                  )}
                </div>
                <h3 className="text-xl font-bold tracking-tight group-hover:text-[#ff8a5c] transition">{l.title}</h3>
                <p className="text-white/45 text-sm mt-2 leading-relaxed">{l.subtitle}</p>
                <p className="text-white/30 text-xs mt-4 font-mono">Verified {l.last_verified} · {l.entries.length} ranked</p>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* browse by sector */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <Reveal>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/80">Browse by sector</h2>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectors.map((cat) => (
              <div key={cat} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="font-bold text-white mb-3">{cat}</h3>
                <div className="space-y-2">
                  {byCategory[cat].map((l) => (
                    <Link key={l.slug} href={`/${l.slug}`} className="flex items-center justify-between text-sm text-white/60 hover:text-white transition">
                      <span>{l.subsector}</span><span className="text-[#ff8a5c]">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {COMING_SOON.map((cat) => (
              <div key={cat} className="rounded-2xl border border-dashed border-white/8 bg-transparent p-5 opacity-50">
                <h3 className="font-bold text-white/70 mb-2">{cat}</h3>
                <span className="text-xs font-mono uppercase tracking-widest text-white/30">Coming soon</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <footer className="relative z-10 border-t border-white/8 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between gap-3 text-sm text-white/40">
          <p>Wondermous · AI made for AI · No paid placement, ever</p>
          <p className="font-mono text-xs">
            <Link href="/methodology" className="hover:text-white">Methodology</Link> ·{" "}
            <Link href="/for-agents" className="hover:text-white">For agents</Link> ·{" "}
            <a href="/llms.txt" className="hover:text-white">llms.txt</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label, accent, pulse }: { value: string; label: string; accent?: boolean; pulse?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className={`text-3xl font-extrabold tracking-tight ${accent ? "text-[#ff5722]" : pulse ? "text-[#28c840]" : "text-white"}`}>
        {value}{pulse && <span className="inline-block w-2 h-2 rounded-full bg-[#28c840] wm-dot ml-2 align-middle" />}
      </div>
      <div className="text-white/40 text-xs mt-1.5">{label}</div>
    </div>
  );
}
