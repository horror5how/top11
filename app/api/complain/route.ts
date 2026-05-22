import { NextRequest, NextResponse } from "next/server";
import { notify } from "@/lib/notify";
import { recordSubmission } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const complaint = String(body.complaint || "").trim();
  const listSlug = String(body.list_slug || "");
  const entryRank = Number(body.entry_rank || 0);
  const category = String(body.category || "other");
  const contact = String(body.contact || "");

  if (!complaint || complaint.length < 40) {
    return NextResponse.json({ message: "Complaints need at least 40 characters." }, { status: 400 });
  }
  if (complaint.length > 4000) {
    return NextResponse.json({ message: "Too long. Keep it under 4000 characters." }, { status: 400 });
  }

  const id = `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const submission = {
    id,
    kind: "complaint" as const,
    entry_slug: `${listSlug}#${entryRank}`,
    payload: { complaint, category, contact, list_slug: listSlug, entry_rank: entryRank, ua: req.headers.get("user-agent") },
    received: new Date().toISOString(),
  };

  try {
    await recordSubmission(submission);
  } catch (err) {
    console.error("[complain] storage failed", err);
  }

  await notify({ kind: "complaint", entry: submission.entry_slug, data: submission.payload });

  return NextResponse.json({
    ok: true,
    id,
    message: "Filed. We review within 48h, notify the brand for Right of Reply, and publish if it passes libel review.",
  });
}
