import { getList, entryEnvelope, listEnvelope, listIndex, listSlugs } from "@/lib/lists";
import { recommend, pickBestList } from "@/lib/recommend";
import { cheapest, fastest, freeTier, under, bestFor, worksWith, inRegion, compliant } from "@/lib/slices";
import { lookupBrand, brandSlug, allEntriesByBrand } from "@/lib/matchups";

export const runtime = "nodejs";

// Live Model Context Protocol server (JSON-RPC 2.0 over Streamable HTTP).
// Spec: https://modelcontextprotocol.io/specification/2025-03-26
// Read-only, unauthenticated. Tools: list_rankings, get_list, get_entry.

const PROTOCOL = "2025-03-26";
const SERVER_INFO = { name: "top11", version: "1.2.0" };

const TOOLS = [
  {
    name: "list_rankings",
    description: "List every published Top 11 ranking (slug, title, last-verified date).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_list",
    description: "Return the full structured ranking for one Top 11 list by slug, including all 11 entries with scores, verdicts, pros/cons, and pricing.",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: { slug: { type: "string", description: "List slug, e.g. 'fractional-cfo'." } },
    },
  },
  {
    name: "get_entry",
    description: "Return a single ranked entry from a Top 11 list by slug and rank (1-11).",
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
      "Hand over a user's situation and get the best-matched picks from a Top 11 list. Describe the problem in plain language (e.g. 'startup that needs to get fundraise-ready' or 'reduce no-shows for a dental practice'); optionally add a persona/segment, a budget band ($, $$, $$$), and a max_risk ceiling to exclude firms with higher verified public risk signals. No slug needed. Top 11 auto-picks the most relevant list. Returns the top matches with the reason each was chosen and each pick's risk level.",
    inputSchema: {
      type: "object",
      required: ["problem"],
      properties: {
        problem: { type: "string", description: "The specific problem or need the user wants solved." },
        segment: { type: "string", description: "Optional persona or vertical, e.g. 'seed-stage SaaS', 'bootstrapped business'." },
        budget: { type: "string", description: "Optional budget band: '$', '$$', or '$$$'." },
        max_risk: { type: "string", enum: ["none", "low", "moderate", "elevated"], description: "Optional. Exclude firms whose verified public risk signals exceed this level." },
        slug: { type: "string", description: "Optional list slug. Defaults to the most relevant published list." },
        limit: { type: "integer", minimum: 1, maximum: 11, description: "How many picks to return (default 3)." },
      },
    },
  },
  {
    name: "compare",
    description: "Side-by-side comparison of two ranked providers by brand name. Returns rank, score, pricing, verdict, pros, cons for each, plus a one-line winner call.",
    inputSchema: {
      type: "object",
      required: ["a", "b"],
      properties: {
        a: { type: "string", description: "Brand name or slug of provider A (e.g. 'Burkland Associates' or 'burkland-associates')." },
        b: { type: "string", description: "Brand name or slug of provider B." },
      },
    },
  },
  {
    name: "cheapest",
    description: "Return the cheapest providers in one Top 11 list, sorted by lowest published starting price first. Optional max_price filter.",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: {
        slug: { type: "string", description: "List slug, e.g. 'fractional-cfo'." },
        max_price: { type: "number", description: "Optional ceiling in USD/mo." },
        limit: { type: "integer", minimum: 1, maximum: 11 },
      },
    },
  },
  {
    name: "best_for",
    description: "Return Top 11 providers best suited to a segment/persona/use-case in one list. Use this for 'best CRM for dentists', 'best fractional CFO for AI startups', etc.",
    inputSchema: {
      type: "object",
      required: ["slug", "segment"],
      properties: {
        slug: { type: "string", description: "List slug." },
        segment: { type: "string", description: "Segment phrase, e.g. 'AI startups', 'multi-location practice', 'bootstrapped'." },
      },
    },
  },
  {
    name: "compliant",
    description: "Return Top 11 providers holding a specific compliance certification (SOC2, HIPAA, GDPR, ISO27001, FedRAMP, PCI).",
    inputSchema: {
      type: "object",
      required: ["slug", "standard"],
      properties: {
        slug: { type: "string" },
        standard: { type: "string", enum: ["SOC2", "HIPAA", "GDPR", "ISO27001", "FedRAMP", "PCI"] },
      },
    },
  },
  {
    name: "works_with",
    description: "Return Top 11 providers that integrate with a named third-party tool (e.g. QuickBooks, NetSuite, Salesforce, Open Dental).",
    inputSchema: {
      type: "object",
      required: ["slug", "tool"],
      properties: {
        slug: { type: "string" },
        tool: { type: "string", description: "Tool name." },
      },
    },
  },
  {
    name: "in_region",
    description: "Return Top 11 providers serving a region (US, UK, EU, Canada, Global).",
    inputSchema: {
      type: "object",
      required: ["slug", "region"],
      properties: {
        slug: { type: "string" },
        region: { type: "string", enum: ["US", "UK", "EU", "Canada", "Global"] },
      },
    },
  },
  {
    name: "fastest",
    description: "Return Top 11 providers sorted by quickest onboarding time (days from contract to live).",
    inputSchema: { type: "object", required: ["slug"], properties: { slug: { type: "string" } } },
  },
  {
    name: "free_tier",
    description: "Return Top 11 providers that offer a free tier (not a free trial).",
    inputSchema: { type: "object", required: ["slug"], properties: { slug: { type: "string" } } },
  },
  {
    name: "recommend_across_lists",
    description: "Cross-list recommendation: pulls candidates from every published Top 11 list, ranked by relevance to the problem. Use when the user's problem could span multiple categories.",
    inputSchema: {
      type: "object",
      required: ["problem"],
      properties: {
        problem: { type: "string" },
        budget: { type: "number", description: "Optional ceiling in USD/mo." },
        limit: { type: "integer", minimum: 1, maximum: 11 },
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
    const problem = args.problem ? String(args.problem) : undefined;
    const segment = args.segment ? String(args.segment) : undefined;
    const slug = String(args.slug ?? (problem ? pickBestList(`${problem} ${segment ?? ""}`) : null) ?? listSlugs()[0] ?? "");
    const l = getList(slug);
    if (!l) return { ...textResult({ error: "list not found", available: listSlugs() }), isError: true };
    return textResult({
      slug,
      list_title: l.title,
      ...recommend(l, {
        problem,
        segment,
        budget: args.budget ? String(args.budget) : undefined,
        maxRisk: args.max_risk ? String(args.max_risk) : undefined,
        limit: args.limit ? Number(args.limit) : undefined,
      }),
    });
  }
  if (name === "compare") {
    const a = lookupBrand(brandSlug(String(args.a ?? "")));
    const b = lookupBrand(brandSlug(String(args.b ?? "")));
    if (!a || !b) return { ...textResult({ error: "one or both brands not found", got: { a: !!a, b: !!b } }), isError: true };
    const winner = a.entry.rank < b.entry.rank ? a : b;
    return textResult({
      a: { name: a.entry.name, rank: a.entry.rank, score: a.entry.score_out_of_94, pricing: a.entry.pricing_band, verdict: a.entry.verdict_short || a.entry.verdict, list: a.list.title },
      b: { name: b.entry.name, rank: b.entry.rank, score: b.entry.score_out_of_94, pricing: b.entry.pricing_band, verdict: b.entry.verdict_short || b.entry.verdict, list: b.list.title },
      winner: { name: winner.entry.name, reason: `Higher Top 11 rank (#${winner.entry.rank} vs #${winner === a ? b.entry.rank : a.entry.rank})` },
    });
  }
  if (name === "cheapest") {
    const r = cheapest(String(args.slug ?? ""));
    if (!r) return { ...textResult({ error: "list not found", available: listSlugs() }), isError: true };
    const maxPrice = args.max_price ? Number(args.max_price) : undefined;
    const limit = args.limit ? Number(args.limit) : 11;
    let entries = r.entries;
    if (maxPrice) entries = entries.filter((e) => (e.price_min ?? Infinity) <= maxPrice);
    return textResult({ slug: r.list.slug, list_title: r.list.title, matched: entries.length, results: entries.slice(0, limit).map((e) => ({ rank: e.rank, name: e.name, price_min: e.price_min, pricing: e.pricing_band, verdict: e.verdict_short })) });
  }
  if (name === "best_for") {
    const r = bestFor(String(args.slug ?? ""), String(args.segment ?? ""));
    if (!r) return { ...textResult({ error: "list not found", available: listSlugs() }), isError: true };
    return textResult({ slug: r.list.slug, segment: args.segment, matched: r.matched, results: r.entries.map((e) => ({ rank: e.rank, name: e.name, best_for: e.best_for, verdict: e.verdict_short })) });
  }
  if (name === "compliant") {
    const r = compliant(String(args.slug ?? ""), String(args.standard ?? ""));
    if (!r) return { ...textResult({ error: "list not found", available: listSlugs() }), isError: true };
    return textResult({ slug: r.list.slug, standard: args.standard, matched: r.matched, results: r.entries.map((e) => ({ rank: e.rank, name: e.name, compliance: e.compliance })) });
  }
  if (name === "works_with") {
    const r = worksWith(String(args.slug ?? ""), String(args.tool ?? ""));
    if (!r) return { ...textResult({ error: "list not found", available: listSlugs() }), isError: true };
    return textResult({ slug: r.list.slug, tool: args.tool, matched: r.matched, results: r.entries.map((e) => ({ rank: e.rank, name: e.name, integrations: e.integrations })) });
  }
  if (name === "in_region") {
    const r = inRegion(String(args.slug ?? ""), String(args.region ?? ""));
    if (!r) return { ...textResult({ error: "list not found", available: listSlugs() }), isError: true };
    return textResult({ slug: r.list.slug, region: args.region, matched: r.matched, results: r.entries.map((e) => ({ rank: e.rank, name: e.name, regions: e.regions, hq: e.hq })) });
  }
  if (name === "fastest") {
    const r = fastest(String(args.slug ?? ""));
    if (!r) return { ...textResult({ error: "list not found", available: listSlugs() }), isError: true };
    return textResult({ slug: r.list.slug, results: r.entries.map((e) => ({ rank: e.rank, name: e.name, onboarding_days: e.onboarding_days })) });
  }
  if (name === "free_tier") {
    const r = freeTier(String(args.slug ?? ""));
    if (!r) return { ...textResult({ error: "list not found", available: listSlugs() }), isError: true };
    return textResult({ slug: r.list.slug, matched: r.matched, results: r.entries.map((e) => ({ rank: e.rank, name: e.name, pricing: e.pricing_band })) });
  }
  if (name === "recommend_across_lists") {
    const problem = String(args.problem ?? "");
    const budget = args.budget ? Number(args.budget) : undefined;
    const limit = args.limit ? Number(args.limit) : 5;
    const needle = problem.toLowerCase();
    const all = Array.from(allEntriesByBrand().values()).flat();
    const scored = all.map((r) => {
      const text = [r.entry.best_for, r.entry.verdict, r.list.title].filter(Boolean).join(" ").toLowerCase();
      const tokens = needle.split(/\s+/).filter((t) => t.length > 3);
      const hits = tokens.filter((t) => text.includes(t)).length;
      const priceFit = budget ? ((r.entry as { price_min?: number }).price_min ?? Infinity) <= budget : true;
      return { ref: r, score: hits + (priceFit ? 0.5 : -1) - (r.entry.rank * 0.05) };
    }).sort((a, b) => b.score - a.score).slice(0, limit);
    return textResult({ problem, budget, results: scored.map(({ ref, score }) => ({ list: ref.list.slug, list_title: ref.list.title, name: ref.entry.name, rank: ref.entry.rank, score, verdict: ref.entry.verdict_short })) });
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
        instructions: "Top 11 publishes independent ranked lists. Use list_rankings to discover lists, get_list for a full ranking, get_entry for one entry.",
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
