/* ============================================================
   Help me play: read a photo of sheet music into the app's notation.
   The reading itself is done by Claude, either through the Claude
   app (when this page runs inside it) or through your own server
   (set window.READ_PLAY_CONFIG = { sheetEndpoint: 'https://...' }),
   see server/read-sheet.mjs. Everything else happens here.
   ============================================================ */
/* Pages read each month. The app's own reading service is the real gatekeeper (it counts per person);
   this keeps the count on the device so people can see what they have left. */
const PageAllowance = (() => {
  const KEY = 'rmp-pages:v1';
  const month = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
  const configured = () => { const c = window.READ_PLAY_CONFIG; return c && Number(c.monthlyPages) > 0 ? Number(c.monthlyPages) : 20; };
  const limit = () => load().limit || configured();
  const load = () => { try { const d = JSON.parse(localStorage.getItem(KEY) || '{}'); return d.month === month() ? d : { month: month(), used: 0 }; } catch (e) { return { month: month(), used: 0 }; } };
  const save = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
  const used = () => load().used || 0;
  const left = () => Math.max(0, limit() - used());
  function add(n) { const d = load(); d.used = (d.used || 0) + n; save(d); }
  // the reading service's own count wins
  function set(u, lim) { const d = load(); d.used = Math.max(0, Number(u) || 0); if (Number(lim) > 0) d.limit = Number(lim); save(d); }
  // the first of next month, for "more pages from 1 November"
  function renews() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 1).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }); }
  return { limit, used, left, add, set, renews };
})();
function installId() {
  try { let id = localStorage.getItem('rmp-install-id'); if (!id) { id = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)); localStorage.setItem('rmp-install-id', id); } return id; }
  catch (e) { return 'anon'; }
}

