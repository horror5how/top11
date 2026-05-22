#!/usr/bin/env node
// Orchestrator: fetch 4 sources for every entry in a list, synthesise via Claude, commit JSON.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchRedditFor } from "./fetch-reddit.mjs";
import { fetchTrustpilotFor } from "./fetch-trustpilot.mjs";
import { fetchGoogleFor } from "./fetch-google.mjs";
import { fetchFacebookFor } from "./fetch-facebook.mjs";
import { synthesizeForEntry } from "./synthesize.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");
const listSlug = process.argv[2] || "fractional-cfo";
const force = process.argv.includes("--force");

const sourcesPath = path.join(root, "data", "sources", `${listSlug}.json`);
const outPath = path.join(root, "data", "pulse", `${listSlug}.json`);
fs.mkdirSync(path.dirname(outPath), { recursive: true });

if (!fs.existsSync(sourcesPath)) {
  console.error(`No sources map at ${sourcesPath}`);
  process.exit(1);
}

const sources = JSON.parse(fs.readFileSync(sourcesPath, "utf8"));

const out = {
  list_slug: listSlug,
  generated_at: new Date().toISOString(),
  pulse_version: "v1",
  entries: {},
};

const onlySource = process.env.PULSE_ONLY || ""; // e.g. "reddit,trustpilot"
const enabled = (s) => !onlySource || onlySource.split(",").map((x) => x.trim()).includes(s);

for (const entry of sources.entries) {
  console.error(`[pulse] ${entry.rank}. ${entry.name}`);
  const bundle = {};

  if (enabled("reddit")) {
    const preferPublic = process.env.PULSE_REDDIT_PUBLIC === "1";
    bundle.reddit = await fetchRedditFor(entry, { force, preferPublic }).catch((e) => ({ source: "reddit", count: 0, error: String(e) }));
    console.error(`  reddit: ${bundle.reddit.count} via ${bundle.reddit.via || "?"}${bundle.reddit.error ? " (err: " + bundle.reddit.error + ")" : ""}`);
  }
  if (enabled("trustpilot")) {
    bundle.trustpilot = await fetchTrustpilotFor(entry, { force }).catch((e) => ({ source: "trustpilot", count: 0, error: String(e) }));
    console.error(`  trustpilot: ${bundle.trustpilot.count}${bundle.trustpilot.error ? " (err: " + bundle.trustpilot.error + ")" : ""}`);
  }
  if (enabled("google")) {
    bundle.google = await fetchGoogleFor(entry, { force }).catch((e) => ({ source: "google", count: 0, error: String(e) }));
    console.error(`  google: ${bundle.google.count}${bundle.google.error ? " (err: " + bundle.google.error + ")" : ""}`);
  }
  if (enabled("facebook")) {
    bundle.facebook = await fetchFacebookFor(entry, { force }).catch((e) => ({ source: "facebook", count: 0, error: String(e) }));
    console.error(`  facebook: ${bundle.facebook.count}${bundle.facebook.error ? " (err: " + bundle.facebook.error + ")" : ""}`);
  }

  const syn = await synthesizeForEntry(entry, bundle).catch((e) => ({ entry: entry.name, error: String(e) }));
  out.entries[String(entry.rank)] = {
    rank: entry.rank,
    name: entry.name,
    ...syn,
  };
  console.error(`  → synth: ${syn.error || `score ${syn.sentiment_score}, sample ${syn.sample_size}`}`);
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.error(`\nWrote ${outPath}`);
console.error(`Entries with data: ${Object.values(out.entries).filter((e) => e.sample_size).length}/${sources.entries.length}`);
