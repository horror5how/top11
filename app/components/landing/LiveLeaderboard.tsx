"use client";

import { useEffect, useState } from "react";

// Illustrative animation of the dynamic scorecard: rows climb/fall live.
const SEED = ["Northstar", "Vertex Cloud", "Kepler", "Lumen", "Pylon", "Atlas"];
const ROW_H = 46;

export default function LiveLeaderboard() {
  const [order, setOrder] = useState<number[]>(SEED.map((_, i) => i));
  const [scores, setScores] = useState<number[]>(() => SEED.map((_, i) => 9.1 - i * 0.3));
  const [bump, setBump] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setOrder((prev) => {
        const pos = 1 + Math.floor(Math.random() * (prev.length - 1)); // never touch #1 slot blindly
        const next = [...prev];
        [next[pos - 1], next[pos]] = [next[pos], next[pos - 1]];
        setBump(next[pos - 1]);
        setTimeout(() => setBump(null), 900);
        return next;
      });
      setScores((prev) => prev.map((s) => Math.min(9.4, Math.max(6.5, s + (Math.random() - 0.5) * 0.2))));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const rankOf = (item: number) => order.indexOf(item);

  return (
    <div className="relative" style={{ height: SEED.length * ROW_H }}>
      {SEED.map((name, item) => {
        const rank = rankOf(item);
        const climbing = bump === item;
        return (
          <div
            key={item}
            className={`absolute left-0 right-0 flex items-center gap-3 rounded-xl border px-4 transition-[top,background,border-color] duration-700 ${
              climbing ? "border-[#ff5722]/60 bg-[#ff5722]/[0.08]" : "border-white/10 bg-white/[0.03]"
            }`}
            style={{ top: rank * ROW_H, height: ROW_H - 8 }}
          >
            <span className={`w-6 text-center font-extrabold tabular-nums ${rank === 0 ? "text-[#ff5722]" : "text-white/50"}`}>
              {rank + 1}
            </span>
            <span className="flex-1 text-sm font-semibold text-white/85">{name}</span>
            {climbing && <span className="text-[10px] font-bold text-[#ff5722]">▲ moved</span>}
            <span className="font-mono text-xs tabular-nums text-white/45">{scores[item].toFixed(1)}</span>
          </div>
        );
      })}
    </div>
  );
}