const SheetReader = (() => {
  let sampleP = null;
  function sampler() {
    if (!sampleP) sampleP = (window.claude && typeof window.claude.use === 'function') ? window.claude.use('sample').catch(() => null) : Promise.resolve(null);
    return sampleP;
  }
  const endpoint = () => (window.READ_PLAY_CONFIG && window.READ_PLAY_CONFIG.sheetEndpoint) || null;
  const SERVER_IMAGES = 8, MAX_STRIPS = 6, MAX_PAGES = 6;
  async function available() {
    if (endpoint()) return { via: 'server', maxPages: MAX_PAGES, maxImages: SERVER_IMAGES };
    const s = await sampler();
    if (!s) return null;
    try { const l = await s.limits(); if (l && l.images) return { via: 'claude', maxPages: MAX_PAGES, maxImages: l.images.maxCount || 1 }; } catch (e) {}
    return null;
  }

  /* pages already read on this device are remembered, so reading the same page again costs nothing */
  const CACHE_KEY = 'rmp-sheet-cache:v' + SheetPrompts.VERSION, CACHE_MAX = 40;
  try { localStorage.removeItem('rmp-sheet-cache:v1'); } catch (e) {}
  function cacheGet(h) { try { const c = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); return c[h] ? c[h].data : null; } catch (e) { return null; } }
  function cachePut(h, data) {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); c[h] = { data, at: Date.now() };
      const keys = Object.keys(c).sort((a, b) => c[b].at - c[a].at); keys.slice(CACHE_MAX).forEach(k => delete c[k]);
      localStorage.setItem(CACHE_KEY, JSON.stringify(c));
    } catch (e) {}
  }
  async function hashOf(blob, extra) {
    try {
      const h = await crypto.subtle.digest('SHA-256', await new Blob([await blob.arrayBuffer(), extra || '']).arrayBuffer());
      return Array.from(new Uint8Array(h)).map(x => x.toString(16).padStart(2, '0')).join('');
    } catch (e) { return null; }
  }
  function blobToBase64(b) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.onerror = rej; fr.readAsDataURL(b); }); }

  // One request to Claude. task.kind is 'read' or 'fix'; the prompt is built from it (on the server, when there is one).
  async function call(images, task, fresh, signal, onText) {
    if (endpoint()) {
      const body = { images: await Promise.all(images.map(async b => ({ mediaType: b.type || 'image/jpeg', data: await blobToBase64(b) }))), fresh: !!fresh, task, user: (typeof Premium !== 'undefined' && Premium.userId) || installId() };
      const r = await fetch(endpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
      const j = await r.json().catch(() => null);
      if (j && j.allowance) PageAllowance.set(j.allowance.used, j.allowance.limit);
      if (r.status === 402) throw { code: j && j.error === 'premium' ? 'premium' : 'limit' };
      if (!r.ok || !j) throw { code: 'server', message: 'The reading service replied ' + r.status };
      return j;
    }
    const s = await sampler();
    if (!s) throw { code: 'unavailable' };
    const prompt = task.kind === 'fix' ? SheetPrompts.fix(task) : SheetPrompts.read(task);
    return s.json(prompt, { images, modelTier: 'complex', signal, cache: false, onText });
  }

  /* ---- close-ups: find each line of music on the page, straighten it and crop it at full resolution ---- */
  async function bitmapOf(blob) {
    try { return await createImageBitmap(blob); }
    catch (e) { return await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(blob); }); }
  }
  const canvasOf = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  const jpeg = (c, q = 0.9) => new Promise(res => c.toBlob(res, 'image/jpeg', q));
  function findSystems(img) {
    const AW = 1000, sc = AW / img.width, AH = Math.round(img.height * sc);
    if (AH < 200 || AH > 6000) return null;
    const c = canvasOf(AW, AH), x = c.getContext('2d', { willReadFrequently: true });
    x.fillStyle = '#fff'; x.fillRect(0, 0, AW, AH); x.drawImage(img, 0, 0, AW, AH);
    const d = x.getImageData(0, 0, AW, AH).data, N = AW * AH, g = new Uint8Array(N);
    for (let i = 0; i < N; i++) g[i] = (d[4 * i] * 77 + d[4 * i + 1] * 151 + d[4 * i + 2] * 28) >> 8;
    // paper brightness per 40px block (copes with shadows across a photo), then ink = clearly darker than the paper
    const B = 40, bw = Math.ceil(AW / B), bh = Math.ceil(AH / B), bg = new Float32Array(bw * bh), tmp = [];
    for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) {
      tmp.length = 0;
      for (let y = by * B; y < Math.min(AH, by * B + B); y += 2) for (let xx = bx * B; xx < Math.min(AW, bx * B + B); xx += 2) tmp.push(g[y * AW + xx]);
      tmp.sort((a, b) => a - b); bg[by * bw + bx] = tmp[Math.floor(tmp.length * 0.9)] || 255;
    }
    const bgS = new Float32Array(bw * bh);
    for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) {
      let m = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = by + dy, xx = bx + dx; if (yy >= 0 && yy < bh && xx >= 0 && xx < bw) m = Math.max(m, bg[yy * bw + xx]); }
      bgS[by * bw + bx] = m;
    }
    const ink = new Uint8Array(N), px = [], py = [];
    for (let y = 0; y < AH; y++) for (let xx = 0; xx < AW; xx++) {
      const i = y * AW + xx, p = bgS[((y / B) | 0) * bw + ((xx / B) | 0)];
      if (p > 90 && g[i] < p * 0.74) { ink[i] = 1; px.push(xx); py.push(y); }
    }
    if (px.length < 2000) return null;
    // straighten: the angle that makes the staff lines most horizontal
    const off = Math.ceil(AW * Math.tan(5 * Math.PI / 180)) + 2, HL = AH + 2 * off;
    const profile = t => { const h = new Float32Array(HL); for (let i = 0; i < px.length; i++) h[Math.round(py[i] - px[i] * t) + off]++; return h; };
    let best = { score: -1 };
    for (let a = -4; a <= 4.001; a += 0.2) {
      const t = Math.tan(a * Math.PI / 180), h = profile(t); let sc2 = 0; for (let i = 0; i < HL; i++) sc2 += h[i] * h[i];
      if (sc2 > best.score) best = { score: sc2, t, a, h };
    }
    const { t, h: H } = best;
    // staff lines: rows that are ink almost all the way across
    let maxH = 0; for (let i = 0; i < HL; i++) maxH = Math.max(maxH, H[i]);
    const thr = Math.max(AW * 0.25, maxH * 0.45), lines = [];
    for (let i = 0; i < HL; i++) {
      if (H[i] < thr) continue;
      let j = i, w = 0, s = 0; while (j < HL && H[j] >= thr) { w += H[j]; s += H[j] * j; j++; }
      lines.push({ y: s / w - off, th: j - i }); i = j;
    }
    // staves: five evenly spaced lines
    const staves = [];
    for (let i = 0; i + 4 < lines.length;) {
      const L = lines.slice(i, i + 5), gaps = [1, 2, 3, 4].map(k => L[k].y - L[k - 1].y), m = gaps.reduce((a, b) => a + b) / 4;
      if (m >= 4 && m <= 40 && gaps.every(gp => gp > m * 0.75 && gp < m * 1.3) && L.every(l => l.th < m * 0.6)) { staves.push({ top: L[0].y, bot: L[4].y, gap: m }); i += 5; }
      else i++;
    }
    if (!staves.length || staves.length > 24) return null;
    const gaps = staves.map(s => s.gap).sort((a, b) => a - b), gap = gaps[gaps.length >> 1];
    if (staves.some(s => s.gap < gap * 0.7 || s.gap > gap * 1.4)) return null;
    // which staves belong together: a grand staff's barlines run from one staff to the other
    const at = (xx, v) => { const y = Math.round(v + xx * t); return y >= 0 && y < AH && ink[y * AW + xx]; };
    function joined(a, b) {
      const y0 = a.bot + 2, y1 = b.top - 2;
      if (y1 - y0 > gap * 14) return false;
      let runs = 0, inRun = false;
      for (let xx = 0; xx < AW; xx++) {
        let hit = 0, n = 0; for (let v = y0; v <= y1; v += 1) { n++; if (at(xx, v) || (xx > 0 && at(xx - 1, v)) || (xx < AW - 1 && at(xx + 1, v))) hit++; }
        const ok = n > 0 && hit / n > 0.93;
        if (ok && !inRun) runs++; inRun = ok;
      }
      return runs >= 2;
    }
    const links = staves.slice(1).map((s, i) => joined(staves[i], s));
    if (!links.some(Boolean) && staves.length % 2 === 0 && staves.length >= 2) {
      const sp = staves.slice(1).map((s, i) => s.top - staves[i].bot), inner = sp.filter((_, i) => i % 2 === 0), outer = sp.filter((_, i) => i % 2 === 1);
      if (!outer.length || Math.max(...inner) < Math.min(...outer) * 0.85) links.forEach((_, i) => links[i] = i % 2 === 0);
    }
    const systems = [];
    staves.forEach((s, i) => { if (i && links[i - 1]) systems[systems.length - 1].bot = s.bot; else systems.push({ top: s.top, bot: s.bot }); });
    // cut through the emptiest row between neighbouring lines of music
    const rowInk = v => H[Math.round(v) + off] || 0;
    const cuts = [Math.max(0, systems[0].top - gap * 7)];
    for (let i = 1; i < systems.length; i++) {
      const lo = systems[i - 1].bot + gap * 1.5, hi = systems[i].top - gap * 1.5;
      let bestV = (systems[i - 1].bot + systems[i].top) / 2, bestInk = Infinity;
      for (let v = lo; v <= hi; v++) { const k = rowInk(v); if (k < bestInk) { bestInk = k; bestV = v; } }
      cuts.push(bestV);
    }
    cuts.push(Math.min(AH, systems[systems.length - 1].bot + gap * 7));
    // left and right: where the staff lines start and stop (plus room for the brace and bar numbers)
    let x0 = AW, x1 = 0;
    staves.forEach(s => { const v = (s.top + s.bot) / 2; for (let xx = 0; xx < AW; xx++) if (at(xx, v) || at(xx, v + 1) || at(xx, v - 1)) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; } });
    x0 = Math.max(0, x0 - gap * 5); x1 = Math.min(AW, x1 + gap * 2);
    if (x1 - x0 < AW * 0.3) return null;
    return { sc, angle: Math.atan(t), gap, x0, x1, bands: systems.map((s, i) => ({ y0: cuts[i], y1: cuts[i + 1] })) };
  }
  // The images to send for one page: the whole page plus a close-up of each line, or just the page.
  async function pageImages(blob, maxImages) {
    if (maxImages < 3) return { images: [blob], strips: 0 };
    let img, found = null;
    try { img = await bitmapOf(blob); found = findSystems(img); } catch (e) { found = null; }
    if (!found) return { images: [blob], strips: 0 };
    const { sc, angle, x0, x1 } = found;
    // join neighbouring lines when there are more than can be sent
    const room = Math.min(MAX_STRIPS, maxImages - 1), per = Math.ceil(found.bands.length / room), bands = [];
    for (let i = 0; i < found.bands.length; i += per) bands.push({ y0: found.bands[i].y0, y1: found.bands[Math.min(found.bands.length, i + per) - 1].y1 });
    const strips = [];
    for (const b of bands) {
      const X0 = x0 / sc, Y0 = b.y0 / sc, W = (x1 - x0) / sc, Hh = (b.y1 - b.y0) / sc;
      const k = Math.min(1, 1568 / W, Math.sqrt(1.15e6 / (W * Hh)));
      const c = canvasOf(W * k, Hh * k), x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      x.setTransform(k, 0, 0, k, 0, 0); x.translate(-X0, -Y0); x.rotate(-angle); x.drawImage(img, 0, 0);
      strips.push(await jpeg(c));
    }
    const ok = 1000 / Math.max(img.width, img.height), oc = canvasOf(img.width * Math.min(1, ok), img.height * Math.min(1, ok));
    oc.getContext('2d').drawImage(img, 0, 0, oc.width, oc.height);
    return { images: [await jpeg(oc, 0.85), ...strips], strips: strips.length, angle: angle * 180 / Math.PI };
  }

  /* ---- checking a reading ---- */
  const beatsOf = s => { const m = parseMusic(s); return m[0] ? m[0].beats : 0; };
  // the reading as a list of bars, whichever shape it came back in
  function barsOf(data) {
    const grand = data.staves === 'grand' || (!data.staves && data.bars && data.bars.some(b => b && b.lh != null)) || (data.rh != null && data.lh != null && !data.bars);
    let bars;
    if (Array.isArray(data.bars)) bars = data.bars.filter(b => b && typeof b === 'object').map((b, i) => ({ n: Number.isFinite(+b.n) ? +b.n : null, rh: String(b.rh || '').replace(/\bFIN\b/g, '').trim(), lh: String(b.lh || '').replace(/\bFIN\b/g, '').trim(), music: String(b.music || b.rh || '').replace(/\bFIN\b/g, '').trim() }));
    else {
      const split = s => String(s || '').replace(/\bFIN\b/g, '').split('|').map(x => x.trim());
      const rh = split(data.rh), lh = split(data.lh), mu = split(data.music || data.rh);
      bars = Array.from({ length: grand ? Math.max(rh.length, lh.length) : mu.length }, (_, i) => ({ n: null, rh: rh[i] || '', lh: lh[i] || '', music: mu[i] || '' }));
    }
    // bar numbers: trust them while they count up, otherwise count on
    let last = null;
    bars.forEach((b, i) => {
      if (b.n == null || (last != null && (b.n <= last || b.n > last + 5))) b.n = last == null ? (b.n != null && b.n >= 0 ? b.n : 1) : last + 1;
      last = b.n;
    });
    return { grand, bars };
  }
  function problemsIn(data, { firstPage, lastPage }) {
    const { grand, bars } = barsOf(data), tb = timeBeats(data.time || '4/4'), out = [], staves = grand ? ['rh', 'lh'] : ['music'];
    bars.forEach((b, i) => {
      if (i && b.n > bars[i - 1].n + 1) for (let n = bars[i - 1].n + 1; n < b.n; n++) out.push({ n, missing: true });
      const have = {};
      staves.forEach(st => { try { have[st] = beatsOf(b[st]); } catch (e) { have[st] = null; out.push({ n: b.n, staff: st, unreadable: true }); } });
      const vals = staves.map(st => have[st]).filter(v => v != null);
      // a pickup at the start, or the matching short bar at the end, is fine when both staves agree
      const edge = (i === 0 && firstPage) || (i === bars.length - 1 && lastPage);
      if (edge && vals.length === staves.length && vals.every(v => Math.abs(v - vals[0]) < 1e-6) && vals[0] > 0 && vals[0] < tb) return;
      staves.forEach(st => { if (have[st] != null && Math.abs(have[st] - tb) > 1e-6) out.push({ n: b.n, staff: st, have: have[st], want: tb }); });
    });
    return out.slice(0, 24);
  }

  // Read one page: read it, check every bar adds up, and have the bars that don't read again.
  const pageKey = blob => hashOf(blob, 'v' + SheetPrompts.VERSION);
  async function readPage(blob, { fresh, hint, signal, maxImages, firstPage, lastPage, onBars, onStage }) {
    const h = await pageKey(blob);
    if (h && !fresh) { const hit = cacheGet(h); if (hit) { onBars(barsOf(hit).bars.length); return Object.assign({}, hit, { _cached: true }); } }
    const pi = await pageImages(blob, maxImages);
    let data = await call(pi.images, { kind: 'read', strips: pi.strips, hint }, fresh, signal, ({ text }) => onBars((text.match(/"n"\s*:/g) || []).length));
    if (!data || typeof data !== 'object') throw { code: 'invalid_json' };
    if (data.error) return data;
    const probs = problemsIn(data, { firstPage, lastPage });
    data.firstProblems = probs.length;
    if (probs.length) {
      onStage('checking');
      const { grand, bars } = barsOf(data);
      try {
        const fix = await call(pi.images, { kind: 'fix', strips: pi.strips, grand, time: data.time, key: data.key, bars, problems: probs }, fresh, signal);
        if (fix && Array.isArray(fix.bars)) {
          const byN = new Map(bars.map(b => [b.n, b]));
          barsOf({ staves: grand ? 'grand' : 'treble', bars: fix.bars }).bars.forEach((b, i) => {
            const n = Number.isFinite(+fix.bars[i].n) ? +fix.bars[i].n : b.n;
            if (probs.some(p => p.n === n)) byN.set(n, Object.assign({}, b, { n }));
          });
          data.bars = [...byN.values()].sort((a, b) => a.n - b.n);
          delete data.rh; delete data.lh; delete data.music;
        }
      } catch (e) { if (e && (e.code === 'cancelled' || e.name === 'AbortError')) throw e; }
    }
    data.strips = pi.strips;
    if (h) cachePut(h, data);
    return data;
  }

  // How many of these pages would use up the allowance (pages read before are free).
  async function pagesToPay(blobs, fresh) {
    if (fresh) return blobs.length;
    const keys = await Promise.all(blobs.map(pageKey));
    return keys.filter(k => !k || !cacheGet(k)).length;
  }
  async function read(blobs, { onProgress, signal, fresh } = {}) {
    const need = await pagesToPay(blobs, fresh);
    if (need > PageAllowance.left()) throw { code: 'limit', need };
    const a = await available();
    const maxImages = a ? Math.min(a.maxImages, endpoint() ? SERVER_IMAGES : 99) : 1;
    const counts = blobs.map(() => 0), stages = new Set();
    const report = () => onProgress && onProgress({ bars: counts.reduce((x, y) => x + y, 0), checking: stages.size > 0 });
    const opts = i => ({ fresh, signal, maxImages, firstPage: i === 0, lastPage: i === blobs.length - 1, onBars: n => { counts[i] = n; report(); }, onStage: () => { stages.add(i); report(); } });
    const results = [];
    const spent = () => { if (!endpoint()) PageAllowance.add(results.filter(p => p && !p._cached).length); };
    const first = await readPage(blobs[0], opts(0)); results.push(first);
    if (first.error) { spent(); return first; }
    // later pages together, told the time and key from page 1
    const rest = await Promise.all(blobs.slice(1).map((b, j) => readPage(b, Object.assign(opts(j + 1), { hint: { page: j + 2, time: first.time, key: first.key } })).catch(e => { if (e && (e.code === 'cancelled' || e.name === 'AbortError' || e.code === 'limit')) throw e; return { error: 'unreadable' }; })));
    results.push(...rest); spent();
    const pages = [first, ...rest.filter(p => !p.error)];
    // join the pages and apply the key signature, so the notes are the pitches that sound
    const key = KEY_SIGS[first.key] !== undefined ? first.key : 'C', all = [];
    let grand = false;
    pages.forEach(p => { const r = barsOf(p); grand = grand || r.grand; r.bars.forEach(b => { if (all.length && b.n <= all[all.length - 1].n) b.n = all[all.length - 1].n + 1; all.push(b); }); });
    const out = { title: first.title, composer: first.composer, key, time: first.time, tempo: first.tempo, staves: grand ? 'grand' : (first.staves === 'bass' ? 'bass' : 'treble'), barNums: all.map(b => b.n) };
    if (grand) { out.rh = applyKeySig(all.map(b => b.rh), key).join(' | '); out.lh = applyKeySig(all.map(b => b.lh), key).join(' | '); }
    else out.music = applyKeySig(all.map(b => b.music), key).join(' | ');
    out.uncertain = pages.map(p => p.uncertain).filter(Boolean).join(' ');
    out._cached = pages.every(p => p._cached);
    out._rechecked = pages.reduce((n, p) => n + (p.firstProblems ? 1 : 0), 0);
    if (rest.some(p => p.error)) out.uncertain = (out.uncertain + ' Some pages couldn’t be read.').trim();
    return out;
  }

  // shrink and straighten a photo before sending it, and make a small preview (kept large enough for close-ups)
  async function prepare(file) {
    let src;
    try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch (e) { src = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(file); }); }
    const w = src.width, h = src.height;
    const draw = max => { const k = Math.min(1, max / Math.max(w, h)), c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); return c; };
    const big = draw(3200), small = draw(520);
    const blob = await new Promise(res => big.toBlob(res, 'image/jpeg', 0.9));
    return { blob, preview: small.toDataURL('image/jpeg', 0.8) };
  }
  const MESSAGES = {
    unavailable: 'Reading photos isn’t available in this version of the app.',
    not_granted: 'Reading photos needs permission to use Claude. You can allow it from this page’s permissions.',
    sampling_disabled: 'Reading photos isn’t available on this account.',
    images_unavailable: 'This version can’t send pictures to be read.',
    image_rejected: 'That picture couldn’t be used. Try a smaller or clearer photo.',
    rate_limited: 'Too many requests just now. Wait a minute and try again.',
    refused: 'That picture couldn’t be read. Try a different photo.',
    invalid_json: 'The music came back in a muddle. Try again, ideally with a flatter, brighter photo.',
    session_expired: 'Please sign in again, then try once more.',
    server: 'The reading service didn’t answer properly. Try again in a moment.'
  };
  const message = e => {
    if (e && e.code === 'limit') { const left = PageAllowance.left(); return left ? `That needs ${e.need || 'more'} pages, and you have ${left} left this month. Remove some pages, or read the rest from ${PageAllowance.renews()}.` : `You\u2019ve used this month\u2019s ${PageAllowance.limit()} page${PageAllowance.limit() === 1 ? '' : 's'}. You can read more from ${PageAllowance.renews()}.`; }
    return (e && MESSAGES[e.code]) || 'Something went wrong reading the music. Try again.';
  };
  return { available, read, prepare, message, pageImages, findSystems, problemsIn, barsOf, pagesToPay };
})();

