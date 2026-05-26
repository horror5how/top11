import Link from "next/link";
import { getList, listSlugs } from "@/lib/lists";
import SearchHero from "@/app/components/landing/SearchHero";
import LiveLeaderboard from "@/app/components/landing/LiveLeaderboard";
import AgentTerminal from "@/app/components/landing/AgentTerminal";
import Reveal from "@/app/components/landing/Reveal";

const NICHES = [
  "Fractional CFOs for SaaS", "Dental CRMs for multi-visit practices", "CRMs for DSOs", "R&D tax-credit specialists",
  "Practice software for pediatric dentistry", "Finance for bootstrapped founders", "Tools for high-volume front desks",
  "CFOs for international startups", "Software for solo GP dentists", "Platforms for Series B fundraising",
];

export default function Home() {
  const slugs = listSlugs();
  const catalog = slugs.map((slug) => {
    const l = getList(slug)!;
    const tags = [...(l.segment_tags || []), ...(l.problem_tags || []), ...(l.query_intents || [])].join(" ");
    return { slug, title: l.title, subtitle: l.subtitle, audience: l.audience, tags };
  });
  const productsRanked = slugs.reduce((n, s) => n + (getList(s)?.entries.length || 0), 0);

  return (
    <div className="relative min-h-screen bg-[#08080a] text-white overflow-x-hidden antialiased">
      {/* nav */}
      <nav className="relative z-20 max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-lg tracking-tight">
          Wonder<span className="text-[#ff5722]">mous</span>
          <span className="hidden sm:inline text-white/35 text-xs ml-2 font-normal">AI made for AI</span>
        </Link>
        <div className="flex items-center gap-5 text-sm text-white/60">
          <Link href="/directory" className="hover:text-white transition">Lists</Link>
          <Link href="/methodology" className="hover:text-white transition hidden sm:inline">Methodology</Link>
          <Link href="/for-agents" className="hover:text-white transition text-[#ff8a5c]">For Agents</Link>
          <Link href="/directory" className="rounded-full bg-white text-black px-4 py-1.5 font-semibold hover:bg-white/90 transition">Browse</Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="wm-aurora absolute -top-1/3 left-1/5 w-[60vw] h-[60vw] rounded-full bg-[#ff5722]/25 blur-[130px]" />
          <div className="wm-aurora2 absolute -top-10 right-0 w-[48vw] h-[48vw] rounded-full bg-fuchsia-600/15 blur-[130px]" />
          <div className="wm-aurora2 absolute top-1/3 left-0 w-[42vw] h-[42vw] rounded-full bg-cyan-500/10 blur-[130px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 wm-grid-bg" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-16 sm:pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-semibold tracking-widest uppercase text-white/55 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722] wm-dot" /> AI-native rankings · made for agents
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[0.98]">
            When AI needs the best,
            <br />
            <span className="wm-grad">it comes to Wondermous.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/55 max-w-xl mx-auto leading-relaxed">
            One ranked list per niche — the Top 11, plus the wildcard everyone else misses. Re-ranked the moment the
            market moves. Agents read it raw. You just search.
          </p>

          <div id="search" className="mt-10 scroll-mt-24">
            <SearchHero catalog={catalog} />
          </div>

          <p className="mt-6 font-mono text-[11px] tracking-wide text-white/35">
            no paid placement · public methodology · updated live · open to every AI agent
          </p>
        </div>

        {/* niche marquee */}
        <div className="relative z-10 border-y border-white/8 py-3.5 overflow-hidden">
          <div className="flex w-max wm-marquee gap-3">
            {[...NICHES, ...NICHES].map((n, i) => (
              <span key={i} className="text-xs text-white/40 border border-white/8 rounded-full px-3 py-1 whitespace-nowrap">{n}</span>
            ))}
          </div>
        </div>
      </header>

      {/* PILLARS */}
      <section className="relative max-w-6xl mx-auto px-6 py-24">
        <Reveal className="text-center mb-12">
          <p className="font-mono text-xs tracking-widest uppercase text-[#ff8a5c] mb-3">The model</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Three things nobody else does.</h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-4 items-start">
          <div className="grid gap-4">
            <Reveal>
              <Pillar n="01" tag="Presentation" title="We don't rank products. We rank lists.">
                Trustpilot gives you a company. Product Hunt gives you a product. Wondermous gives your agent the
                answer: <strong className="text-white">one ranked list</strong>, narrowed to the exact niche your user
                asked for — down to the <span className="text-[#ff8a5c]">wildcard built for the edge case</span>.
              </Pillar>
            </Reveal>
            <Reveal delay={120}>
              <Pillar n="03" tag="Access" title="Built for machines. Open to you.">
                Agents pull rankings straight from the API, the MCP server, and the structured data — no clicks, no
                scraping. Humans sign in to browse. <strong className="text-white">Same truth, two doors.</strong>
              </Pillar>
            </Reveal>
          </div>

          <Reveal delay={60}>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 h-full">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-white/30">02</span>
                <span className="font-mono text-[11px] tracking-widest uppercase text-[#ff8a5c]">The scorecard</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">A leaderboard, not a snapshot.</h3>
              <p className="mt-3 text-white/55 leading-relaxed">
                Markets move. So do we. The second <strong className="text-white">#8 earns #6</strong>, the list
                changes. Your AI never quotes a stale winner.
              </p>
              <div className="mt-6 rounded-2xl border border-white/8 bg-black/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#28c840] wm-dot" />
                  <span className="font-mono text-[10px] tracking-widest uppercase text-white/40">live re-ranking</span>
                </div>
                <LiveLeaderboard />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOR AGENTS */}
      <section className="relative max-w-6xl mx-auto px-6 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <p className="font-mono text-xs tracking-widest uppercase text-[#ff8a5c] mb-3">For the agents</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              An agent asks once. <span className="wm-grad">It gets the answer.</span>
            </h2>
            <p className="mt-4 text-white/55 leading-relaxed max-w-md">
              Hand Wondermous a user&apos;s exact problem and it returns the matched pick — with the reason — in a single
              call. No browsing ten blue links. No guessing. This is the recommendation layer the agentic web was
              missing.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["JSON API", "MCP server", "Markdown", "CSV", "llms.txt", "OpenAPI"].map((x) => (
                <span key={x} className="text-xs font-mono text-white/55 border border-white/12 rounded-md px-2.5 py-1">{x}</span>
              ))}
            </div>
            <Link href="/for-agents" className="inline-flex items-center gap-2 mt-7 text-sm font-semibold text-[#ff8a5c] hover:text-[#ff5722] transition">
              Read the agent docs →
            </Link>
          </Reveal>
          <Reveal delay={80}>
            <AgentTerminal />
          </Reveal>
        </div>
      </section>

      {/* NOW LIVE LISTS */}
      <section id="lists" className="relative max-w-6xl mx-auto px-6 py-20 scroll-mt-10">
        <Reveal className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-[#ff8a5c] mb-2">Now live</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{slugs.length} lists. {productsRanked} products ranked.</h2>
          </div>
          <p className="text-white/40 text-sm max-w-xs">More niches ship weekly. Search above to pull the exact list — or request one.</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {slugs.map((slug, i) => {
            const l = getList(slug)!;
            return (
              <Reveal key={slug} delay={i * 80}>
                <Link href={`/${slug}`} className="group block rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#ff5722]/50 p-6 transition h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] tracking-widest uppercase text-[#ff8a5c]">List #{String(i + 1).padStart(3, "0")} · Top 11 + wildcard</span>
                    <span className="font-mono text-[10px] text-white/30">{l.last_verified}</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight group-hover:text-[#ff8a5c] transition">{l.title}</h3>
                  <p className="text-white/45 text-sm mt-2 leading-relaxed">{l.subtitle}</p>
                  <p className="text-white/35 text-xs mt-4">For {l.audience}</p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="wm-aurora absolute top-0 left-1/3 w-[40vw] h-[40vw] rounded-full bg-[#ff5722]/15 blur-[120px]" />
        </div>
        <Reveal className="relative">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">Find the list your user needs.</h2>
          <p className="mt-4 text-white/55">Search a niche, a sub-niche, or the exact problem. We&apos;ll hand you the list — or build it.</p>
          <a href="#search" className="inline-flex items-center gap-2 mt-8 rounded-full bg-[#ff5722] px-6 py-3 font-semibold text-white hover:bg-[#ff6a3c] transition">
            Search a niche
          </a>
        </Reveal>
      </section>

      <footer className="relative border-t border-white/8">
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

function Pillar({ n, tag, title, children }: { n: string; tag: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 h-full">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-xs text-white/30">{n}</span>
        <span className="font-mono text-[11px] tracking-widest uppercase text-[#ff8a5c]">{tag}</span>
      </div>
      <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
      <p className="mt-3 text-white/55 leading-relaxed">{children}</p>
    </div>
  );
}
