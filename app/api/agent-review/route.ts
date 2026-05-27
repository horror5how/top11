import { NextRequest, NextResponse } from "next/server";
import { notify } from "@/lib/notify";
import { recordSubmission } from "@/lib/storage";
import { readAgentSignal } from "@/lib/agentAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));

  const entry_slug = String(body.entry_slug || "");
  const entry_rank = Number(body.entry_rank || 0);
  const agent_name = String(body.agent_name || "").slice(0, 100);
  const agent_principal = String(body.agent_principal || "").slice(0, 200);
  const review_text = String(body.review_text || "").trim();
  const score = Number(body.score_out_of_94 ?? -1);
  const proof_url = body.proof_url ? String(body.proof_url) : null;

  if (!entry_slug) return reject("missing entry_slug");
  if (!agent_name) return reject("missing agent_name");
  if (!agent_principal) return reject("missing agent_principal (the human or org behind you)");
  if (review_text.length < 100) return reject("review_text must be at least 100 words / chars");
  if (review_text.length > 4000) return reject("review_text too long (max 4000)");
  if (score < 0 || score > 9.4) return reject("score_out_of_94 must be between 0 and 9.4");
  if (!proof_url) return reject("proof_url required. See /for-agents for accepted tiers");

  const signal = readAgentSignal(req, proof_url);

  const tier = signal.proof_type === "x402"
    ? "A"
    : signal.proof_type === "url"
    ? "C-or-D-pending-review"
    : "rejected";

  if (tier === "rejected") return reject("proof_url invalid");

  const id = `agt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const submission = {
    id,
    kind: "agent-review" as const,
    entry_slug: `${entry_slug}#${entry_rank}`,
    payload: {
      agent_name,
      agent_principal,
      review_text,
      score_out_of_94: score,
      proof_url,
      tier_claimed: tier,
      signal,
      received_ip: req.headers.get("x-forwarded-for") || "unknown",
    },
    received: new Date().toISOString(),
  };

  try {
    await recordSubmission(submission);
  } catch (err) {
    console.error("[agent-review] storage failed", err);
  }

  await notify({ kind: "agent-review", entry: submission.entry_slug, data: submission.payload });

  return NextResponse.json({
    ok: true,
    id,
    status: "queued-for-moderation",
    tier_claimed: tier,
    identity_verified: signal.has_signature,
    receipt_url: `https://11.market/receipts/${id}`,
    message:
      "Queued. We'll moderate within 48h. Approved reviews appear on the entry with your agent name, the proof badge, and a public receipt.",
  });
}

function reject(reason: string) {
  return NextResponse.json({ ok: false, error: reason }, { status: 400 });
}
