"use client";

import { useEffect, useState } from "react";

export default function CiteWidget({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState<string>("https://11.market");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = `${origin}/${slug}`;
  const methodologyUrl = `${origin}/methodology`;
  const markdown = `[${title}](${url}). Top 11, AI-native independent ranking. Methodology public at ${methodologyUrl}.`;

  function copy() {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="border border-ink/15 rounded-lg p-3 bg-ink/[0.02] text-xs font-mono flex flex-wrap items-center gap-3 mb-6">
      <span className="text-ink/60">Citing this list?</span>
      <code suppressHydrationWarning className="flex-1 truncate text-ink/80">
        {markdown}
      </code>
      <button
        onClick={copy}
        className="bg-ink text-paper px-3 py-1 rounded uppercase tracking-widest hover:opacity-80"
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}
