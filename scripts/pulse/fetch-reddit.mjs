// Reddit ingestion.
// Primary: Apify CLI trudax/reddit-scraper-lite (richer body text, comment threads).
// Fallback: Reddit's public JSON search endpoint (free, no auth, rate-limited).
// Order chosen so we keep working when Apify credit is exhausted.
import { apifyCall, cacheKey, readCache, writeCache, truncate } from "./lib.mjs";

const ACTOR = "trudax/reddit-scraper-lite";
const UA = "top11.co/1.0 (independent review aggregator; editor: hayat@beyondelevation.com)";

async function fetchPublicRedditSearch(query, time = "year", limit = 25, subreddit = null) {
  const base = subreddit
    ? `https://www.reddit.com/r/${subreddit}/search.json?restrict_sr=on&`
    : `https://www.reddit.com/search.json?`;
  const url = `${base}q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance&t=${time}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return { ok: false, error: `reddit ${res.status}` };
  const data = await res.json().catch(() => null);
  if (!data?.data?.children) return { ok: false, error: "no children" };
  const items = data.data.children
    .map((c) => c.data)
    .filter((d) => d && (d.title || d.selftext))
    .map((d) => ({
      title: d.title,
      excerpt: d.selftext,
      subreddit: d.subreddit,
      url: `https://www.reddit.com${d.permalink}`,
      ups: d.ups || d.score || 0,
      num_comments: d.num_comments || 0,
      created: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : null,
    }));
  return { ok: true, items };
}

function tryApify(query) {
  const input = {
    searches: [query],
    type: "posts",
    sort: "relevance",
    time: "year",
    maxItems: 25,
    maxPostCount: 25,
    maxCommunitiesCount: 0,
    maxUserCount: 0,
    maxComments: 3,
    proxy: { useApifyProxy: true },
  };
  const res = apifyCall(ACTOR, input);
  if (!res.ok) return res;
  // Reshape to common item shape
  const items = res.items
    .filter((i) => i && i.dataType === "post")
    .map((i) => ({
      title: i.title || "",
      excerpt: i.body || i.text || "",
      subreddit: i.parsedCommunityName || i.communityName || "",
      url: i.url || i.permalink,
      ups: Number(i.upVotes || i.score || 0),
      num_comments: Number(i.numberOfComments || 0),
      created: i.createdAt || i.dataAddedDate || null,
    }));
  return { ok: true, items };
}

export async function fetchRedditFor(entry, opts = {}) {
  const key = cacheKey(["reddit", entry.domain]);
  const cached = readCache(key, opts.ttlHours ?? 24);
  if (cached && !opts.force) return cached;

  // Build query plan combining broad and targeted searches:
  // 1) Broad site-wide (relevance match) for the firm name and variants — wide net
  // 2) Per-subreddit targeted with exact-phrase quote — high precision
  const quote = (s) => `"${s}"`;
  const broadQueries = (entry.reddit_queries || [entry.name])
    .filter((q) => q.length > 3)
    .slice(0, 2);
  if (entry.domain) broadQueries.push(quote(entry.domain));

  const subredditTargets = (entry.subreddits || []).slice(0, 5);

  const plan = [];
  for (const q of broadQueries) plan.push({ q, sub: null });
  for (const sub of subredditTargets) plan.push({ q: entry.name, sub });

  const allItems = [];
  let used = "none";
  let lastErr = null;

  for (const { q, sub } of plan) {
    let res = opts.preferPublic ? null : tryApify(q);
    if (res?.ok && res.items?.length) {
      used = "apify";
      allItems.push(...res.items);
      continue;
    }
    if (res && !res.ok) lastErr = res.error;
    const pub = await fetchPublicRedditSearch(q, "year", 25, sub);
    if (pub.ok && pub.items.length) {
      used = used === "apify" ? "mixed" : "public-json";
      allItems.push(...pub.items);
    } else if (pub && !pub.ok) {
      lastErr = pub.error;
    }
    await new Promise((r) => setTimeout(r, 1100));
  }

  // Noise filters — drop hiring posts and recruiter spam.
  // These dominate Reddit for B2B firms and contain no review signal.
  const NOISE_SUBREDDITS = new Set([
    "jobboardsearch", "RemoteJobseekers", "RemoteJobs", "ForHire", "forhire",
    "techjobs", "RemoteWorkers", "RemoteCanada", "RemoteWork",
    "web3careers", "cryptojobs", "jobsboard", "JobsOnline",
    "jobopenings", "JobOpening", "Hireathon",
  ]);
  const HIRING_RX = /\[hiring\]|is hiring|now hiring|we[' ]re hiring|join (us|our team)|apply now|job posting|recruiting|opening for|hiring a |hiring an /i;

  const seen = new Set();
  const threads = [];
  let dropped = 0;
  for (const it of allItems) {
    const url = it.url;
    if (!url || seen.has(url)) { continue; }
    if (NOISE_SUBREDDITS.has(it.subreddit)) { dropped++; continue; }
    const haystack = `${it.title || ""} ${it.excerpt || ""}`;
    if (HIRING_RX.test(haystack) && (it.ups || 0) < 3) { dropped++; continue; }
    seen.add(url);
    threads.push({
      title: truncate(it.title, 200),
      subreddit: it.subreddit || "",
      url,
      ups: it.ups,
      created: it.created,
      excerpt: truncate(it.excerpt, 600),
      num_comments: it.num_comments,
    });
  }
  if (dropped) console.warn(`  [reddit] dropped ${dropped} hiring/noise items`);

  threads.sort((a, b) => b.ups - a.ups);
  const result = {
    source: "reddit",
    entry: entry.name,
    via: used,
    count: threads.length,
    threads: threads.slice(0, 15),
    ...(threads.length ? {} : { error: lastErr || "no results" }),
  };
  writeCache(key, result);
  return result;
}
