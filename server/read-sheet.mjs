// Reading service for "Help me play" in the App Store and web builds.
//
// The app sends photos of sheet music here; this asks Claude to read them and
// returns the notation as JSON. Your Anthropic API key stays on the server.
//
//   ANTHROPIC_API_KEY=sk-... node server/read-sheet.mjs        (listens on PORT, default 8787)
//
// Then point the app at it before app.js loads:
//   <script>window.READ_PLAY_CONFIG = { sheetEndpoint: 'https://your-server/read-sheet' }</script>
//
// Set REVENUECAT_SECRET_KEY so only Premium subscribers can use it, and
// SHEET_PAGE_LIMIT for the pages each subscriber gets a month (default 20).

import http from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const PROMPT = readFileSync(new URL('../src/sheet-prompt.txt', import.meta.url), 'utf8').trim();
// the same prompt builders the app uses (src/sheet-prompts.js)
const SheetPrompts = new Function('SHEET_PROMPT', 'module', readFileSync(new URL('../src/sheet-prompts.js', import.meta.url), 'utf8') + '\nreturn SheetPrompts;')(PROMPT, undefined);

// Pages are read with Claude's strongest model, and any bars that don't add up are read again.
// Rough cost: 6p to 8p a page, around 10p when bars need a second look.
// SHEET_MODEL=claude-sonnet-5-5 costs about half as much, but misreads more.
const MODEL = process.env.SHEET_MODEL || 'claude-opus-5-5';
// Pages each person may read in a calendar month. Pages already read (the same file again) don't count.
const PAGE_LIMIT = Number(process.env.SHEET_PAGE_LIMIT) || 20;
const USAGE_FILE = process.env.SHEET_USAGE_FILE || new URL('./sheet-usage.json', import.meta.url).pathname;
// Readings are kept, keyed by the exact images and request, so the same page (the same PDF, say) is never paid for twice.
const CACHE_DIR = process.env.SHEET_CACHE_DIR || new URL('./sheet-cache/', import.meta.url).pathname;
mkdirSync(CACHE_DIR, { recursive: true });
const MAX_IMAGES = 8, MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// Only music comes back, so the service can't be used as a general chatbot on your API key.
function tidy(data, kind) {
  if (!data || typeof data !== 'object') throw new Error('No JSON in the reply.');
  if (data.error) return { error: String(data.error).slice(0, 200) };
  const bars = (Array.isArray(data.bars) ? data.bars : []).slice(0, 300).filter(b => b && typeof b === 'object').map(b => {
    const o = { n: Number.isFinite(+b.n) ? Math.round(+b.n) : null };
    ['rh', 'lh', 'music'].forEach(k => { if (b[k] != null) o[k] = SheetPrompts.notes(b[k]); });
    return o;
  });
  if (kind === 'fix') return { bars };
  const str = (v, n) => v == null ? null : String(v).slice(0, n);
  return { title: str(data.title, 80), composer: str(data.composer, 60), key: str(data.key, 4), time: str(data.time, 5), tempo: Number.isFinite(+data.tempo) ? +data.tempo : null, staves: ['grand', 'treble', 'bass'].includes(data.staves) ? data.staves : 'grand', bars, uncertain: str(data.uncertain, 300) || '' };
}

// Returns { data, cached }.
export async function readSheet(images, { fresh = false, task = { kind: 'read' } } = {}) {
  if (!Array.isArray(images) || !images.length || images.length > MAX_IMAGES) throw new Error(`Send between 1 and ${MAX_IMAGES} images.`);
  for (const im of images) {
    if (!TYPES.has(im.mediaType) || typeof im.data !== 'string' || im.data.length * 0.75 > MAX_IMAGE_BYTES) throw new Error('Unsupported or oversized image.');
  }
  const kind = task && task.kind === 'fix' ? 'fix' : 'read';
  const text = kind === 'fix' ? SheetPrompts.fix(task) : SheetPrompts.read(task || {});
  const model = MODEL;
  const hash = createHash('sha256'); images.forEach(im => hash.update(im.data)); hash.update(text); hash.update(model); const file = CACHE_DIR + hash.digest('hex') + '.json';
  if (!fresh && existsSync(file)) return { data: JSON.parse(readFileSync(file, 'utf8')), cached: true };
  const content = [
    ...images.map(im => ({ type: 'image', source: { type: 'base64', media_type: im.mediaType, data: im.data } })),
    { type: 'text', text }
  ];
  const r = await fetch((process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com') + '/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 12000, messages: [{ role: 'user', content }] })
  });
  if (!r.ok) throw new Error('Claude API error ' + r.status);
  const msg = await r.json();
  const reply = (msg.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  const a = reply.indexOf('{'), b = reply.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('No JSON in the reply.');
  const data = tidy(JSON.parse(reply.slice(a, b + 1)), kind);
  if (!data.error) writeFileSync(file, JSON.stringify(data));
  return { data, cached: false };
}