/* The reading names notes as printed; this applies the key signature and accidentals
   (which last to the end of the bar, and through a tie into the next) to give the pitches that sound. */
function applyKeySig(bars, key) {
  const ks = keyAlters(key), ACC = { '#': 1, '##': 2, 'b': -1, 'bb': -2, 'n': 0 }, SPELL = { 1: '#', 2: '##', '-1': 'b', '-2': 'bb' };
  let tied = {};
  return bars.map(bar => {
    const acc = {}, once = tied, next = {};
    const toks = String(bar || '').trim().match(/\([^)]*\)\S*|\S+/g) || [];
    const out = toks.map(tok => {
      const m = /^(?:\(([^)]*)\)|([a-gA-G][^:\s(]*))(.*)$/.exec(tok);
      if (!m) return tok;
      const chord = m[1] != null, tail = m[3] || '', isTied = /^:?[^{\[]*~/.test(tail);
      const ps = (chord ? m[1].trim().split(/\s+/) : [m[2]]).map(p => {
        const pm = /^([a-gA-G])(##|bb|#|b|n)?(-?\d)$/.exec(p);
        if (!pm) return p;
        const L = pm[1].toLowerCase(), k = L + pm[3];
        let alter;
        if (pm[2] != null) { alter = ACC[pm[2]]; acc[k] = alter; }
        else if (k in once) { alter = once[k]; delete once[k]; }
        else alter = k in acc ? acc[k] : (ks[L] || 0);
        if (isTied) next[k] = alter;
        return L + (SPELL[alter] || '') + pm[3];
      });
      return (chord ? '(' + ps.join(' ') + ')' : ps[0]) + tail;
    });
    tied = next;
    return out.join(' ');
  });
}

/* ---------- check and tidy what came back, so it always renders and plays ---------- */
const REST_FILL = [[4, 'w'], [3, 'h.'], [2, 'h'], [1.5, 'q.'], [1, 'q'], [0.75, '8.'], [0.5, '8'], [0.25, '16']];
function restsFor(beats) { const out = []; let left = beats; for (const [b, d] of REST_FILL) while (left >= b - 1e-6) { out.push('r:' + d); left -= b; } return out; }
function cleanStaff(text, label, warnings, num = i => i + 1) {
  const raw = String(text || '').replace(/\bFIN\b/g, '').replace(/[\n\r]+/g, ' ').trim();
  const bars = raw.split('|').map(b => b.trim()).filter((b, i, a) => b || i < a.length - 1);
  const state = {};
  return bars.map((bar, i) => {
    const toks = bar.match(/\([^)]*\)\S*|\S+/g) || [];
    const kept = [];
    toks.forEach(t => {
      try { const before = Object.assign({}, state); parseBar(t, state); kept.push(t); if (state.lastDur === undefined) Object.assign(state, before); }
      catch (e) { warnings.push(`${label}, bar ${num(i)}: left out “${t}”, which couldn’t be read.`); }
    });
    return kept.join(' ');
  });
}
function cleanSheet(data) {
  if (!data || typeof data !== 'object') throw { code: 'invalid_json' };
  if (data.error) throw { code: 'not_music', message: String(data.error) };
  const warnings = [];
  const key = KEY_SIGS[data.key] !== undefined ? data.key : 'C';
  if (data.key && key !== data.key) warnings.push(`The key “${data.key}” wasn’t recognised, so C major was used.`);
  const time = /^(\d+\/\d+|C)$/.test(String(data.time || '')) ? String(data.time) : '4/4';
  const tb = timeBeats(time);
  const grand = data.staves === 'grand' || (data.rh && data.lh);
  // printed bar numbers, when the music came from a page that has them
  const nums = Array.isArray(data.barNums) ? data.barNums : null, num = i => nums && nums[i] != null ? nums[i] : i + 1;
  let parts = grand ? { rh: cleanStaff(data.rh, 'Right hand', warnings, num), lh: cleanStaff(data.lh, 'Left hand', warnings, num) }
    : { music: cleanStaff(data.music || data.rh || data.lh, 'Music', warnings, num) };
  const n = Math.max(...Object.values(parts).map(b => b.length));
  if (!n || !Object.values(parts).some(b => b.some(x => x))) throw { code: 'not_music', message: 'No notes were found.' };
  // same number of bars on both staves
  Object.keys(parts).forEach(k => { while (parts[k].length < n) parts[k].push(''); });
  // every bar the right length (a short first bar is a pickup)
  const beats = s => { try { return parseMusic(s)[0] ? parseMusic(s)[0].beats : 0; } catch (e) { return 0; } };
  const pickup = Object.values(parts).map(b => beats(b[0])).reduce((a, b) => Math.max(a, b), 0);
  const isPickup = pickup > 0 && pickup < tb - 1e-6 && num(0) <= 1;
  Object.entries(parts).forEach(([k, bars]) => {
    bars.forEach((bar, i) => {
      const want = (i === 0 && isPickup) ? pickup : (i === n - 1 && isPickup) ? tb - pickup : tb;
      const have = bar ? beats(bar) : 0;
      if (have < want - 1e-6) { parts[k][i] = (bar + ' ' + restsFor(want - have).join(' ')).trim(); if (have > 0) { const miss = +(want - have).toFixed(2); warnings.push(`${k === 'lh' ? 'Left hand' : k === 'rh' ? 'Right hand' : 'Music'}, bar ${num(i)}: was ${miss} beat${miss === 1 ? '' : 's'} short, so a rest was added at the end. Check it against the page.`); } }
      else if (have > want + 1e-6 && !(i === n - 1 && isPickup)) warnings.push(`${k === 'lh' ? 'Left hand' : k === 'rh' ? 'Right hand' : 'Music'}, bar ${num(i)}: has too many beats. Check it against the page.`);
    });
  });
  const join = bars => bars.join(' | ') + ' FIN';
  const tempo = Number(data.tempo);
  const song = {
    title: String(data.title || '').trim().slice(0, 80) || null, by: String(data.composer || '').trim().slice(0, 60) || null,
    clef: grand ? 'grand' : (data.staves === 'bass' ? 'bass' : 'treble'), key, time,
    bpm: tempo >= 30 && tempo <= 240 ? Math.round(tempo) : 80
  };
  if (grand) { song.rh = join(parts.rh); song.lh = join(parts.lh); } else song.music = join(parts.music);
  if (data.uncertain) warnings.push('Unsure about: ' + String(data.uncertain).slice(0, 240));
  return { song, warnings };
}
