/* ============================================================
   Help me play: files. PDFs are turned into page images for reading;
   MusicXML files (from MuseScore, Sibelius, Finale, Dorico...) are
   converted directly, note for note, with no guessing.
   ============================================================ */
const LIBS = {
  pdf: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  pdfWorker: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
  zip: 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'
};
const libUrl = k => (window.LOCAL_LIBS && window.LOCAL_LIBS[k]) || LIBS[k];
const libLoads = {};
function loadLib(k) {
  if (!libLoads[k]) libLoads[k] = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = libUrl(k); s.async = true;
    s.onload = () => res(); s.onerror = () => { delete libLoads[k]; rej(new Error('Could not load ' + k)); };
    document.head.appendChild(s);
  });
  return libLoads[k];
}
function fileKind(f) {
  const n = (f.name || '').toLowerCase(), t = f.type || '';
  if (t === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
  if (n.endsWith('.mxl')) return 'mxl';
  if (/\.(mid|midi|kar)$/.test(n) || t === 'audio/midi' || t === 'audio/x-midi') return 'midi';
  if (n.endsWith('.musicxml') || n.endsWith('.xml') || t.includes('musicxml')) return 'xml';
  if (t.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|heif|bmp)$/.test(n)) return 'image';
  return 'unknown';
}

/* ---------- PDF: each page becomes a JPEG, like a photo ---------- */
async function pdfToPages(file, maxPages = 12) {
  await loadLib('pdf');
  const lib = window.pdfjsLib;
  lib.GlobalWorkerOptions.workerSrc = libUrl('pdfWorker');
  const doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages = [], n = Math.min(doc.numPages, maxPages);
  for (let i = 1; i <= n; i++) {
    const page = await doc.getPage(i), v1 = page.getViewport({ scale: 1 });
    const scale = Math.min(4, 3200 / Math.max(v1.width, v1.height)), vp = page.getViewport({ scale });
    const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.9));
    const t = document.createElement('canvas'), k = 520 / Math.max(c.width, c.height); t.width = Math.round(c.width * k); t.height = Math.round(c.height * k);
    t.getContext('2d').drawImage(c, 0, 0, t.width, t.height);
    pages.push({ blob, preview: t.toDataURL('image/jpeg', 0.8), label: 'Page ' + i });
  }
  return { pages, total: doc.numPages };
}

/* ---------- MusicXML ---------- */
async function readMusicXmlFile(file, kind) {
  if (kind === 'mxl') {
    await loadLib('zip');
    const zip = await window.JSZip.loadAsync(await file.arrayBuffer());
    let path = null;
    const container = zip.file('META-INF/container.xml');
    if (container) { const m = /full-path="([^"]+)"/.exec(await container.async('string')); if (m) path = m[1]; }
    if (!path) path = Object.keys(zip.files).find(p => !p.startsWith('META-INF') && /\.(musicxml|xml)$/i.test(p));
    if (!path || !zip.file(path)) throw new Error('No music found inside that .mxl file.');
    return musicXmlToSheet(await zip.file(path).async('string'));
  }
  return musicXmlToSheet(await file.text());
}

const MAJOR_BY_FIFTHS = { '-7': 'Cb', '-6': 'Gb', '-5': 'Db', '-4': 'Ab', '-3': 'Eb', '-2': 'Bb', '-1': 'F', 0: 'C', 1: 'G', 2: 'D', 3: 'A', 4: 'E', 5: 'B', 6: 'F#', 7: 'C#' };
const MINOR_BY_FIFTHS = { '-7': 'Abm', '-6': 'Ebm', '-5': 'Bbm', '-4': 'Fm', '-3': 'Cm', '-2': 'Gm', '-1': 'Dm', 0: 'Am', 1: 'Em', 2: 'Bm', 3: 'F#m', 4: 'C#m', 5: 'G#m', 6: 'D#m', 7: 'A#m' };
// note lengths in crotchets the notation can write in one token
const DUR_TOKENS = [[4, 'w'], [3, 'h.'], [2, 'h'], [1.5, 'q.'], [1, 'q'], [0.75, '8.'], [0.5, '8'], [0.375, '16.'], [0.25, '16'], [0.125, '32'],
  [4 / 3, 'ht'], [2 / 3, 'qt'], [1 / 3, '8t'], [1 / 6, '16t']];
