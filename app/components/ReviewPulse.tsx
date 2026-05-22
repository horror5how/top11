import pulse from "@/data/pulse/fractional-cfo.json";

type Quote = { quote: string; source_url?: string };
type Theme = { theme: string; polarity: "positive" | "negative" | "mixed"; count: number };

type EntryPulse = {
  rank: number;
  name: string;
  verdict?: string | null;
  sentiment_score?: number | null;
  strongest_praise?: Quote | null;
  strongest_criticism?: Quote | null;
  recurring_themes?: Theme[];
  watch_signals?: string[];
  sample_size?: number;
  sources?: Record<string, number>;
  error?: string;
};

export default function ReviewPulse({ rank }: { rank: number }) {
  const data = (pulse as any).entries?.[String(rank)] as EntryPulse | undefined;

  if (!data || data.sample_size === 0 || data.error) {
    return (
      <details className="border border-dashed border-ink/15 rounded-lg p-3 text-xs text-ink/50">
        <summary className="cursor-pointer font-mono uppercase tracking-widest">
          📡 Review Pulse — first ingestion pending
        </summary>
        <p className="mt-2 leading-relaxed">
          Reddit, Trustpilot, Google, and Facebook signal will populate on the next scheduled refresh. Editor's
          published criticism and praise above remain the authoritative source until then.
        </p>
      </details>
    );
  }

  const score = data.sentiment_score ?? 0;
  const scoreClass =
    score >= 7 ? "text-ok" : score <= 4 ? "text-bad" : "text-warn";
  const sourceLabel = Object.entries(data.sources || {})
    .filter(([, n]) => Number(n) > 0)
    .map(([s, n]) => `${s} ${n}`)
    .join(" · ");

  return (
    <div className="border border-ink/15 rounded-xl bg-ink/[0.02] p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
          📡 Review Pulse — what the internet actually says
        </p>
        <span className={`font-mono text-xs ${scoreClass}`}>
          {typeof data.sentiment_score === "number" ? `sentiment ${data.sentiment_score.toFixed(1)}/10` : ""}
        </span>
      </div>

      {data.verdict ? <p className="text-sm leading-relaxed mb-3">{data.verdict}</p> : null}

      <div className="grid sm:grid-cols-2 gap-3 mb-3 text-xs">
        {data.strongest_praise?.quote ? (
          <a
            href={data.strongest_praise.source_url || "#"}
            target="_blank"
            rel="noreferrer"
            className="block border-l-2 border-ok pl-3 hover:bg-ok/[0.04] rounded-r"
          >
            <p className="font-mono uppercase tracking-widest text-ok mb-1">Top praise</p>
            <p className="text-ink/80 italic">"{data.strongest_praise.quote}"</p>
            <p className="text-ink/40 font-mono mt-1 truncate">
              {data.strongest_praise.source_url ? new URL(data.strongest_praise.source_url).hostname : ""}
            </p>
          </a>
        ) : null}
        {data.strongest_criticism?.quote ? (
          <a
            href={data.strongest_criticism.source_url || "#"}
            target="_blank"
            rel="noreferrer"
            className="block border-l-2 border-bad pl-3 hover:bg-bad/[0.04] rounded-r"
          >
            <p className="font-mono uppercase tracking-widest text-bad mb-1">Top criticism</p>
            <p className="text-ink/80 italic">"{data.strongest_criticism.quote}"</p>
            <p className="text-ink/40 font-mono mt-1 truncate">
              {data.strongest_criticism.source_url ? new URL(data.strongest_criticism.source_url).hostname : ""}
            </p>
          </a>
        ) : null}
      </div>

      {data.recurring_themes && data.recurring_themes.length ? (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {data.recurring_themes.map((t, i) => (
            <span
              key={i}
              className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                t.polarity === "positive"
                  ? "bg-ok/10 text-ok"
                  : t.polarity === "negative"
                  ? "bg-bad/10 text-bad"
                  : "bg-warn/10 text-warn"
              }`}
            >
              {t.theme} · {t.count}
            </span>
          ))}
        </div>
      ) : null}

      {data.watch_signals && data.watch_signals.length ? (
        <details className="text-xs">
          <summary className="cursor-pointer font-mono text-ink/60 uppercase tracking-widest">
            ⚠ Watch signals ({data.watch_signals.length})
          </summary>
          <ul className="list-disc pl-5 mt-1 text-ink/70 space-y-1">
            {data.watch_signals.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </details>
      ) : null}

      <p className="font-mono text-[10px] text-ink/40 mt-3">
        Sample: {data.sample_size || 0} items · {sourceLabel || "—"}
      </p>
    </div>
  );
}
