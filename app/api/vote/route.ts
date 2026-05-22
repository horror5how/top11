import { NextRequest, NextResponse } from "next/server";
import { castVote, getVotes } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const entry = req.nextUrl.searchParams.get("entry");
  if (!entry) return NextResponse.json({ error: "missing entry" }, { status: 400 });
  const v = await getVotes(entry);
  return NextResponse.json(v);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const entry = String(body.entry || "");
  const dir = body.dir === "down" ? "down" : "up";
  if (!entry || !/^[a-z0-9\-]+$/.test(entry)) {
    return NextResponse.json({ error: "bad entry slug" }, { status: 400 });
  }
  const v = await castVote(entry, dir);
  return NextResponse.json(v);
}