/* ---- Premium: only subscribers can have pages read ----
   The app sends its RevenueCat user ID. With REVENUECAT_SECRET_KEY set, every request is checked against
   RevenueCat, so only people with an active subscription get pages read. The IDs are long and random,
   so they can't be guessed. Without the key (while you're testing) there's no check. */
const RC_SECRET = process.env.REVENUECAT_SECRET_KEY || '';
const RC_ENTITLEMENT = process.env.REVENUECAT_ENTITLEMENT || 'premium';
const premiumCache = new Map();   // user -> { ok, at }
async function isPremium(user) {
  if (!RC_SECRET) return true;
  if (!user || user === 'anon') return false;
  const hit = premiumCache.get(user);
  if (hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.ok;
  let ok = false;
  try {
    const r = await fetch((process.env.REVENUECAT_API_URL || 'https://api.revenuecat.com') + '/v1/subscribers/' + encodeURIComponent(user), { headers: { Authorization: 'Bearer ' + RC_SECRET } });
    if (r.ok) {
      const ent = ((await r.json()).subscriber || {}).entitlements || {};
      const e = ent[RC_ENTITLEMENT];
      ok = !!e && (!e.expires_date || new Date(e.expires_date) > new Date());
    }
  } catch (e) { if (hit) return hit.ok; }
  premiumCache.set(user, { ok, at: Date.now() });
  return ok;
}

/* ---- monthly allowance, counted per person (their RevenueCat ID) ---- */
const month = () => new Date().toISOString().slice(0, 7);
function loadUsage() { try { const u = JSON.parse(readFileSync(USAGE_FILE, 'utf8')); return u.month === month() ? u : { month: month(), users: {} }; } catch (e) { return { month: month(), users: {} }; } }
function usedBy(user) { return loadUsage().users[user] || 0; }
function addUse(user) { const u = loadUsage(); u.users[user] = (u.users[user] || 0) + 1; writeFileSync(USAGE_FILE, JSON.stringify(u)); return u.users[user]; }

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' };
http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  if (req.method !== 'POST') { res.writeHead(405, CORS); return res.end(); }
  let body = '';
  for await (const chunk of req) { body += chunk; if (body.length > 60 * 1024 * 1024) { res.writeHead(413, CORS); return res.end(); } }
  try {
    const { images, fresh, task, user } = JSON.parse(body);
    const who = String(user || 'anon').slice(0, 80), t = task && typeof task === 'object' ? task : { kind: 'read' };
    const counts = t.kind !== 'fix';   // a second look at a few bars is part of reading the page
    if (!(await isPremium(who))) {
      res.writeHead(402, { ...CORS, 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: 'premium' }));
    }
    if (counts && usedBy(who) >= PAGE_LIMIT) {
      res.writeHead(402, { ...CORS, 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: 'limit', allowance: { used: usedBy(who), limit: PAGE_LIMIT } }));
    }
    const { data, cached } = await readSheet(images, { fresh: !!fresh, task: t });
    const used = counts && !cached && !data.error ? addUse(who) : usedBy(who);
    res.writeHead(200, { ...CORS, 'content-type': 'application/json' }); res.end(JSON.stringify({ ...data, allowance: { used, limit: PAGE_LIMIT } }));
  } catch (e) {
    res.writeHead(400, { ...CORS, 'content-type': 'application/json' }); res.end(JSON.stringify({ error: String(e.message || e) }));
  }
}).listen(process.env.PORT || 8787);
