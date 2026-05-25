#!/usr/bin/env node
// Submit Wondermous URLs to IndexNow (Bing, Yandex, Naver, etc.)
const KEY = "7e8b0e236f4a4f2fb9ec6dccfd709a92";
const HOST = process.env.TOP11_HOST || "top11-nine.vercel.app";
const ORIGIN = `https://${HOST}`;

const urls = [
  `${ORIGIN}/`,
  `${ORIGIN}/fractional-cfo`,
  `${ORIGIN}/methodology`,
  `${ORIGIN}/for-agents`,
  `${ORIGIN}/llms.txt`,
  `${ORIGIN}/agents.json`,
];

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: `${ORIGIN}/${KEY}.txt`,
  urlList: urls,
};

const res = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

const body = await res.text().catch(() => "");
console.log(JSON.stringify({ status: res.status, ok: res.ok, body, urls }, null, 2));
process.exit(res.ok ? 0 : 1);
