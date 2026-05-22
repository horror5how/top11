"use client";

import { useState } from "react";

type Q = { id: string; label: string; options: { value: string; label: string; map: number[] }[] };

// Quiz biases the user toward 3 entries based on answers.
// Map values reference rank numbers (1..11) in the list JSON.
const QUESTIONS: Q[] = [
  {
    id: "stage",
    label: "Where are you in the journey?",
    options: [
      { value: "pre-seed", label: "Pre-seed / bootstrapped", map: [3, 11, 7] },
      { value: "seed-a", label: "Seed to Series A (≤$10M ARR)", map: [2, 3, 5] },
      { value: "b-plus", label: "Series B+ (≥$10M ARR)", map: [1, 2, 6] },
    ],
  },
  {
    id: "geo",
    label: "Where do you operate?",
    options: [
      { value: "us-only", label: "US only", map: [1, 2, 3] },
      { value: "international", label: "Multi-country (US + UK / EU / APAC)", map: [10, 1, 6] },
      { value: "uk-eu", label: "UK / EU primary", map: [10, 11, 6] },
    ],
  },
  {
    id: "vibe",
    label: "What kind of partner are you actually after?",
    options: [
      { value: "venture-fluent", label: "Investor-fluent — they speak board-deck", map: [1, 2, 3] },
      { value: "ops-partner", label: "Operating partner — into unit economics", map: [7, 6, 4] },
      { value: "ai-native", label: "AI-native — fluent in my product stack", map: [5, 11, 4] },
    ],
  },
  {
    id: "budget",
    label: "Monthly retainer ballpark?",
    options: [
      { value: "small", label: "Under $3k / mo", map: [11, 3, 7] },
      { value: "mid", label: "$3k – $10k / mo", map: [4, 5, 6] },
      { value: "large", label: "$10k+ / mo", map: [1, 2, 10] },
    ],
  },
  {
    id: "specialty",
    label: "Anything else that matters?",
    options: [
      { value: "rnd-credit", label: "Reclaim R&D tax credit aggressively", map: [2, 1, 6] },
      { value: "fundraise", label: "Fundraise in next 12 months", map: [1, 2, 3] },
      { value: "clean-books", label: "Just need clean monthly close", map: [4, 5, 7] },
      { value: "marketplace", label: "Want to pick the individual myself", map: [9, 11, 5] },
    ],
  },
  {
    id: "speed",
    label: "How fast do you need to start?",
    options: [
      { value: "this-week", label: "This week", map: [8, 4, 9] },
      { value: "this-month", label: "This month", map: [1, 2, 3] },
      { value: "exploring", label: "Just exploring", map: [3, 11, 5] },
    ],
  },
];

const NAME_BY_RANK: Record<number, string> = {
  1: "Burkland Associates",
  2: "Kruze Consulting",
  3: "Graphite Financial",
  4: "Pilot",
  5: "Zeni",
  6: "Preferred CFO",
  7: "Driven Insights",
  8: "NOW CFO",
  9: "Paro",
  10: "The CFO Centre",
  11: "TheCFOSquad (Wildcard)",
};

export default function MatchmakerQuiz({ slug }: { slug: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (step < QUESTIONS.length) {
    const q = QUESTIONS[step];
    return (
      <div className="border border-ink/15 rounded-xl p-5 bg-paper">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50 mb-2">
          Question {step + 1} / {QUESTIONS.length}
        </p>
        <h3 className="text-lg font-medium mb-4">{q.label}</h3>
        <div className="space-y-2">
          {q.options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                setAnswers((a) => ({ ...a, [q.id]: o.map }));
                setStep(step + 1);
              }}
              className="block w-full text-left border border-ink/15 hover:border-wildcard rounded px-4 py-3 text-sm transition-colors"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Score
  const scores: Record<number, number> = {};
  for (const map of Object.values(answers)) {
    map.forEach((rank, i) => {
      scores[rank] = (scores[rank] || 0) + (3 - i);
    });
  }
  const top3 = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([rank]) => Number(rank));

  async function captureEmail() {
    if (!email || !email.includes("@")) return;
    setSubmitted(true);
    try {
      await fetch("/api/complain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          list_slug: slug,
          entry_rank: 0,
          category: "quiz-lead",
          complaint: `Quiz match — recommended: ${top3.map((r) => NAME_BY_RANK[r]).join(", ")}. Answers: ${JSON.stringify(answers)}`,
          contact: email,
        }),
      });
    } catch {}
  }

  return (
    <div className="border border-ok bg-ok/[0.04] rounded-xl p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-ok mb-2">Your top 3 matches</p>
      <ol className="space-y-3 mb-5">
        {top3.map((rank, i) => (
          <li key={rank} className="flex items-start gap-3">
            <span className="font-mono text-2xl font-serif">{i + 1}</span>
            <div>
              <a href={`#rank-${rank}`} className="font-medium hover:underline">
                {NAME_BY_RANK[rank]}
              </a>
              <p className="text-xs text-ink/60">Jump to entry #{rank}</p>
            </div>
          </li>
        ))}
      </ol>
      {!submitted ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email me when the list updates"
            className="flex-1 border border-ink/20 rounded px-3 py-2 text-sm bg-paper"
          />
          <button
            onClick={captureEmail}
            className="bg-ink text-paper px-4 py-2 rounded text-sm font-mono uppercase tracking-widest"
          >
            Send me updates
          </button>
        </div>
      ) : (
        <p className="text-sm text-ok">Subscribed ✓ — we'll email when this list re-publishes monthly.</p>
      )}
      <button
        onClick={() => {
          setAnswers({});
          setStep(0);
          setSubmitted(false);
          setEmail("");
        }}
        className="mt-3 text-xs text-ink/60 underline"
      >
        Retake the quiz
      </button>
    </div>
  );
}
