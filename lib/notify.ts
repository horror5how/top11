// Notification adapters. Uses Loops transactional API if available.
// Falls back to no-op console.log so V1 ships without external deps.

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "hayat@beyondelevation.com";
const LOOPS_TRANSACTIONAL_ID = process.env.LOOPS_TRANSACTIONAL_ID; // optional

export type NotifyPayload = {
  kind: "complaint" | "agent-review" | "vote-burst";
  entry?: string;
  data: Record<string, unknown>;
};

export async function notify(payload: NotifyPayload): Promise<{ ok: boolean; via: string }> {
  // Always log to server console (Vercel captures these).
  console.log(`[notify:${payload.kind}]`, JSON.stringify(payload));

  if (!LOOPS_API_KEY || !LOOPS_TRANSACTIONAL_ID) {
    return { ok: true, via: "console" };
  }

  try {
    const res = await fetch("https://app.loops.so/api/v1/transactional", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transactionalId: LOOPS_TRANSACTIONAL_ID,
        email: NOTIFY_EMAIL,
        dataVariables: {
          kind: payload.kind,
          entry: payload.entry || "—",
          payload_json: JSON.stringify(payload.data, null, 2).slice(0, 4000),
        },
      }),
    });
    return { ok: res.ok, via: "loops" };
  } catch (err) {
    console.error("[notify:loops] failed", err);
    return { ok: false, via: "loops-error" };
  }
}
