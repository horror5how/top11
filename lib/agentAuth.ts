// Lightweight Web Bot Auth detection — we don't crypto-verify in V1,
// we surface signal that the agent is using the standard. Real verification
// happens at Cloudflare's edge once we're behind it.

export type AgentSignal = {
  declared_agent: string | null;
  has_signature: boolean;
  signature_agent_domain: string | null;
  user_agent: string;
  proof_url: string | null;
  proof_type: "x402" | "url" | "none";
};

export function readAgentSignal(req: Request, proofUrl?: string | null): AgentSignal {
  const ua = req.headers.get("user-agent") || "unknown";
  const sig = req.headers.get("signature");
  const sigInput = req.headers.get("signature-input");
  const sigAgent = req.headers.get("signature-agent");

  let domain: string | null = null;
  if (sigAgent) {
    try {
      domain = new URL(sigAgent.replace(/"/g, "")).hostname;
    } catch {
      domain = null;
    }
  }

  let proofType: AgentSignal["proof_type"] = "none";
  if (proofUrl) {
    proofType = /^0x[a-fA-F0-9]{40,}$/.test(proofUrl) ? "x402" : "url";
  }

  const declaredAgent = inferAgentFromUA(ua) ?? domain;

  return {
    declared_agent: declaredAgent,
    has_signature: !!(sig && sigInput),
    signature_agent_domain: domain,
    user_agent: ua,
    proof_url: proofUrl ?? null,
    proof_type: proofType,
  };
}

function inferAgentFromUA(ua: string): string | null {
  const lower = ua.toLowerCase();
  if (lower.includes("claude")) return "anthropic";
  if (lower.includes("gptbot") || lower.includes("openai")) return "openai";
  if (lower.includes("perplexity")) return "perplexity";
  if (lower.includes("gemini") || lower.includes("google-extended")) return "google";
  if (lower.includes("cursor")) return "cursor";
  if (lower.includes("operator")) return "openai-operator";
  if (lower.includes("computer-use")) return "anthropic-computer-use";
  return null;
}
