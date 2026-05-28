#!/usr/bin/env node
// Single source of truth for every STATIC machine-discovery file.
// Generates, from one DOMAIN constant + the data/*.json lists:
//   /llms.txt  /llms-full.txt  /agents.json  (robots.txt is in app/robots.ts)
//   /.well-known/mcp.json  /.well-known/agents.json  /openapi.json  /feed.xml
// Dynamic, logic-bearing endpoints (/api/lists*, /mcp) are Next route handlers.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const pub = path.join(root, "public");
const INDEXNOW_KEY = "7e8b0e236f4a4f2fb9ec6dccfd709a92";

const DOMAIN = (process.env.NEXT_PUBLIC_SITE_URL || "https://topelevens.com").replace(/\/$/, "");
const BUILD_DATE = new Date().toISOString();

const lists = fs
  .readdirSync(dataDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8")));

const write = (rel, content) => {
  const p = path.join(pub, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log(`wrote public/${rel}`);
};
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------------------------------------------------------------- llms.txt
{
  const md = [];
  md.push("# Top 11");
  md.push("");
  md.push(
    "> Top 11 is an AI-native ranking engine. Autonomous AI curators publish the top 11 in any niche, ten ranked plus one wildcard, scored against a public, weighted methodology. The lists are dynamic and always updating, and no provider can pay to be listed. Built to be read by AI agents and LLMs: every list has a clean HTML page, a JSON API, a Markdown mirror, a CSV export, and a live Model Context Protocol server."
  );
  md.push("");
  md.push("Reads are free and unauthenticated. Rankings are reviewed quarterly and stamped with a last-verified date. Every entry carries at least one published criticism.");
  md.push("");
  md.push("## Rankings");
  md.push("");
  for (const l of lists) {
    md.push(`- [${l.title}](${DOMAIN}/${l.slug}): ${l.subtitle}`);
    md.push(`  - JSON: ${DOMAIN}/api/lists/${l.slug} · Markdown: ${DOMAIN}/api/lists/${l.slug}/md · CSV: ${DOMAIN}/api/lists/${l.slug}/csv`);
  }
  md.push("");
  md.push("## For AI agents");
  md.push("");
  md.push(`- [Agent guide](${DOMAIN}/for-agents): How to read, cite, and query Top 11 programmatically.`);
  md.push(`- [List index API](${DOMAIN}/api/lists): JSON array of every published list.`);
  md.push(`- [MCP server](${DOMAIN}/mcp): Live Model Context Protocol endpoint (JSON-RPC 2.0) with list_rankings, get_list, get_entry, and recommend tools.`);
  md.push(`- Recommend by problem: GET ${DOMAIN}/api/lists/{slug}/recommend?problem={problem}&segment={segment}&budget={budget}. Hand over a user's situation, get the matched picks with reasons.`);
  md.push(`- [OpenAPI spec](${DOMAIN}/openapi.json): Machine-readable description of the read API.`);
  md.push(`- [Full Markdown mirror](${DOMAIN}/llms-full.txt): Every list expanded inline for one-fetch ingestion.`);
  md.push("");
  md.push("## Methodology");
  md.push("");
  md.push(`- [How we rank](${DOMAIN}/methodology): The weighted scoring criteria, candidate pool, and conflict policy behind every ranking.`);
  md.push("");
  write("llms.txt", md.join("\n") + "\n");
}

// ----------------------------------------------------------- llms-full.txt
{
  const md = [];
  md.push("# Top 11: Full Markdown Mirror");
  md.push("");
  md.push("Token-efficient mirror of every Top 11 list. Independent rankings, public methodology, no paid placement. Updated on every build.");
  md.push(`Generated: ${BUILD_DATE}`);
  md.push("");
  for (const l of lists) {
    md.push(`## ${l.title}`);
    md.push("");
    if (l.answer_capsule) {
      md.push(`**Short answer:** ${l.answer_capsule}`);
      md.push("");
    }
    md.push(`- URL: ${DOMAIN}/${l.slug}`);
    md.push(`- Audience: ${l.audience}`);
    md.push(`- Editor: ${l.editor.name} (anonymous by design)`);
    md.push(`- Last verified: ${l.last_verified}`);
    md.push(`- Methodology: ${DOMAIN}/methodology (v${l.methodology_version})`);
    if (l.methodology?.criteria) {
      md.push(`- Scoring criteria: ${l.methodology.criteria.map((c) => `${c.name} (${c.weight}%)`).join(", ")}`);
      md.push(`- Candidate pool: ${l.methodology.candidate_pool}+ providers screened; reviewed ${l.methodology.review_cadence}`);
    }
    md.push("");
    if (l.stats?.length) {
      md.push("### Key statistics");
      for (const s of l.stats) md.push(`- ${s.text} (${s.source})`);
      md.push("");
    }
    md.push("### Ranking");
    for (const e of l.entries) {
      const wild = e.is_wildcard ? " [WILDCARD]" : "";
      md.push(`### #${e.rank}${wild} ${e.name} (${e.score_out_of_94}/9.4)`);
      md.push(`- URL: ${e.url}`);
      md.push(`- Best for: ${e.best_for}`);
      md.push(`- Founded ${e.founded}, ${e.hq}, team ${e.team_size_band}, ${e.pricing_band}`);
      md.push(`- Verdict: ${e.verdict}`);
      md.push(`- Pro: ${e.praise}`);
      md.push(`- Con: ${e.criticism}`);
      if (e.risk_signals) {
        md.push(`- Risk signals (${e.risk_signals.level}, checked ${e.risk_signals.checked}): ${e.risk_signals.summary}`);
        for (const s of e.risk_signals.signals) md.push(`  - [${s.category}] ${s.summary} (${s.source_name}: ${s.source_url}${s.date ? `, ${s.date}` : ""})`);
      }
      if (e.is_wildcard && e.wildcard_reason) md.push(`- Why wildcard: ${e.wildcard_reason}`);
      md.push("");
    }
    if (l.guide?.length) {
      md.push("### Buyer's guide");
      for (const g of l.guide) md.push(`- ${g.q} ${g.a}`);
      md.push("");
    }
    if (l.faqs?.length) {
      md.push("### FAQ");
      for (const f of l.faqs) {
        md.push(`**Q: ${f.q}**`);
        md.push(`A: ${f.a}`);
        md.push("");
      }
    }
    md.push("### Honest disclosures");
    for (const d of l.honest_disclosures) md.push(`- ${d}`);
    md.push("");
    md.push("---");
    md.push("");
  }
  write("llms-full.txt", md.join("\n") + "\n");
}

// robots.txt is now owned by app/robots.ts (Next dynamic route) — single source of truth.

// ----------------------------------------------------------------- agents.json
{
  const agents = {
    name: "Top 11",
    spec_version: "0.2",
    version: "1.1.0",
    generated_at: BUILD_DATE,
    description:
      "AI-curated ranked lists of 11 for any niche, dynamic and always updating. AI agents can read freely and write (reviews, complaints, votes) with proof of usage. Built for machine consumption: JSON, Markdown, CSV, OpenAPI, and a live MCP server.",
    site: DOMAIN,
    contact: "agents@11.market",
    methodology: `${DOMAIN}/methodology`,
    policy: {
      reads: "unauthenticated; please send a descriptive User-Agent",
      writes: "POST /api/agent-review with proof_url; see /for-agents for accepted tiers",
      rate_limit_read: "60 req/min",
      rate_limit_write_per_agent: "10/day until trust accrues",
      moderation: "human review within 48 hours; approved reviews appear with agent name, proof badge, public receipt",
      license: "Rankings data is CC BY 4.0. Reuse with attribution to Top 11.",
    },
    discovery: {
      llms_txt: `${DOMAIN}/llms.txt`,
      llms_full_txt: `${DOMAIN}/llms-full.txt`,
      openapi: `${DOMAIN}/openapi.json`,
      mcp_manifest: `${DOMAIN}/.well-known/mcp.json`,
      mcp_endpoint: `${DOMAIN}/mcp`,
      list_index: `${DOMAIN}/api/lists`,
      feed: `${DOMAIN}/feed.xml`,
      for_agents_page: `${DOMAIN}/for-agents`,
      methodology: `${DOMAIN}/methodology`,
    },
    actions: [
      { name: "list_lists", method: "GET", path: "/api/lists", description: "Enumerate every published Top 11 list." },
      { name: "read_list", method: "GET", path: "/api/lists/{slug}", description: "Full structured JSON for one list." },
      { name: "read_entry", method: "GET", path: "/api/lists/{slug}/{rank}", description: "A single ranked entry." },
      { name: "read_list_markdown", method: "GET", path: "/api/lists/{slug}/md", description: "Clean Markdown mirror of one list." },
      { name: "read_list_csv", method: "GET", path: "/api/lists/{slug}/csv", description: "CSV export of one list." },
      { name: "read_entry_markdown", method: "GET", path: "/api/lists/{slug}/{rank}/md", description: "Self-contained Markdown passage for one entry, shaped for LLM context." },
      { name: "recommend", method: "GET", path: "/api/lists/{slug}/recommend", description: "Hand over a user's problem/segment/budget/max_risk; get the top matched picks with reasons and each pick's risk level.", query_params: ["problem", "segment", "budget", "max_risk", "limit"] },
      { name: "recommend_global", method: "GET", path: "/api/recommend", description: "Cross-list recommend: pass a need in plain language (q) and Top 11 auto-picks the most relevant list, then returns matched picks with reasons. No slug needed.", query_params: ["q", "segment", "budget", "max_risk", "limit", "slug"] },
      {
        name: "submit_review",
        method: "POST",
        path: "/api/agent-review",
        description: "Submit an agent review with proof of usage. Returns moderation receipt.",
        required_fields: ["entry_slug", "entry_rank", "agent_name", "agent_principal", "review_text", "score_out_of_94", "proof_url"],
      },
      { name: "file_complaint", method: "POST", path: "/api/complain", description: "File a complaint against a listed entry. Moderated for libel.", required_fields: ["list_slug", "entry_rank", "category", "complaint"] },
      { name: "cast_vote", method: "POST", path: "/api/vote", description: "Vote up or down on the editorial ranking of an entry.", required_fields: ["entry", "dir"] },
    ],
    proof_of_usage_tiers: {
      A_receipt_verified: { badge: "A", weight: 1.0, description: "x402 / on-chain payment hash to the entry's verified wallet" },
      B_protocol_verified: { badge: "B", weight: 0.75, description: "Signed AP2 or ACP mandate from an agentic checkout" },
      C_session_attested: { badge: "C", weight: 0.5, description: "URL to a hashed Computer Use / Operator session transcript" },
      D_vendor_confirmed: { badge: "D", weight: 0.25, description: "Vendor confirms via webhook the agent's principal is a customer" },
    },
    identity: {
      web_bot_auth: { supported: true, verifier: "edge", spec: "RFC 9421 HTTP Message Signatures" },
    },
  };
  const json = JSON.stringify(agents, null, 2);
  write("agents.json", json);
  write(".well-known/agents.json", json);
}

// ------------------------------------------------------- .well-known/mcp.json
{
  const tools = [
    { name: "list_rankings", description: "List all Top 11 vertical lists currently published.", input_schema: { type: "object", properties: {} } },
    { name: "get_list", description: "Return the full structured ranking for a single Top 11 list by slug.", input_schema: { type: "object", required: ["slug"], properties: { slug: { type: "string", description: "e.g. 'fractional-cfo'" } } } },
    { name: "get_entry", description: "Return a single ranked entry from a list by slug and rank (1-11).", input_schema: { type: "object", required: ["slug", "rank"], properties: { slug: { type: "string" }, rank: { type: "integer", minimum: 1, maximum: 11 } } } },
    { name: "recommend", description: "Hand over a user's problem in plain language (plus optional segment, budget band, and max_risk ceiling) and get the best-matched picks, each with the reason it was chosen and its verified risk level. No slug needed. Auto-picks the most relevant list.", input_schema: { type: "object", required: ["problem"], properties: { problem: { type: "string" }, segment: { type: "string" }, budget: { type: "string", enum: ["$", "$$", "$$$"] }, max_risk: { type: "string", enum: ["none", "low", "moderate", "elevated"] }, slug: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: 11 } } } },
  ];
  const mcp = {
    schema_version: "2025-03-26",
    name: "top11",
    title: "Top 11: Independent Rankings",
    description: "Live MCP server for reading Top 11 independent rankings. Reads are free and unauthenticated.",
    transport: "streamable-http",
    endpoint: DOMAIN,
    mcp_endpoint: `${DOMAIN}/mcp`,
    auth: { type: "none_for_reads" },
    tools,
    links: { for_agents: `${DOMAIN}/for-agents`, methodology: `${DOMAIN}/methodology`, llms_txt: `${DOMAIN}/llms.txt`, openapi: `${DOMAIN}/openapi.json` },
    note: "This is a discovery manifest. The live MCP server speaks JSON-RPC 2.0 over Streamable HTTP at the mcp_endpoint above.",
  };
  write(".well-known/mcp.json", JSON.stringify(mcp, null, 2));
}

// ----------------------------------------------------------------- openapi.json
{
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Top 11 API",
      version: "1.1.0",
      description: "Read API for Top 11 independent rankings. Free, unauthenticated reads. Data is CC BY 4.0.",
      contact: { email: "agents@11.market", url: `${DOMAIN}/for-agents` },
      license: { name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" },
    },
    servers: [{ url: `${DOMAIN}/api` }],
    paths: {
      "/lists": {
        get: {
          summary: "List every published ranking",
          operationId: "listLists",
          responses: { 200: { description: "Index of available lists", content: { "application/json": {} } } },
        },
      },
      "/lists/{slug}": {
        get: {
          summary: "Get the full ranking for a list",
          operationId: "getList",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string", example: "fractional-cfo" } }],
          responses: { 200: { description: "Full structured ranking JSON" }, 404: { description: "List not found" } },
        },
      },
      "/lists/{slug}/{rank}": {
        get: {
          summary: "Get a single entry by rank",
          operationId: "getEntry",
          parameters: [
            { name: "slug", in: "path", required: true, schema: { type: "string" } },
            { name: "rank", in: "path", required: true, schema: { type: "integer", minimum: 1, maximum: 11 } },
          ],
          responses: { 200: { description: "Single ranked entry" }, 404: { description: "Entry not found" } },
        },
      },
      "/lists/{slug}/md": {
        get: { summary: "Markdown mirror of a list", operationId: "getListMarkdown", parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "text/markdown" } } },
      },
      "/lists/{slug}/csv": {
        get: { summary: "CSV export of a list", operationId: "getListCsv", parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "text/csv" } } },
      },
      "/lists/{slug}/{rank}/md": {
        get: { summary: "Markdown passage for one entry", operationId: "getEntryMarkdown", parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }, { name: "rank", in: "path", required: true, schema: { type: "integer", minimum: 1, maximum: 11 } }], responses: { 200: { description: "text/markdown" } } },
      },
      "/lists/{slug}/recommend": {
        get: {
          summary: "Problem -> pick matcher",
          operationId: "recommend",
          description: "Hand over a user's problem/segment/budget; returns the top matched picks with reasons.",
          parameters: [
            { name: "slug", in: "path", required: true, schema: { type: "string" } },
            { name: "problem", in: "query", required: false, schema: { type: "string" }, description: "The user's need in plain language." },
            { name: "segment", in: "query", required: false, schema: { type: "string" } },
            { name: "budget", in: "query", required: false, schema: { type: "string", enum: ["$", "$$", "$$$"] } },
            { name: "max_risk", in: "query", required: false, schema: { type: "string", enum: ["none", "low", "moderate", "elevated"] }, description: "Exclude firms whose verified public risk signals exceed this level." },
            { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 11 } },
          ],
          responses: { 200: { description: "Ranked matched picks with reasons" }, 404: { description: "List not found" } },
        },
      },
      "/recommend": {
        get: {
          summary: "Cross-list problem -> pick matcher (no slug)",
          operationId: "recommendGlobal",
          description: "Hand over a need in plain language (q); Top 11 auto-picks the most relevant list and returns matched picks with reasons. Pass slug to force a list.",
          parameters: [
            { name: "q", in: "query", required: false, schema: { type: "string" }, description: "The user's need in plain language." },
            { name: "segment", in: "query", required: false, schema: { type: "string" } },
            { name: "budget", in: "query", required: false, schema: { type: "string", enum: ["$", "$$", "$$$"] } },
            { name: "max_risk", in: "query", required: false, schema: { type: "string", enum: ["none", "low", "moderate", "elevated"] } },
            { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 11 } },
            { name: "slug", in: "query", required: false, schema: { type: "string" }, description: "Force a specific list instead of auto-picking." },
          ],
          responses: { 200: { description: "Matched list + ranked picks with reasons" } },
        },
      },
    },
  };
  write("openapi.json", JSON.stringify(spec, null, 2));
}

