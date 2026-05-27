"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Item = { slug: string; title: string; subtitle: string; audience: string; tags: string };

const EXAMPLES = [
  "a fractional CFO for a seed-stage SaaS startup",
  "a dental CRM for a patient seen 5 to 6× a day",
  "the cheapest CFO for a pre-seed startup",
  "software for a multi-location dental DSO",
  "a CFO that reclaims R&D tax credits",
  "scheduling for a high-volume dental practice",
];

export default function SearchHero({ catalog }: { catalog: Item[] }) {
  const [q, setQ] = useState("");
  const [typed, setTyped] = useState("");
  const [focused, setFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // typewriter ghost (only while empty)
  useEffect(() => {
    if (q) return;
    let ex = 0, ch = 0, dir = 1, hold = 0;
    const id = setInterval(() => {
      if (hold > 0) { hold--; return; }
      const word = EXAMPLES[ex];
      ch += dir;
      setTyped(word.slice(0, Math.max(0, ch)));
      if (ch >= word.length) { dir = -1; hold = 16; }
      else if (ch <= 0 && dir === -1) { dir = 1; ex = (ex + 1) % EXAMPLES.length; hold = 2; }
    }, 55);
    return () => clearInterval(id);
  }, [q]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const tokens = query.split(/\s+/).filter((t) => t.length > 1);
    return catalog
      .map((c) => {
        const hay = `${c.title} ${c.subtitle} ${c.audience} ${c.tags}`.toLowerCase();
        const score = tokens.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
        return { c, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [q, catalog]);

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSent(true);
    try {
      await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, niche: q }) });
    } catch {}
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        {/* breathing glow. The search bar is the light source */}
        <div className="pointer-events-none absolute -inset-3 rounded-full bg-gradient-to-r from-[#ff5722]/45 via-fuchsia-500/25 to-cyan-400/35 blur-2xl wm-breathe" />
        <div className={`relative flex items-center gap-4 rounded-full border bg-[#0e0e12]/85 backdrop-blur px-6 sm:px-8 py-5 sm:py-6 transition-colors ${focused ? "border-[#ff5722]/60" : "border-white/15"}`}>
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/45 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <div className="relative flex-1 min-w-0">
            {!q && (
              <span className="pointer-events-none absolute inset-0 flex items-center text-white/35 text-lg sm:text-2xl whitespace-nowrap overflow-hidden">
                {typed || " "}{!focused && <span className="wm-cur" />}
              </span>
            )}
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="w-full bg-transparent text-white text-lg sm:text-2xl outline-none"
              aria-label="Search for a ranked list by niche or problem"
            />
          </div>
          {q && <button onClick={() => { setQ(""); inputRef.current?.focus(); }} className="text-white/40 hover:text-white text-sm shrink-0">clear</button>}
        </div>
      </div>

      {q && (
        <div className="mt-4 text-left">
          {results.length > 0 ? (
            <div className="space-y-2.5">
              {results.map(({ c }) => (
                <Link key={c.slug} href={`/${c.slug}`} className="block rounded-2xl border border-white/12 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#ff5722]/50 px-5 py-4 transition group">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-white text-[15px]">{c.title}</span>
                    <span className="text-[#ff8a5c] text-sm shrink-0 group-hover:translate-x-0.5 transition">Open list →</span>
                  </div>
                  <span className="block text-white/45 text-xs mt-1">{c.subtitle}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] px-5 py-4">
              <p className="text-white/70 text-sm">No list for <span className="text-white font-semibold">&ldquo;{q}&rdquo;</span> yet. Top 11 builds niches on demand.</p>
              {!sent ? (
                <form onSubmit={joinWaitlist} className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 rounded-full border border-white/15 bg-[#0e0e12] px-4 py-2.5 text-white placeholder-white/30 text-sm outline-none focus:border-[#ff5722]/60" />
                  <button type="submit" className="rounded-full bg-[#ff5722] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#ff6a3c] transition">Build it for me</button>
                </form>
              ) : (
                <p className="mt-3 text-sm text-[#28c840]">On the list ✓. We&apos;ll build this niche and ping you.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
