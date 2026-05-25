import { NextResponse } from "next/server";
import { listIndex } from "@/lib/lists";

export const runtime = "nodejs";

// GET /api/lists — enumerate every published ranking (no hardcoded slugs).
export async function GET() {
  return NextResponse.json(listIndex(), {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