function splitDuration(q) {
  // the fewest tokens that add up to q crotchets (tied together for notes)
  const exact = DUR_TOKENS.find(([b]) => Math.abs(b - q) < 1e-3);
  if (exact) return [exact[1]];
  const out = []; let left = q;
  for (const [b, d] of DUR_TOKENS.slice(0, 10)) while (left >= b - 1e-3) { out.push(d); left -= b; }
  if (left > 1e-2) for (const [b, d] of DUR_TOKENS.slice(10)) while (left >= b - 1e-3) { out.push(d); left -= b; }
  return out.length ? out : ['16'];
}
function musicXmlToSheet(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror') || !doc.querySelector('part')) throw new Error('That file isn’t MusicXML the app can read.');
  const kid = (el, sel) => el ? el.querySelector(sel) : null;
  const txt = (el, sel) => { const e = kid(el, sel); return e ? e.textContent.trim() : ''; };
  const title = txt(doc, 'work > work-title') || txt(doc, 'movement-title') || null;
  const composer = (Array.from(doc.querySelectorAll('identification > creator')).find(c => (c.getAttribute('type') || '') === 'composer') || {}).textContent || null;
  const parts = Array.from(doc.querySelectorAll('part'));
  let key = null, time = null, tempo = null;

  // read one part into staves -> measures -> [{start, dur, pitches|null, tie}]
  function readPart(part) {
    let divisions = 1, staves = 1;
    const clefs = {}, measures = [];
    Array.from(part.querySelectorAll(':scope > measure')).forEach((m, mi) => {
      const mm = { staves: {} }; let pos = 0, length = 0, last = null;
      Array.from(m.children).forEach(el => {
        const tag = el.tagName;
        if (tag === 'attributes') {
          const d = txt(el, 'divisions'); if (d) divisions = +d;
          const s = txt(el, 'staves'); if (s) staves = +s;
          const f = txt(el, 'key > fifths'); if (f !== '' && key === null) key = (txt(el, 'key > mode') === 'minor' ? MINOR_BY_FIFTHS : MAJOR_BY_FIFTHS)[+f] || 'C';
          const b = txt(el, 'time > beats'), bt = txt(el, 'time > beat-type'); if (b && bt && time === null) time = kid(el, 'time') && kid(el, 'time').getAttribute('symbol') === 'common' ? 'C' : b + '/' + bt;
          el.querySelectorAll('clef').forEach(c => { const n = +(c.getAttribute('number') || 1); clefs[n] = clefs[n] || (txt(c, 'sign') === 'F' ? 'bass' : 'treble'); });
        } else if (tag === 'direction' || tag === 'sound') {
          const snd = tag === 'sound' ? el : kid(el, 'sound'); if (snd && snd.getAttribute('tempo') && tempo === null) tempo = Math.round(+snd.getAttribute('tempo'));
          const pm = txt(el, 'per-minute'); if (pm && tempo === null) tempo = Math.round(+pm);
        } else if (tag === 'backup') { pos -= +txt(el, 'duration') / divisions; }
        else if (tag === 'forward') { pos += +txt(el, 'duration') / divisions; length = Math.max(length, pos); }
        else if (tag === 'note') {
          if (kid(el, 'grace') || kid(el, 'cue')) return;
          const dur = +txt(el, 'duration') / divisions;
          const staff = +(txt(el, 'staff') || 1), voice = txt(el, 'voice') || '1';
          const isChord = !!kid(el, 'chord');
          let pitch = null;
          if (!kid(el, 'rest')) {
            const step = txt(el, 'pitch > step').toLowerCase(), alter = Math.round(+(txt(el, 'pitch > alter') || 0)), oct = txt(el, 'pitch > octave');
            pitch = step + ({ 1: '#', 2: '##', '-1': 'b', '-2': 'bb' }[alter] || '') + oct;
          }
          const tie = Array.from(el.querySelectorAll('tie')).some(t => t.getAttribute('type') === 'start');
          if (isChord && last && pitch) { if (last.pitches) last.pitches.push(pitch); return; }
          const ev = { start: pos, dur, pitches: pitch ? [pitch] : null, tie, voice };
          ((mm.staves[staff] = mm.staves[staff] || {})[voice] = mm.staves[staff][voice] || []).push(ev);
          last = ev; pos += dur; length = Math.max(length, pos);
        }
      });
      mm.length = length;
      measures.push(mm);
    });
    return { staves, clefs, measures };
  }
  // one line of tokens per staff: the busiest voice in each bar, gaps filled with rests
  function staffText(p, staff) {
    return p.measures.map(m => {
      const voices = m.staves[staff] || {};
      const best = Object.values(voices).sort((a, b) => b.reduce((s, e) => s + (e.pitches ? e.dur : 0), 0) - a.reduce((s, e) => s + (e.pitches ? e.dur : 0), 0))[0] || [];
      const toks = []; let pos = 0;
      const rest = q => splitDuration(q).forEach(d => toks.push('r:' + d));
      best.sort((a, b) => a.start - b.start).forEach(ev => {
        if (ev.start > pos + 1e-3) rest(ev.start - pos);
        if (ev.start < pos - 1e-3) return; // overlapping voice notes: skip
        const parts = splitDuration(ev.dur);
        if (!ev.pitches) parts.forEach(d => toks.push('r:' + d));
        else {
          const head = ev.pitches.length > 1 ? '(' + ev.pitches.join(' ') + ')' : ev.pitches[0];
          parts.forEach((d, i) => toks.push(head + ':' + d + ((i < parts.length - 1 || ev.tie) ? '~' : '')));
        }
        pos = ev.start + ev.dur;
      });
      if (m.length > pos + 1e-3) rest(m.length - pos);
      return toks.join(' ');
    }).join(' | ') + ' FIN';
  }
  const first = readPart(parts[0]);
  const out = { title, composer: composer && composer.trim(), key: key || 'C', time: time || '4/4', tempo, uncertain: '' };
  if (first.staves >= 2) {
    out.staves = 'grand'; out.rh = staffText(first, 1); out.lh = staffText(first, 2);
  } else if (parts.length >= 2) {
    const second = readPart(parts[1]);
    if ((second.clefs[1] || 'treble') === 'bass' && second.measures.length === first.measures.length) { out.staves = 'grand'; out.rh = staffText(first, 1); out.lh = staffText(second, 1); }
    else { out.staves = first.clefs[1] === 'bass' ? 'bass' : 'treble'; out.music = staffText(first, 1); }
    if (parts.length > 2) out.uncertain = 'This file has ' + parts.length + ' instruments; only the first ' + (out.staves === 'grand' ? 'two were' : 'one was') + ' used.';
  } else { out.staves = first.clefs[1] === 'bass' ? 'bass' : 'treble'; out.music = staffText(first, 1); }
  return out;
}

