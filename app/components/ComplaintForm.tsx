"use client";

import { useState } from "react";

type EntryRef = { rank: number; name: string };

export default function ComplaintForm({ entries, listSlug }: { entries: EntryRef[]; listSlug: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState<string>("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const form = new FormData(e.currentTarget);
    const payload = {
      list_slug: listSlug,
      entry_rank: Number(form.get("entry") || 0),
      category: String(form.get("category") || ""),
      complaint: String(form.get("complaint") || ""),
      contact: String(form.get("contact") || ""),
    };
    if (!payload.complaint || payload.complaint.length < 40) {
      setState("error");
      setMsg("Complaints need at least 40 characters. Don't be shy.");
      return;
    }
    try {
      const res = await fetch("/api/complain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (res.ok) {
        setState("sent");
        setMsg(d.message || "Filed. We'll review within 48 hours.");
      } else {
        setState("error");
        setMsg(d.message || "Something broke. Try again or email editor@wondermous.ai.");
      }
    } catch {
      setState("error");
      setMsg("Network issue. Try again.");
    }
  }

  if (state === "sent") {
    return (
      <div className="border border-ok bg-ok/5 rounded-xl p-5 text-sm">
        <p className="font-semibold text-ok mb-1">Filed ✓</p>
        <p className="text-ink/80">{msg}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-ink/15 rounded-xl p-5 space-y-4 bg-paper">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-mono uppercase tracking-widest text-ink/60">Complaint about</span>
          <select
            name="entry"
            required
            className="mt-1 w-full border border-ink/20 rounded px-3 py-2 text-sm bg-paper"
          >
            <option value="">Pick an entry…</option>
            {entries.map((e) => (
              <option key={e.rank} value={e.rank}>
                #{e.rank} · {e.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-mono uppercase tracking-widest text-ink/60">Category</span>
          <select
            name="category"
            required
            className="mt-1 w-full border border-ink/20 rounded px-3 py-2 text-sm bg-paper"
          >
            <option value="pricing">Hidden / surprise pricing</option>
            <option value="responsiveness">Ghosted / slow response</option>
            <option value="quality">Quality of work</option>
            <option value="contract">Contract / billing</option>
            <option value="ranking">The ranking is wrong</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-mono uppercase tracking-widest text-ink/60">Your gripe (min 40 chars)</span>
        <textarea
          name="complaint"
          required
          minLength={40}
          maxLength={2000}
          rows={5}
          placeholder="Specifics. Dates. What happened. We can't moderate vibes, but we can moderate facts."
          className="mt-1 w-full border border-ink/20 rounded px-3 py-2 text-sm bg-paper"
        />
      </label>
      <label className="block">
        <span className="text-xs font-mono uppercase tracking-widest text-ink/60">
          Email (optional · so we can verify and notify you on the Right of Reply)
        </span>
        <input
          name="contact"
          type="email"
          className="mt-1 w-full border border-ink/20 rounded px-3 py-2 text-sm bg-paper"
        />
      </label>
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink/50">Moderated for libel. Opinion welcome, even harsh.</p>
        <button
          type="submit"
          disabled={state === "sending"}
          className="bg-ink text-paper px-4 py-2 rounded text-sm font-mono uppercase tracking-widest disabled:opacity-60"
        >
          {state === "sending" ? "Filing…" : "File the gripe"}
        </button>
      </div>
      {state === "error" && <p className="text-bad text-sm">{msg}</p>}
    </form>
  );
}
