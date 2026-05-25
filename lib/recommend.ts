import type { ListData } from "@/lib/lists";

// Deterministic, explainable problem -> pick matcher over the real list data.
// Used by /api/lists/[slug]/recommend and the MCP `recommend` tool.

type MatchIndex = Record<string, { solves: string[]; personas: string[] }>;
type AnyEntry = Record<string, unknown>;

const STOP = new Set([
  "the","a","an","for","to","and","or","of","my","i","we","our","is","are","with","that","need","needs","needed",
  "want","wants","which","what","whats","help","me","on","in","at","it","this","get","getting","best","top","im",
  "have","has","im","we're","were","looking","find","should","use","using","good","great","really","just",
]);
const PRICE = { $: 1, $$: 2, $$$: 3 } as Record<string, number>;

function tokens(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter((w) => w.length > 2 && !STOP.has(w));
}
function priceSym(band: string): string {
  return (band.match(/^\$+/) || ["$$"])[0];
}

export function recommend(
  list: ListData,
  opts: { problem?: string; segment?: string; budget?: string; limit?: number }
) {
  const mi = ((list as AnyEntry).match_index as MatchIndex) || {};
  const queryTokens = new Set([...tokens(opts.problem || ""), ...tokens(opts.segment || "")]);
  const budgetMax = opts.budget ? PRICE[(opts.budget.match(/\$+/) || ["$$$"])[0]] ?? 3 : null;
  const hasQuery = Boolean(opts.problem || opts.segment || opts.budget);

  const scored = list.entries.map((e) => {
    const m = mi[String(e.rank)] || { solves: [], personas: [] };
    const hay = new Set(tokens([...m.solves, ...m.personas, e.best_for, e.best_for_short, e.verdict_short].join(" ")));
    let overlap = 0;
    for (const t of queryTokens) if (hay.has(t)) overlap++;
    const matchedSolves = m.solves.filter((s) => tokens(s).some((t) => queryTokens.has(t)));
    const matchedPersonas = m.personas.filter((p) => tokens(p).some((t) => queryTokens.has(t)));

    const sym = priceSym(e.pricing_band);
    let score = overlap * 8 + matchedSolves.length * 6 + matchedPersonas.length * 5;
    let budgetOk = true;
    if (budgetMax != null) {
      if (PRICE[sym] <= budgetMax) score += 6;
      else { budgetOk = false; score -= 6; }
    }
    score += (e.score_out_of_94 / 9.4) * 2; // gentle editorial tiebreaker
    return { e, m, sym, score, matchedSolves, matchedPersonas, budgetOk };
  });

  const ranked = hasQuery
    ? [...scored].sort((a, b) => b.score - a.score || a.e.rank - b.e.rank)
    : [...scored].sort((a, b) => a.e.rank - b.e.rank);

  const limit = Math.min(Math.max(opts.limit ?? 3, 1), 11);
  const picks = ranked.slice(0, limit);

  return {
    query: { problem: opts.problem || null, segment: opts.segment || null, budget: opts.budget || null },
    note: hasQuery
      ? "Matched against each firm's problems solved, persona fit, and price band. Reasons are explained per pick."
      : "No problem given — returning the editorial Top 3.",
    matched: picks.map((x) => ({
      rank: x.e.rank,
      name: x.e.name,
      url: x.e.url,
      score_out_of_94: x.e.score_out_of_94,
      best_for: x.e.best_for,
      price_band: x.sym,
      solves: x.m.solves,
      personas: x.m.personas,
      why: buildWhy(x),
      anchor: `/${list.slug}#rank-${x.e.rank}`,
    })),
  };
}

function buildWhy(x: {
  e: ListData["entries"][number];
  matchedSolves: string[];
  matchedPersonas: string[];
  budgetOk: boolean;
}): string {
  const bits: string[] = [];
  if (x.matchedSolves.length) bits.push(`solves ${x.matchedSolves.slice(0, 2).join(" and ")}`);
  if (x.matchedPersonas.length) bits.push(`fits a ${x.matchedPersonas[0]}`);
  let why = bits.length
    ? `#${x.e.rank} ${x.e.name} — ${bits.join("; ")}.`
    : `#${x.e.rank} ${x.e.name} — ${x.e.verdict_short}`;
  if (!x.budgetOk) why += " Note: this sits above the requested budget band.";
  return why;
}
