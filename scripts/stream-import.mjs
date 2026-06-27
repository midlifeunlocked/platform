#!/usr/bin/env node
/**
 * stream-import.mjs — port the Kartra-hosted lesson videos into Cloudflare Stream.
 *
 * Pipeline (no local files, exact mapping by slug):
 *   slug → Kartra video id (src/data/video-sources.json)
 *        → open Kartra player → direct CloudFront MP4 URL
 *        → Cloudflare Stream "copy from URL" (server-side ingest)
 *        → Stream UID, written back to stream-ids.json (slug → uid)
 *
 * Idempotent: skips slugs already in stream-ids.json. Re-runnable.
 *
 * Requires env:
 *   CF_ACCOUNT_ID      Cloudflare account id
 *   CF_STREAM_TOKEN    API token with "Stream: Edit"
 *
 * Usage:  CF_ACCOUNT_ID=... CF_STREAM_TOKEN=... node scripts/stream-import.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ACCOUNT = process.env.CF_ACCOUNT_ID;
const TOKEN = process.env.CF_STREAM_TOKEN;
if (!ACCOUNT || !TOKEN) {
  console.error('Set CF_ACCOUNT_ID and CF_STREAM_TOKEN (token needs "Stream: Edit").');
  process.exit(1);
}

const SRC = JSON.parse(readFileSync(new URL('../src/data/video-sources.json', import.meta.url)));
const OUT_PATH = new URL('./stream-ids.json', import.meta.url);
const out = existsSync(OUT_PATH) ? JSON.parse(readFileSync(OUT_PATH)) : {};

const REFERER = 'https://midlifeunlocked.webflow.io/';

/** Resolve a Kartra video id to its open CloudFront MP4 URL. */
async function resolveMp4(kartraId) {
  const r = await fetch(`https://app.kartra.com/video_front/index/${kartraId}/0/`, {
    headers: { Referer: REFERER, 'User-Agent': 'Mozilla/5.0' },
  });
  if (!r.ok) return null; // 404 = video missing on Kartra
  const html = await r.text();
  const m = [...html.matchAll(/https:\/\/[a-z0-9]+\.cloudfront\.net\/lcnmedia\/[0-9_]+[^"'?]+\.mp4/g)]
    .map((x) => x[0])
    .filter((u) => !u.includes('thumb'));
  return m[0] ?? null;
}

/** Tell Stream to copy a video from a URL. Returns the new UID. */
async function streamCopy(url, name, requireSignedURLs) {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/stream/copy`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, meta: { name }, requireSignedURLs }),
  });
  const j = await r.json();
  if (!j.success) throw new Error(JSON.stringify(j.errors));
  return j.result.uid;
}

// Import public for now so everything is testable. Phase 5 flips premium
// videos to requireSignedURLs:true and adds signed-token minting (spec §7.2);
// that's a per-video PATCH, no re-import needed.
const REQUIRE_SIGNED = false;

const broken = new Set(SRC._broken_on_kartra ?? []);
const entries = Object.entries(SRC.videos);
let done = 0, skipped = 0, failed = [];

for (const [slug, kartraId] of entries) {
  if (out[slug]) { skipped++; continue; }
  if (broken.has(slug)) { failed.push([slug, 'flagged broken (404 on Kartra)']); continue; }
  try {
    const mp4 = await resolveMp4(kartraId);
    if (!mp4) { failed.push([slug, 'no MP4 (Kartra 404)']); continue; }
    const uid = await streamCopy(mp4, slug, REQUIRE_SIGNED);
    out[slug] = uid;
    writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
    done++;
    console.log(`✓ ${slug} → ${uid}`);
  } catch (e) {
    failed.push([slug, String(e.message || e)]);
    console.error(`✗ ${slug}: ${e.message || e}`);
  }
}

console.log(`\nimported ${done}, skipped ${skipped} (already done), failed ${failed.length}`);
if (failed.length) failed.forEach(([s, why]) => console.log(`  - ${s}: ${why}`));
console.log(`\nStream UIDs written to scripts/stream-ids.json`);
console.log('Next: Stream finishes encoding async — poll GET /stream/{uid} for readyToStream, then add streamId to the catalogue.');
