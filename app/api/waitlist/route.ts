import { NextResponse } from "next/server";
import { recordSubmission } from "@/lib/storage";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Human funnel: "build my niche" / "notify me" capture from the landing page.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const email = String(body.email || "").trim().slice(0, 200);
  const niche = String(body.niche || "").trim().slice(0, 300);
  if (!email.includes("@") || email.length < 5) {
    return NextResponse.json({ ok: false, error: "valid email required" }, { status: 400 });
  }
  const id = `wl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    await recordSubmission({
      id,
      kind: "waitlist" as never,
      entry_slug: niche || "(general)",
      payload: { email, niche },
      received: new Date().toISOString(),
    } as never);
    await notify({ kind: "waitlist", entry: niche || "(general)", data: { email, niche } } as never);
  } catch (err) {
    console.error("[waitlist] record failed", err);
  }
  return NextResponse.json({ ok: true, id, message: "You're on the list. We build niches on demand." });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*" } });
}
