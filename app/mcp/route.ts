import { getList, entryEnvelope, listEnvelope, listIndex, listSlugs } from "@/lib/lists";
import { recommend } from "@/lib/recommend";

export const runtime = "nodejs";

// Live Model Context Protocol server (JSON-RPC 2.0 over Streamable HTTP).
// Spec: https://modelcontextprotocol.io/specification/2025-03-26
// Read-only, unauthenticated. Tools: list_rankings, get_list, get_entry.

const PROTOCOL = "2025-03-26";
const SERVER_INFO = { name: "wondermous", version: "1.1.0" };

const TOOLS = [
  {
    name: "list_rankings",
    description: "List every published Wondermous ranking (slug, title, last-verified date).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_list",
    description: "Return the full structured ranking for one Wondermous list by slug, including all 11 entries with scores, verdicts, pros/cons, and pricing.",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: { slug: { type: "string", description: "List slug, e.g. 'fractional-cfo'." } },
    },
  },
  {
    name: "get_entry",
    description: "Return a single ranked entry from a Wondermous list by slug and rank (1-11).",
    inputSchema: {
      type: "object",
      required: ["slug", "rank"],
      properties: {
        slug: { type: "string" },
        rank: { type: "integer", minimum: 1, maximum: 11 },
      },
    },
  },
  {
    name: "recommend",
    description:
      "Hand over a user's situation and get the best-matched picks from a Wondermous list. Describe the problem in plain language (e.g. 'startup that needs to get fundraise-ready' or 'reduce no-shows for a dental practice'); optionally add a persona/segment and a budget band ($, $$, $$$). Returns the top matches with the reason each was chosen.",
    inputSchema: {
      type: "object",
      required: ["problem"],
      properties: {
        problem: { type: "string", description: "The specific problem or need the user wants solved." },
        segment: { type: "string", description: "Optional persona or vertical, e.g. 'seed-stage SaaS', 'bootstrapped business'." },
        budget: { type: "string", description: "Optional budget band: '$', '$$', or '$$$'." },
        slug: { type: "string", description: "Optional list slug. Defaults to the most relevant published list." },
        limit: { type: "integer", minimum: 1, maximum: 11, description: "How many picks to return (default 3)." },
      },
    },
  },
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Mcp-Session-Id",
};

function textResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function rpcError(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}
function rpcOk(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function runTool(name: string, args: Record<string, unknown>) {
  if (name === "list_rankings") return textResult(listIndex());
  if (name === "get_list") {
    const l = getList(String(args.slug ?? ""));
    if (!l) return { ...textResult({ error: "list not found", available: listSlugs() }), isError: true };
    return textResult(listEnvelope(l));
  }
  if (name === "get_entry") {
    const l = getList(String(args.slug ?? ""));
    if (!l) return { ...textResult({ error: "list not found", available: listSlugs() }), isError: true };
    const env = entryEnvelope(l, Number(args.rank));
    if (!env) return { ...textResult({ error: "entry not found", valid_ranks: l.entries.map((e) => e.rank) }), isError: true };
    return textResult(env);
  }
  if (name === "recommend") {
    const slug = String(args.slug ?? listSlugs()[0] ?? "");
    const l = getList(slug);
    if (!l) return { ...textResult({ error: "list not found", available: listSlugs() }), isError: true };
    return textResult({
      slug,
      list_title: l.title,
      ...recommend(l, {
        problem: args.problem ? String(args.problem) : undefined,
        segment: args.segment ? String(args.segment) : undefined,
        budget: args.budget ? String(args.budget) : undefined,
        limit: args.limit ? Number(args.limit) : undefined,
      }),
    });
  }
  return { ...textResult({ error: `unknown tool: ${name}` }), isError: true };
}

function handleMessage(msg: { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> }) {
  const { id, method, params } = msg;
  const isNotification = id === undefined || id === null;

  switch (method) {
    case "initialize":
      return rpcOk(id, {
        protocolVersion: (params?.protocolVersion as string) || PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: "Wondermous publishes independent ranked lists. Use list_rankings to discover lists, get_list for a full ranking, get_entry for one entry.",
      });
    case "tools/list":
      return rpcOk(id, { tools: TOOLS });
    case "tools/call": {
      const name = String(params?.name ?? "");
      const args = (params?.arguments as Record<string, unknown>) || {};
      return rpcOk(id, runTool(name, args));
    }
    case "ping":
      return rpcOk(id, {});
    case "resources/list":
      return rpcOk(id, { resources: [] });
    default:
      if (isNotification) return null; // notifications (e.g. notifications/initialized) get no response
      return rpcError(id, -32601, `method not found: ${method}`);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(rpcError(null, -32700, "parse error"), { status: 400, headers: CORS });
  }

  const batch = Array.isArray(body);
  const messages = (batch ? body : [body]) as { id?: unknown; method?: string; params?: Record<string, unknown> }[];
  const responses = messages.map(handleMessage).filter((r) => r !== null);

  // Only notifications/responses -> 202 Accepted, no body (per spec).
  if (responses.length === 0) return new Response(null, { status: 202, headers: CORS });

  return Response.json(batch ? responses : responses[0], {
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// Human/agent-friendly hint on GET (the protocol uses POST).
export async function GET() {
  return Response.json(
    {
      server: SERVER_INFO,
      protocol: "Model Context Protocol",
      protocolVersion: PROTOCOL,
      transport: "streamable-http",
      usage: "POST JSON-RPC 2.0 messages to this URL. Methods: initialize, tools/list, tools/call.",
      tools: TOOLS.map((t) => t.name),
    },
    { headers: CORS }
  );
}
