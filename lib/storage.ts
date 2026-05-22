// Vercel Blob-backed JSON storage for votes and pending submissions.
// V1: simple read-modify-write, single counter blob per entry.
// Acceptable concurrency at launch volume. Upgrade to KV when needed.

import { put, head } from "@vercel/blob";

const BLOB_PREFIX = "top11/state";

type VoteState = { up: number; down: number; updated: string };

export async function getVotes(entrySlug: string): Promise<VoteState> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { up: 0, down: 0, updated: new Date().toISOString() };
  }
  const path = `${BLOB_PREFIX}/votes/${entrySlug}.json`;
  try {
    const meta = await head(path);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`fetch ${res.status}`);
    return (await res.json()) as VoteState;
  } catch {
    return { up: 0, down: 0, updated: new Date().toISOString() };
  }
}

export async function castVote(entrySlug: string, dir: "up" | "down"): Promise<VoteState> {
  const current = await getVotes(entrySlug);
  current[dir] += 1;
  current.updated = new Date().toISOString();
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(`${BLOB_PREFIX}/votes/${entrySlug}.json`, JSON.stringify(current), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      allowOverwrite: true,
    });
  }
  return current;
}

type Submission = {
  id: string;
  kind: "complaint" | "agent-review";
  entry_slug: string;
  payload: Record<string, unknown>;
  received: string;
};

export async function recordSubmission(s: Submission) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const path = `${BLOB_PREFIX}/inbox/${s.kind}/${s.id}.json`;
  await put(path, JSON.stringify(s), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}
