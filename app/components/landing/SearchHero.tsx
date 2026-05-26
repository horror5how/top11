"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Item = { slug: string; title: string; subtitle: string; audience: string; tags: string };

const PLACEHOLDERS = [
  "fractional CFO for a seed-stage SaaS startup",
  "dental CRM for a patient seen 5–6 times a day",
  "best software for a multi-location DSO",
  "fractional CFO to reclaim R&D tax credits",
  "scheduling tool for a high-volume dental practice",
];
const CHIPS = ["fractional CFO", "dental CRM", "multi-visit scheduling", "R&D tax credits", "bootstrapped startup", "multi-location DSO"];

export default function SearchHero({ catalog }: { catalog: Item[] }) {
  const [q, setQ] = useState("");
  const [ph, setPh] = useState(0);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (q) return;
    const id = setInterval(() => setPh((p) => (p + 1) % PLACEHOLDERS.length), 2600);
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
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, niche: q }),
      });
    } catch {}
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#ff5722]/40 via-fuchsia-500/20 to-cyan-400/30 blur opacity-60 group-focus-within:opacity-100 transition" />
        <div className="relative flex items-center gap-3 rounded-2xl border border-white/15 bg-[#0e0e12]/90 backdrop-blur px-4 sm:px-5 py-4">
          <svg className="w-5 h-5 text-white/40 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search a niche — e.g. ${PLACEHOLDERS[ph]}`}
            className="flex-1 bg-transparent text-white placeholder-white/35 text-base sm:text-lg outline-none"
            aria-label="Search for a ranked list by niche or problem"
          />
          {q && (
            <button onClick={() => { setQ(""); inputRef.current?.focus(); }} className="text-white/40 hover:text-white text-sm">clear</button>
          )}
        </div>
      </div>

      {!q && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => { setQ(c); inputRef.current?.focus(); }}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/12 bg-white/[0.03] text-white/60 hover:text-white hover:border-white/30 transition"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {q && (
        <div className="mt-4 text-left">
          {results.length > 0 ? (
            <div className="space-y-2.5">
              {results.map(({ c }) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="block rounded-xl border border-white/12 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#ff5722]/50 px-4 py-3.5 transition group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-white text-[15px]">{c.title}</span>
                    <span className="text-[#ff8a5c] text-sm shrink-0 group-hover:translate-x-0.5 transition">Open list →</span>
                  </div>
                  <span className="block text-white/45 text-xs mt-1">{c.subtitle}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-4">
              <p className="text-white/70 text-sm">
                No list for <span className="text-white font-semibold">&ldquo;{q}&rdquo;</span> yet. Wondermous builds niches on demand.
              </p>
              {!sent ? (
                <form onSubmit={joinWaitlist} className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 rounded-lg border border-white/15 bg-[#0e0e12] px-3 py-2.5 text-white placeholder-white/30 text-sm outline-none focus:border-[#ff5722]/60"
                  />
                  <button type="submit" className="rounded-lg bg-[#ff5722] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ff6a3c] transition">
                    Build it for me
                  </button>
                </form>
              ) : (
                <p className="mt-3 text-sm text-[#28c840]">On the list ✓ — we&apos;ll build this niche and ping you.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
