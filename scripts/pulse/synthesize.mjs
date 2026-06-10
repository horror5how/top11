// Send raw multi-source data for a single entry to an LLM.
// Returns a structured sentiment summary the UI can render.
// Provider order: Gemini first (working key on this repo's Actions secrets),
// Anthropic only as fallback — the Anthropic key has $0 credit as of 2026-06
// (pulse data was full of "Anthropic 400" errors), so Gemini is the live rail.
import { truncate } from "./lib.mjs";

const MODEL = process.env.PULSE_MODEL || "claude-sonnet-4-5"; // legacy Anthropic fallback; rail dead (no credit)
const GEMINI_MODEL = process.env.PULSE_GEMINI_MODEL || "gemini-2.5-pro";
const PROVIDER = process.env.PULSE_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "anthropic");

export async function synthesizeForEntry(entry, sourceBundle) {
  if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return {
      entry: entry.name,
      verdict: null,
      score: null,
      strongest_praise: null,
      strongest_criticism: null,
      recurring_themes: [],
      sample_size: 0,
      sources: {},
      error: "GEMINI_API_KEY/ANTHROPIC_API_KEY missing, synthesis skipped",
    };
  }

  // Build a compact prompt
  const counts = {};
  for (const [src, data] of Object.entries(sourceBundle)) counts[src] = data?.count ?? 0;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return {
      entry: entry.name,
      verdict: null,
      score: null,
      strongest_praise: null,
      strongest_criticism: null,
      recurring_themes: [],
      sample_size: 0,
      sources: counts,
      error: "No source data returned for any channel",
    };
  }

  const lines = [];
  lines.push(`FIRM: ${entry.name} (${entry.domain})`);
  lines.push("");

  for (const [src, data] of Object.entries(sourceBundle)) {
    if (!data || !data.count) continue;
    lines.push(`--- ${src.toUpperCase()} (${data.count} items) ---`);
    if (data.average_rating != null) lines.push(`AVG RATING: ${data.average_rating}`);
    const list = data.reviews || data.threads || [];
    for (const item of list.slice(0, 12)) {
      const stars = item.rating != null ? `★${item.rating}` : "";
      const text = item.body || item.excerpt || "";
      const meta = item.url ? ` <${item.url}>` : "";
      lines.push(`- ${stars} ${truncate(text, 350)}${meta}`);
    }
    lines.push("");
  }

  const prompt = `You are the editorial analyst for Top 11, an independent ranked-list publication. Read the public reviews, threads, and discussion below about a fractional CFO firm and return a strict JSON object summarising what the internet actually says about this firm.

REQUIRED JSON SHAPE (no prose outside the JSON, no markdown fence):
{
  "verdict": "2 to 3 sentence neutral synthesis. If there's real review signal: say what people consistently report. If there isn't enough signal: say so plainly, but also extract whatever useful context IS in the data (e.g. 'mostly discussed in r/Accounting for R&D credit work', 'mentioned as a YC-recommended option', 'no direct customer testimonials found, but appears in 4 fractional-CFO recommendation threads').",
  "sentiment_score": <number 0..10. Use 5 for genuinely mixed. Use null only if you literally have no signal at all about this firm specifically.>,
  "strongest_praise": { "quote": "<verbatim or lightly cleaned customer quote, or null if none found>", "source_url": "<url, or empty>" },
  "strongest_criticism": { "quote": "<verbatim or lightly cleaned customer quote, or null if none found>", "source_url": "<url, or empty>" },
  "recurring_themes": [ { "theme": "<short label>", "polarity": "positive|negative|mixed", "count": <int> } ],
  "watch_signals": [ "<one-line factual concern an enterprise buyer should know>" ]
}

EXTRACTION RULES:
- Quote only what is actually present in the data. Never fabricate quotes or themes.
- A "review" is any user-generated commentary about working with this firm, including informal recommendations like "I've used X and they were great for Y" or "stay away from X because Z".
- Recommendation threads ("who's the best fractional CFO?") count as signal IF this firm is named, with what context.
- If only the firm name is mentioned without commentary, themes can include "mentioned as an option in N recommendation threads", which is still useful.
- If a quote is generic, pick a more specific one elsewhere in the data.
- recurring_themes: at most 5, ordered by frequency. Always include at least one theme if there's any signal at all.
- watch_signals: 0 to 3 items. Only include if visible in data.
- Tone: sharp human operator writing for buyers, not a brochure. Not promotional, not hostile, not lazy.
- The verdict's first sentence is the direct answer: what the internet says about this firm, stated plainly.
- Anchor every claim to a specific: a count, a named source, or a timeframe (e.g. "3 of 5 Reddit threads since 2024 name them for R&D credits"). Vague claims like "generally positive feedback" are banned.
- Banned words and phrases (AI filler): leverage, unlock, seamless, robust, comprehensive, dive into, elevate, landscape, game-changer, cutting-edge.
- Write in plain English: no em-dashes or en-dashes anywhere. Use commas, periods, or parentheses.

DATA:
${lines.join("\n")}
`;

  let text = "";
  if (PROVIDER === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8000, responseMimeType: "application/json" },
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return {
        entry: entry.name,
        error: `Gemini ${res.status}: ${truncate(err, 200)}`,
        sample_size: total,
        sources: counts,
      };
    }
    const data = await res.json();
    text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } else {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return {
        entry: entry.name,
        error: `Anthropic ${res.status}: ${truncate(err, 200)}`,
        sample_size: total,
        sources: counts,
      };
    }
    const data = await res.json();
    text = data.content?.[0]?.text || "";
  }
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) {
    return { entry: entry.name, error: `${PROVIDER} returned no JSON`, sample_size: total, sources: counts, raw: truncate(text, 400) };
  }
  let parsed;
  try {
    parsed = JSON.parse(m[0]);
  } catch (e) {
    return { entry: entry.name, error: `JSON parse failed: ${e.message}`, sample_size: total, sources: counts };
  }

  return {
    entry: entry.name,
    verdict: parsed.verdict || null,
    sentiment_score: parsed.sentiment_score ?? null,
    strongest_praise: parsed.strongest_praise || null,
    strongest_criticism: parsed.strongest_criticism || null,
    recurring_themes: parsed.recurring_themes || [],
    watch_signals: parsed.watch_signals || [],
    sample_size: total,
    sources: counts,
  };
}
