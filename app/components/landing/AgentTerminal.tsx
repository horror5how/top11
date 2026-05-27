"use client";

import { useEffect, useRef, useState } from "react";

const SCRIPT = [
  { t: "cmd", text: "POST /mcp  → tools/call  recommend" },
  { t: "arg", text: '{ "problem": "dental CRM, one patient seen 5 to 6x a day", "segment": "high-volume practice" }' },
  { t: "out", text: "→ #1  Open Dental   9.0/9.4" },
  { t: "out", text: "   why: solves same-day cross-operatory scheduling; fits high-volume practice" },
  { t: "out", text: "→ #2  CareStack     8.8/9.4   (DSO scale)" },
  { t: "done", text: "cited. answer returned to user in 1 call." },
];

export default function AgentTerminal() {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          let i = 0;
          const id = setInterval(() => {
            i += 1;
            setShown(i);
            if (i >= SCRIPT.length) clearInterval(id);
          }, 650);
        }
      });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="rounded-2xl border border-white/10 bg-[#0c0c0f] overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[11px] text-white/40">agent → wondermous mcp</span>
      </div>
      <div className="p-5 font-mono text-[12.5px] leading-relaxed min-h-[210px]">
        {SCRIPT.slice(0, shown).map((l, i) => (
          <div
            key={i}
            className={
              l.t === "cmd" ? "text-white/90"
              : l.t === "arg" ? "text-white/45"
              : l.t === "done" ? "text-[#28c840] mt-2"
              : "text-[#ff8a5c]"
            }
          >
            {l.t === "cmd" ? "$ " : ""}
            {l.text}
            {i === shown - 1 && shown < SCRIPT.length && <span className="wm-caret" />}
          </div>
        ))}
        {shown === 0 && <span className="wm-caret text-white/90" />}
      </div>
    </div>
  );
}
