import Link from "next/link";
import { listSlugs, getList } from "@/lib/lists";
import { relatedLinksFor } from "@/lib/relatedLinks";

// The full internal-link hub. Every list expands to every page we publish for it:
// comparisons (versus), best-for, works-with, alternatives, reviews, red flags, and the
// price / speed / location / compliance views. This is what makes every page visible to a
// human browsing AND reachable in one hop from the indexed /directory page (so Google and
// AI crawlers can discover and index them, instead of leaving them as orphans).

const CATEGORY_LEGEND = [
  "Versus / Comparison",
  "Best for",
  "Works with",
  "Alternatives",
  "Reviews",
  "Red flags",
  "By price",
  "By speed",
  "By location",
  "Compliance",
];

export default function BrowseEverything() {
  const slugs = listSlugs();
  const lists = slugs.map((s) => ({ slug: s, list: getList(s)!, groups: relatedLinksFor(s) }));
  const totalPages = lists.reduce((n, { groups }) => n + groups.reduce((m, g) => m + g.links.length, 0), 0);

  return (
    <section id="browse-all" className="relative z-10 max-w-6xl mx-auto px-6 py-12 scroll-mt-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/80">Browse every page</h2>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      <p className="text-white/55 max-w-2xl mb-4">
        Every ranking view we publish, {totalPages.toLocaleString()} pages in total. Open a list to see its
        comparisons, best-for picks, integrations, alternatives, reviews, and price, speed and location views.
      </p>
      <div className="flex flex-wrap gap-2 mb-7">
        {CATEGORY_LEGEND.map((c) => (
          <span key={c} className="text-[11px] font-mono uppercase tracking-wider text-white/55 border border-white/12 rounded-md px-2.5 py-1">
            {c}
          </span>
        ))}
      </div>

      <div className="space-y-2.5">
        {lists.map(({ slug, list, groups }) => {
          const count = groups.reduce((m, g) => m + g.links.length, 0);
          return (
            <details key={slug} className="group rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none hover:bg-white/[0.04] transition">
                <span className="flex items-center gap-3 min-w-0">
                  <Link href={`/${slug}`} className="font-bold text-white hover:text-[#ff8a5c] transition truncate">{list.title}</Link>
                </span>
                <span className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[11px] text-white/35">{count} pages</span>
                  <svg className="w-4 h-4 text-white/40 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </span>
              </summary>
              <div className="border-t border-white/8 px-5 py-4 space-y-4">
                {groups.map((g) => (
                  <div key={g.title}>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#ff8a5c] mb-2">{g.title}</p>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {g.links.map((li) => (
                        <li key={li.href}>
                          <Link href={li.href} className="text-xs text-white/55 hover:text-white transition leading-relaxed">
                            {li.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
