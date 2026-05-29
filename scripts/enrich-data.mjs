#!/usr/bin/env node
// One-time back-fill of the new structured fields onto every entry in every list.
// Parses pricing_band, scans verdict/best_for/praise text for keyword signals,
// and writes sensible defaults. Idempotent — safe to re-run.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");

const PRICE_RE = /\$?\s*([\d,]+(?:\.\d+)?)\s*(k|K)?(?:\s*\/\s*(?:mo|month|hour|hr|seat|user|location|provider))?/g;
const COMPLIANCE_KEYWORDS = {
  SOC2: /\bSOC[\s-]?2\b/i, HIPAA: /\bHIPAA\b/i, GDPR: /\bGDPR\b/i,
  ISO27001: /\bISO\s*27001\b/i, FedRAMP: /\bFedRAMP\b/i, PCI: /\bPCI[\s-]?DSS\b/i,
};
const INTEGRATION_KEYWORDS = [
  "QuickBooks","Xero","NetSuite","Sage","Salesforce","HubSpot","Stripe","Slack","Notion",
  "Microsoft Dynamics","Open Dental","Dentrix","Eaglesoft","Carbon Black","Zapier","API",
];
const REGION_KEYWORDS = {
  US: /\b(US|U\.S\.|United States|US-focused|American)\b/i,
  UK: /\b(UK|U\.K\.|United Kingdom|British|London)\b/i,
  EU: /\b(EU|European|Europe)\b/i,
  Canada: /\b(Canada|Canadian)\b/i,
  Global: /\b(global|worldwide|international)\b/i,
};

function parsePriceBand(band) {
  if (!band) return { price_min: null, price_max: null, free_tier: false };
  const free = /\bfree\b/i.test(band);
  const matches = [...band.matchAll(PRICE_RE)];
  const nums = matches.map((m) => {
    const raw = parseFloat(m[1].replace(/,/g, ""));
    return m[2] ? raw * 1000 : raw;
  }).filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return { price_min: null, price_max: null, free_tier: free };
  nums.sort((a, b) => a - b);
  return {
    price_min: nums[0],
    price_max: nums[nums.length - 1],
    free_tier: free || nums[0] === 0,
  };
}

function scanText(text, dict) {
  const found = [];
  for (const [key, re] of Object.entries(dict)) {
    if (re.test(text)) found.push(key);
  }
  return found;
}

function scanIntegrations(text) {
  return INTEGRATION_KEYWORDS.filter((k) => new RegExp(`\\b${k}\\b`, "i").test(text));
}

function inferOnboardingDays(text) {
  const fast = /\b(same[\s-]?day|instant|24[\s-]?hour|next[\s-]?day)\b/i.test(text);
  if (fast) return 1;
  const week = /\b(within\s+a\s+week|7[\s-]?day|one[\s-]?week)\b/i.test(text);
  if (week) return 7;
  const month = /\b(month|30[\s-]?day|onboarding\s+period)\b/i.test(text);
  if (month) return 30;
  return null;
}

function inferTeamSize(text, teamBand) {
  // Match heuristics from best_for and team_size_band
  const seedStage = /\b(pre[\s-]?seed|seed|early[\s-]?stage|small)\b/i.test(text);
  const enterprise = /\b(enterprise|large|Series\s+[CDEF]|400\+|500\+)\b/i.test(text);
  const small = seedStage ? 1 : null;
  const large = enterprise ? 500 : 100;
  return { min_team_size: small, max_team_size: enterprise ? null : large };
}

function enrich(entry) {
  const text = [entry.best_for, entry.best_for_short, entry.verdict, entry.praise, entry.criticism, entry.facts].filter(Boolean).join(" \n ");
  const { price_min, price_max, free_tier } = parsePriceBand(entry.pricing_band);
  const compliance = scanText(text, COMPLIANCE_KEYWORDS);
  const regions = scanText(text + " " + (entry.hq || ""), REGION_KEYWORDS);
  const integrations = scanIntegrations(text + " " + (entry.facts || ""));
  const teamSize = inferTeamSize(text, entry.team_size_band);
  const onboarding = inferOnboardingDays(text);

  return {
    ...entry,
    price_min: entry.price_min ?? price_min,
    price_max: entry.price_max ?? price_max,
    currency: entry.currency ?? "USD",
    free_tier: entry.free_tier ?? free_tier,
    setup_fee: entry.setup_fee ?? null,
    integrations: entry.integrations ?? integrations,
    compliance: entry.compliance ?? compliance,
    regions: entry.regions ?? (regions.length ? regions : ["US"]),
    onboarding_days: entry.onboarding_days ?? onboarding,
    min_team_size: entry.min_team_size ?? teamSize.min_team_size,
    max_team_size: entry.max_team_size ?? teamSize.max_team_size,
  };
}

let changed = 0;
for (const file of fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"))) {
  const p = path.join(dataDir, file);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  data.entries = data.entries.map(enrich);
  // Add a list-level glossary stub for /what-is/ pages
  if (!data.glossary) {
    const cap = data.answer_capsule || data.subtitle || "";
    data.glossary = {
      term: data.vertical || data.title,
      definition: cap,
      synonyms: [],
      faq: data.faqs?.slice(0, 3) || [],
    };
  }
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("enriched", file, "·", data.entries.length, "entries");
  changed++;
}
console.log(`\n${changed} list files updated`);