/* ---------- MIDI files: notes are exact, rhythms are tidied to the nearest semiquaver (or triplet) ---------- */
function parseSMF(buf) {
  const d = new DataView(buf); let p = 0;
  const str = n => { let s = ''; for (let i = 0; i < n; i++) s += String.fromCharCode(d.getUint8(p + i)); p += n; return s; };
  const u32 = () => { const v = d.getUint32(p); p += 4; return v; }, u16 = () => { const v = d.getUint16(p); p += 2; return v; };
  const vlq = () => { let v = 0, b; do { b = d.getUint8(p++); v = (v << 7) | (b & 0x7f); } while (b & 0x80); return v; };
  if (str(4) !== 'MThd') throw new Error('That isn’t a MIDI file.');
  const hl = u32(); u16(); const ntrk = u16(), div = u16(); p += hl - 6;
  if (div & 0x8000) throw new Error('This MIDI file uses a timing format the app can’t read.');
  const tracks = [], meta = { tempo: null, time: null, key: null, name: null };
  for (let t = 0; t < ntrk && p < buf.byteLength; t++) {
    const id = str(4), len = u32(), end = p + len;
    if (id !== 'MTrk') { p = end; continue; }
    let tick = 0, status = 0; const on = {}, notes = [];
    while (p < end) {
      tick += vlq();
      let b = d.getUint8(p);
      if (b & 0x80) { status = b; p++; }
      const type = status & 0xf0, ch = status & 0x0f;
      if (status === 0xff) {
        const mt = d.getUint8(p++), ml = vlq(), at = p;
        if (mt === 0x51 && meta.tempo === null) meta.tempo = Math.round(60000000 / ((d.getUint8(at) << 16) | (d.getUint8(at + 1) << 8) | d.getUint8(at + 2)));
        if (mt === 0x58 && meta.time === null) meta.time = d.getUint8(at) + '/' + Math.pow(2, d.getUint8(at + 1));
        if (mt === 0x59 && meta.key === null) meta.key = { sf: d.getInt8(at), minor: d.getUint8(at + 1) === 1 };
        if (mt === 0x03 && !meta.name) { let s = ''; for (let i = 0; i < ml; i++) s += String.fromCharCode(d.getUint8(at + i)); if (s.trim()) meta.name = s.trim(); }
        p = at + ml; continue;
      }
      if (status === 0xf0 || status === 0xf7) { const l = vlq(); p += l; continue; }
      const a = d.getUint8(p++), bb = (type === 0xc0 || type === 0xd0) ? 0 : d.getUint8(p++);
      if (ch === 9) continue; // drums
      if (type === 0x90 && bb > 0) { (on[a] = on[a] || []).push(tick); }
      else if (type === 0x80 || (type === 0x90 && bb === 0)) { const s = on[a] && on[a].shift(); if (s !== undefined) notes.push({ m: a, s, e: tick, ch }); }
    }
    p = end;
    if (notes.length) tracks.push({ notes, name: null });
  }
  return { div, tracks, meta };
}
function midiFileToSheet(buf) {
  const { div, tracks, meta } = parseSMF(buf);
  if (!tracks.length) throw new Error('No notes were found in that MIDI file.');
  const time = meta.time || '4/4', tb = timeBeats(time);
  const key = meta.key ? ((meta.key.minor ? MINOR_BY_FIFTHS : MAJOR_BY_FIFTHS)[meta.key.sf] || 'C') : 'C';
  const prefer = (KEY_SIGS[key] || 0) < 0 ? 'b' : '#';
  const toBeats = t => t / div;
  // which notes are the right hand and which the left
  let rh, lh;
  const avg = ns => ns.reduce((a, n) => a + n.m, 0) / ns.length;
  const big = tracks.slice().sort((a, b) => b.notes.length - a.notes.length);
  if (big.length >= 2) { [rh, lh] = avg(big[0].notes) >= avg(big[1].notes) ? [big[0].notes, big[1].notes] : [big[1].notes, big[0].notes]; }
  else { const all = big[0].notes; rh = all.filter(n => n.m >= 60); lh = all.filter(n => n.m < 60); if (!lh.length || !rh.length) { rh = all; lh = []; } }
  const lastBeat = Math.max(...tracks.flatMap(t => t.notes.map(n => toBeats(n.e))));
  const nBars = Math.max(1, Math.ceil((lastBeat - 1e-3) / tb));
  // tidy each beat's onsets to semiquavers, or to triplets when they fit better
  function quantise(x) {
    const beat = Math.floor(x + 1e-6), f = x - beat;
    const q4 = Math.round(f * 4) / 4, q3 = Math.round(f * 3) / 3;
    return beat + (Math.abs(f - q3) + 0.02 < Math.abs(f - q4) ? q3 : q4);
  }
  function handText(notes) {
    if (!notes.length) return Array.from({ length: nBars }, () => restsFor(tb).join(' ')).join(' | ') + ' FIN';
    const evs = notes.map(n => ({ m: n.m, s: quantise(toBeats(n.s)), e: quantise(toBeats(n.e)) })).map(n => ({ ...n, e: Math.max(n.e, n.s + 0.25) }));
    const onsets = [...new Set(evs.map(n => +n.s.toFixed(4)))].sort((a, b) => a - b);
    const items = onsets.map((s, i) => {
      const here = evs.filter(n => Math.abs(n.s - s) < 1e-3), next = i + 1 < onsets.length ? onsets[i + 1] : Infinity;
      const end = Math.min(next, Math.max(...here.map(n => n.e)));
      return { s, e: end, pitches: [...new Set(here.map(n => n.m))].sort((a, b) => a - b).map(m => midiToPitch(m, prefer)) };
    });
    const bars = Array.from({ length: nBars }, () => []);
    let pos = 0;
    const put = (from, to, head) => {   // write from..to, splitting at barlines and into lengths the notation can show
      while (to - from > 1e-3) {
        const bar = Math.min(nBars - 1, Math.floor(from / tb + 1e-6)), barEnd = (bar + 1) * tb, seg = Math.min(to, barEnd) - from;
        const parts = splitDuration(seg);
        parts.forEach((d, k) => { const last = k === parts.length - 1 && Math.min(to, barEnd) >= to - 1e-3; bars[bar].push(head ? head + ':' + d + (last ? '' : '~') : 'r:' + d); });
        from += seg;
      }
    };
    items.forEach(it => {
      if (it.s > pos + 1e-3) put(pos, it.s, null);
      const head = it.pitches.length > 1 ? '(' + it.pitches.join(' ') + ')' : it.pitches[0];
      put(it.s, it.e, head); pos = it.e;
    });
    if (pos < nBars * tb - 1e-3) put(pos, nBars * tb, null);
    return bars.map(b => b.join(' ')).join(' | ') + ' FIN';
  }
  const out = { title: meta.name, composer: null, key, time, tempo: meta.tempo, uncertain: '' };
  if (lh.length) { out.staves = 'grand'; out.rh = handText(rh); out.lh = handText(lh); }
  else { out.staves = avg(rh) < 57 ? 'bass' : 'treble'; out.music = handText(rh); }
  if (big.length > 2) out.uncertain = 'This file has ' + big.length + ' parts; the two busiest were used as the right and left hands.';
  return out;
}
