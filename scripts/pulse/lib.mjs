// Shared helpers for the review-pulse pipeline.
// Apify CLI is the only allowed interface (per global rule).
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "..", "..");
export const RAW_DIR = path.join(REPO_ROOT, ".pulse-cache");
fs.mkdirSync(RAW_DIR, { recursive: true });

export function apifyCall(actor, input, opts = {}) {
  const tmp = path.join(os.tmpdir(), `pulse-input-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`);
  fs.writeFileSync(tmp, JSON.stringify(input));
  try {
    const cmd = `apify call ${actor} --input-file=${tmp} --output-dataset --silent`;
    const out = execSync(cmd, { encoding: "utf8", maxBuffer: 1024 * 1024 * 50, timeout: opts.timeout || 180000 });
    fs.unlinkSync(tmp);
    // Output is JSON-lines from the dataset
    const items = out.split("\n").filter(Boolean).map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
    return { ok: true, items };
  } catch (err) {
    fs.existsSync(tmp) && fs.unlinkSync(tmp);
    return { ok: false, error: String(err.message || err).slice(0, 400), items: [] };
  }
}

export function cacheKey(parts) {
  return parts.join("__").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
}

export function readCache(key, ttlHours = 24) {
  const f = path.join(RAW_DIR, `${key}.json`);
  if (!fs.existsSync(f)) return null;
  const age = (Date.now() - fs.statSync(f).mtimeMs) / 3600000;
  if (age > ttlHours) return null;
  try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; }
}

export function writeCache(key, data) {
  fs.writeFileSync(path.join(RAW_DIR, `${key}.json`), JSON.stringify(data, null, 2));
}

export function truncate(s, n) {
  if (!s) return "";
  s = String(s).replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
