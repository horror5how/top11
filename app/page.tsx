import Link from "next/link";
import { getList, listSlugs } from "@/lib/lists";
import SearchHero from "@/app/components/landing/SearchHero";
import LiveLeaderboard from "@/app/components/landing/LiveLeaderboard";
import AgentTerminal from "@/app/components/landing/AgentTerminal";
import Reveal from "@/app/components/landing/Reveal";

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

      {/* HERO. The search bar IS the hero */}
      <header id="search" className="relative min-h-[86vh] flex flex-col items-center justify-center text-center px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="wm-float absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[62%] w-[82vw] max-w-3xl h-[44vh] rounded-full bg-[#ff5722]/10 blur-[120px]" />
        </div>
        <div className="relative z-10 w-full max-w-2xl mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/35 mb-6">Wondermous · AI-native rankings</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05] mb-9">
            What list are you<br className="hidden sm:block" /> looking for?
          </h1>
          <SearchHero catalog={catalog} />
          <p className="mt-7 text-white/45 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            No matter how niche, we&apos;ve got the ranked list: the Top 11, plus the one wildcard everyone else misses.
          </p>
        </div>
        <a href="#how" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/30 hover:text-white/70 transition text-[11px] tracking-widest uppercase">
          <span>What is this</span>
          <svg className="w-4 h-4 wm-bob" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </a>
      </header>

      {/* PILLARS */}
      <section id="how" className="relative max-w-6xl mx-auto px-6 py-24 scroll-mt-10">
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
                asked for, down to the <span className="text-[#ff8a5c]">wildcard built for the edge case</span>.
              </Pillar>
            </Reveal>
            <Reveal delay={120}>
              <Pillar n="03" tag="Access" title="Built for machines. Open to you.">
                Agents pull rankings straight from the API, the MCP server, and the structured data. No clicks, no
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
              Hand Wondermous a user&apos;s exact problem and it returns the matched pick, with the reason, in a single
              call. No slug needed, and you can filter by budget or by verified risk. No browsing ten blue links, no
              guessing. This is the recommendation layer agents have been missing.
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
          <p className="text-white/40 text-sm max-w-xs">More niches ship weekly. Search above to pull the exact list, or request one.</p>
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

      {/* FINAL CTA. Full-bleed animated aurora field that fades seamlessly into the page */}
      <section className="relative overflow-hidden py-28 sm:py-36">
        <div className="wm-fade-edges pointer-events-none absolute inset-0" aria-hidden>
          <div className="wm-aurora absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[72vw] max-w-3xl aspect-square rounded-full bg-[#ff5722]/20 blur-[140px]" />
          <div className="wm-aurora2 absolute left-[62%] top-[30%] w-[42vw] max-w-xl aspect-square rounded-full bg-[#ff8a3c]/14 blur-[120px]" />
          <div className="wm-aurora absolute left-[28%] top-[66%] w-[36vw] max-w-md aspect-square rounded-full bg-[#ff5722]/12 blur-[110px] [animation-delay:-11s]" />
        </div>

        <Reveal className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Find the list <span className="wm-grad">your user needs.</span>
          </h2>
          <p className="mt-4 text-white/55">Search a niche, a sub-niche, or the exact problem. We&apos;ll hand you the list, or build it.</p>
          <a
            href="#search"
            className="group inline-flex items-center gap-2 mt-8 rounded-full bg-[#ff5722] px-6 py-3 font-semibold text-white shadow-[0_10px_44px_-10px_rgba(255,87,34,0.75)] transition-transform duration-200 hover:scale-[1.04] hover:bg-[#ff6a3c] active:scale-95"
          >
            Search a niche
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
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
