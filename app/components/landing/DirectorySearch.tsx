"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

type Item = { slug: string; title: string; subtitle: string; audience: string; tags: string };

export default function DirectorySearch({ catalog }: { catalog: Item[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#ff5722]/40 via-fuchsia-500/20 to-cyan-400/30 blur opacity-50 group-focus-within:opacity-100 transition" />
        <div className="relative flex items-center gap-4 rounded-2xl border border-white/15 bg-[#0e0e12]/90 backdrop-blur px-5 sm:px-6 py-5 sm:py-6">
          <svg className="w-6 h-6 text-white/40 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => { if (e.key === "Enter" && results[0]) router.push(`/${results[0].c.slug}`); if (e.key === "Escape") setOpen(false); }}
            placeholder="Search every list: a niche, a sub-niche, or your exact problem…"
            className="flex-1 bg-transparent text-white placeholder-white/35 text-lg sm:text-2xl outline-none"
            aria-label="Search all Wondermous lists"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-white/35 border border-white/12 rounded px-2 py-1">⏎ open</kbd>
        </div>
      </div>

      {open && q && (
        <div className="absolute z-30 left-0 right-0 mt-2 rounded-2xl border border-white/12 bg-[#0c0c10]/95 backdrop-blur-xl p-2 shadow-2xl">
          {results.length > 0 ? (
            results.map(({ c }) => (
              <Link key={c.slug} href={`/${c.slug}`} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 hover:bg-white/[0.06] transition group">
                <span>
                  <span className="block font-semibold text-white text-[15px]">{c.title}</span>
                  <span className="block text-white/40 text-xs mt-0.5">{c.subtitle}</span>
                </span>
                <span className="text-[#ff8a5c] text-sm shrink-0 group-hover:translate-x-0.5 transition">open →</span>
              </Link>
            ))
          ) : (
            <div className="px-4 py-4 text-sm text-white/55">
              No list for <span className="text-white font-semibold">&ldquo;{q}&rdquo;</span> yet. Wondermous builds niches on demand.{" "}
              <Link href={`/?q=${encodeURIComponent(q)}#search`} className="text-[#ff8a5c] hover:underline">Request it →</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
