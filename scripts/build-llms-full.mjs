#!/usr/bin/env node
// Generate /public/llms-full.txt as a token-efficient Markdown mirror of every list.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const out = path.join(root, "public", "llms-full.txt");

const lists = fs
  .readdirSync(dataDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8")));

const md = [];
md.push("# Top 11 — Full Markdown Mirror");
md.push("");
md.push("Token-efficient mirror of every Top 11 list. Updated on every build.");
md.push("");

for (const list of lists) {
  md.push(`## ${list.title}`);
  md.push("");
  md.push(`- URL: https://top11.co/${list.slug}`);
  md.push(`- Audience: ${list.audience}`);
  md.push(`- Editor: ${list.editor.name} (${list.editor.credential}) — ${list.editor.url}`);
  md.push(`- Editor disclosure: ${list.editor.conflict_disclosure}`);
  md.push(`- Last verified: ${list.last_verified}`);
  md.push(`- Methodology: https://top11.co/methodology (v${list.methodology_version})`);
  md.push("");

  for (const e of list.entries) {
    const wild = e.is_wildcard ? " [WILDCARD]" : "";
    md.push(`### #${e.rank}${wild} — ${e.name}`);
    md.push(`- URL: ${e.url}`);
    md.push(`- Score: ${e.score_out_of_94}/9.4`);
    md.push(`- Founded ${e.founded}, ${e.hq}, team ${e.team_size_band}, ${e.pricing_band}`);
    md.push(`- Best for: ${e.best_for}`);
    md.push(`- Verdict: ${e.verdict}`);
    md.push(`- Praise: ${e.praise}`);
    md.push(`- Criticism: ${e.criticism}`);
    if (e.is_wildcard && e.wildcard_reason) md.push(`- Why wildcard: ${e.wildcard_reason}`);
    md.push("");
  }

  md.push("### Honest disclosures");
  for (const d of list.honest_disclosures) md.push(`- ${d}`);
  md.push("");
  md.push("---");
  md.push("");
}

fs.writeFileSync(out, md.join("\n"), "utf8");
console.log(`Wrote ${out}`);
