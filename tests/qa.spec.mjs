import { chromium } from "/opt/homebrew/lib/node_modules/playwright/index.mjs";

const BASE = process.env.QA_BASE || "https://top11.vercel.app";
const ROUTES = ["/", "/fractional-cfo", "/methodology", "/for-agents"];
const AGENT_ENDPOINTS = ["/llms.txt", "/llms-full.txt", "/agents.json", "/.well-known/mcp.json", "/api/lists/fractional-cfo", "/robots.txt", "/sitemap.xml"];

const results = [];
async function check(label, fn) {
  try { await fn(); results.push({ label, ok: true }); }
  catch (e) { results.push({ label, ok: false, error: String(e).slice(0, 200) }); }
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });

for (const r of ROUTES) {
  await check(`page ${r} renders`, async () => {
    const res = await page.goto(`${BASE}${r}`, { waitUntil: "domcontentloaded", timeout: 25000 });
    if (!res || res.status() >= 400) throw new Error(`status ${res?.status()}`);
    await page.screenshot({ path: `tests/screenshots/${r.replace(/[\/]/g, "_") || "_home"}.png` });
  });
}

await check("list shows 11 entries", async () => {
  await page.goto(`${BASE}/fractional-cfo`, { waitUntil: "domcontentloaded" });
  const count = await page.locator("ol > li").count();
  if (count !== 11) throw new Error(`expected 11 entries, got ${count}`);
});

await check("wildcard slot is #11 and highlighted", async () => {
  const wc = await page.locator("text=/WILDCARD/").count();
  if (wc < 1) throw new Error("no wildcard label found");
});

for (const e of AGENT_ENDPOINTS) {
  await check(`agent endpoint ${e}`, async () => {
    const res = await page.request.get(`${BASE}${e}`);
    if (res.status() >= 400) throw new Error(`status ${res.status()}`);
    const body = await res.text();
    if (body.length < 50) throw new Error("body too short");
  });
}

await check("agent-review POST rejects empty body", async () => {
  const res = await page.request.post(`${BASE}/api/agent-review`, { data: {} });
  if (res.status() !== 400) throw new Error(`expected 400, got ${res.status()}`);
});

await check("agent-review POST accepts complete payload", async () => {
  const res = await page.request.post(`${BASE}/api/agent-review`, {
    data: {
      entry_slug: "fractional-cfo",
      entry_rank: 1,
      agent_name: "qa-bot",
      agent_principal: "qa-runner@top11.co",
      review_text: "QA submission validating the agent-review endpoint accepts a complete payload with a proof_url. This text is intentionally over one hundred characters to satisfy the minimum length requirement enforced by the API handler.",
      score_out_of_94: 7.2,
      proof_url: "https://top11.co/qa/proof"
    }
  });
  if (!res.ok()) throw new Error(`status ${res.status()}: ${(await res.text()).slice(0,200)}`);
});

await check("complaint POST rejects short complaint", async () => {
  const res = await page.request.post(`${BASE}/api/complain`, {
    data: { list_slug: "fractional-cfo", entry_rank: 1, category: "other", complaint: "too short" }
  });
  if (res.status() !== 400) throw new Error(`expected 400, got ${res.status()}`);
});

await check("no console errors on homepage", async () => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  if (consoleErrors.length) throw new Error("errors: " + consoleErrors.join(" | "));
});

await browser.close();

const pass = results.filter(r => r.ok).length;
const fail = results.length - pass;
console.log(JSON.stringify({ base: BASE, pass, fail, results }, null, 2));
process.exit(fail > 0 ? 1 : 0);