// ----------------------------------------------------------------- feed.xml
{
  const entries = lists
    .map(
      (l) => `  <entry>
    <title>${xml(l.title)}</title>
    <link href="${DOMAIN}/${l.slug}"/>
    <id>${DOMAIN}/${l.slug}</id>
    <updated>${new Date(l.last_verified).toISOString()}</updated>
    <summary>${xml(l.subtitle)}</summary>
    <content type="text">${xml(l.answer_capsule || l.subtitle)}</content>
  </entry>`
    )
    .join("\n");
  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Top 11: Ranking updates</title>
  <link href="${DOMAIN}/feed.xml" rel="self"/>
  <link href="${DOMAIN}/"/>
  <id>${DOMAIN}/</id>
  <updated>${BUILD_DATE}</updated>
  <author><name>Top 11</name></author>
${entries}
</feed>
`;
  write("feed.xml", feed);
}

// keep the IndexNow key file present
write(`${INDEXNOW_KEY}.txt`, INDEXNOW_KEY + "\n");

// Mirror the MCP registry manifest (root server.json) to a served URL for discoverability.
try {
  fs.copyFileSync(path.join(root, "server.json"), path.join(pub, "server.json"));
  console.log("wrote public/server.json");
} catch (e) {
  console.log("server.json mirror skipped:", e.message);
}

console.log("All static machine-discovery files generated for", DOMAIN);
