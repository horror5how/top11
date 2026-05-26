import { getList, listSlugs, type ListData, type RiskSignals, type RiskLevel } from "@/lib/lists";

// Deterministic, explainable problem -> pick matcher over the real list data.
// Used by /api/lists/[slug]/recommend, /api/recommend (cross-list), and the MCP `recommend` tool.

type MatchIndex = Record<string, { solves: string[]; personas: string[] }>;
type AnyEntry = Record<string, unknown>;

/** Given a free-text need, pick the most relevant published list (so an agent
 *  can recommend without knowing the slug). Returns null if nothing matches. */
export function pickBestList(query: string): string | null {
  const qt = new Set(tokens(query));
  if (!qt.size) return null;
  let best: { slug: string; score: number } | null = null;
  for (const slug of listSlugs()) {
    const l = getList(slug);
    if (!l) continue;
    const ll = l as AnyEntry;
    const parts: string[] = [l.title, l.vertical, l.subtitle,
      ...((ll.segment_tags as string[]) || []),
      ...((ll.problem_tags as string[]) || []),
      ...((ll.query_intents as string[]) || [])];
    const mi = (ll.match_index as MatchIndex) || {};
    for (const k of Object.keys(mi)) parts.push(...mi[k].solves, ...mi[k].personas);
    const hay = new Set(tokens(parts.join(" ")));
    let score = 0;
    for (const t of qt) if (hay.has(t)) score++;
    if (!best || score > best.score) best = { slug, score };
  }
  return best && best.score > 0 ? best.slug : null;
}

const STOP = new Set([
  "the","a","an","for","to","and","or","of","my","i","we","our","is","are","with","that","need","needs","needed",
  "want","wants","which","what","whats","help","me","on","in","at","it","this","get","getting","best","top","im",
  "have","has","im","we're","were","looking","find","should","use","using","good","great","really","just",
]);
const PRICE = { $: 1, $$: 2, $$$: 3 } as Record<string, number>;
// Verified public risk signals lower a recommendation, proportional to severity.
const RISK_PENALTY: Record<RiskLevel, number> = { none: 0, low: -1, moderate: -5, elevated: -12 };
const RISK_ORDER: Record<RiskLevel, number> = { none: 0, low: 1, moderate: 2, elevated: 3 };
function parseRiskLevel(s?: string): number | null {
  if (!s) return null;
  const k = s.toLowerCase().trim();
  return k in RISK_ORDER ? RISK_ORDER[k as RiskLevel] : null;
}

function tokens(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter((w) => w.length > 2 && !STOP.has(w));
}
function priceSym(band: string): string {
  return (band.match(/^\$+/) || ["$$"])[0];
}

export function recommend(
  list: ListData,
  opts: { problem?: string; segment?: string; budget?: string; maxRisk?: string; limit?: number }
) {
  const mi = ((list as AnyEntry).match_index as MatchIndex) || {};
  const queryTokens = new Set([...tokens(opts.problem || ""), ...tokens(opts.segment || "")]);
  const budgetMax = opts.budget ? PRICE[(opts.budget.match(/\$+/) || ["$$$"])[0]] ?? 3 : null;
  const maxRiskLevel = parseRiskLevel(opts.maxRisk);
  const hasQuery = Boolean(opts.problem || opts.segment || opts.budget || opts.maxRisk);

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
    // Risk factor: verified public risk signals lower a recommendation.
    const risk = (e as { risk_signals?: RiskSignals }).risk_signals;
    score += RISK_PENALTY[risk?.level ?? "none"] ?? 0;
    return { e, m, sym, score, matchedSolves, matchedPersonas, budgetOk, risk };
  });

  // max_risk is a hard constraint: drop entries whose verified risk exceeds the threshold.
  let pool = scored;
  let riskFiltered = false;
  if (maxRiskLevel != null) {
    const allowed = scored.filter((x) => RISK_ORDER[x.risk?.level ?? "none"] <= maxRiskLevel);
    if (allowed.length) { pool = allowed; riskFiltered = true; }
  }

  const ranked = hasQuery
    ? [...pool].sort((a, b) => b.score - a.score || a.e.rank - b.e.rank)
    : [...pool].sort((a, b) => a.e.rank - b.e.rank);

  const limit = Math.min(Math.max(opts.limit ?? 3, 1), 11);
  const picks = ranked.slice(0, limit);

  const notes: string[] = [];
  if (hasQuery) notes.push("Matched against each firm's problems solved, persona fit, price band, and verified risk signals. Reasons are explained per pick.");
  else notes.push("No problem given — returning the editorial Top 3.");
  if (riskFiltered) notes.push(`Filtered to firms with risk no higher than '${opts.maxRisk}'.`);
  else if (maxRiskLevel != null) notes.push(`No firm met the requested max risk of '${opts.maxRisk}'; returning all, lowest-risk first is not guaranteed — check risk_level per pick.`);

  return {
    query: { problem: opts.problem || null, segment: opts.segment || null, budget: opts.budget || null, max_risk: opts.maxRisk || null },
    note: notes.join(" "),
    matched: picks.map((x) => ({
      rank: x.e.rank,
      name: x.e.name,
      url: x.e.url,
      score_out_of_94: x.e.score_out_of_94,
      best_for: x.e.best_for,
      price_band: x.sym,
      solves: x.m.solves,
      personas: x.m.personas,
      risk_level: x.risk?.level ?? "none",
      risk_summary: x.risk?.summary ?? null,
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
  risk?: RiskSignals;
}): string {
  const bits: string[] = [];
  if (x.matchedSolves.length) bits.push(`solves ${x.matchedSolves.slice(0, 2).join(" and ")}`);
  if (x.matchedPersonas.length) bits.push(`fits a ${x.matchedPersonas[0]}`);
  let why = bits.length
    ? `#${x.e.rank} ${x.e.name} — ${bits.join("; ")}.`
    : `#${x.e.rank} ${x.e.name} — ${x.e.verdict_short}`;
  if (!x.budgetOk) why += " Note: this sits above the requested budget band.";
  if (x.risk && (x.risk.level === "moderate" || x.risk.level === "elevated")) {
    why += ` Risk note (${x.risk.level}): ${x.risk.summary}`;
  }
  return why;
}
