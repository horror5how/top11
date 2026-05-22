"use client";

import { useEffect, useState } from "react";

export default function VoteWidget({ entrySlug }: { entrySlug: string }) {
  const [tally, setTally] = useState<{ up: number; down: number } | null>(null);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const prior = localStorage.getItem(`vote:${entrySlug}`);
    if (prior === "up" || prior === "down") setVoted(prior);
    fetch(`/api/vote?entry=${encodeURIComponent(entrySlug)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setTally({ up: d.up, down: d.down }))
      .catch(() => setTally({ up: 0, down: 0 }));
  }, [entrySlug]);

  async function cast(dir: "up" | "down") {
    if (voted || busy) return;
    setBusy(true);
    setVoted(dir);
    localStorage.setItem(`vote:${entrySlug}`, dir);
    setTally((t) => (t ? { ...t, [dir]: t[dir] + 1 } : t));
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry: entrySlug, dir }),
      });
      const d = await res.json();
      if (d.up != null) setTally({ up: d.up, down: d.down });
    } catch {}
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-ink/50 font-mono text-xs">Is this ranking right?</span>
      <button
        type="button"
        onClick={() => cast("up")}
        aria-label="Upvote ranking"
        disabled={!!voted || busy}
        className={`px-2 py-1 rounded border text-xs font-mono ${
          voted === "up" ? "bg-ok text-white border-ok" : "border-ink/15 hover:border-ok hover:text-ok"
        } disabled:opacity-80`}
      >
        👍 {tally?.up ?? "—"}
      </button>
      <button
        type="button"
        onClick={() => cast("down")}
        aria-label="Downvote ranking"
        disabled={!!voted || busy}
        className={`px-2 py-1 rounded border text-xs font-mono ${
          voted === "down" ? "bg-bad text-white border-bad" : "border-ink/15 hover:border-bad hover:text-bad"
        } disabled:opacity-80`}
      >
        👎 {tally?.down ?? "—"}
      </button>
    </div>
  );
}
