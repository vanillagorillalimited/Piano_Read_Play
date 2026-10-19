/* ============================================================
   About this piece: the key, notes outside it, the chords, hand
   shapes with fingering, and patterns worth knowing. Worked out
   from the notes alone, so it costs nothing and works offline.
   ============================================================ */
const SIG_MAJOR = { 0: 'C', 1: 'G', 2: 'D', 3: 'A', 4: 'E', 5: 'B', 6: 'F#', 7: 'C#', '-1': 'F', '-2': 'Bb', '-3': 'Eb', '-4': 'Ab', '-5': 'Db', '-6': 'Gb', '-7': 'Cb' };
const BLACK_PC = new Set([1, 3, 6, 8, 10]);
const escA = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pcOfName = k => { const L = k[0].toLowerCase(); return (PC[L] + (k[1] === '#' ? 1 : k[1] === 'b' ? -1 : 0) + 12) % 12; };
const niceName = p => pitchLabel(p, false);                         // C♯, B♭
const plural = (n, w, ws) => n + ' ' + (n === 1 ? w : (ws || w + 's'));
function barList(bars, max = 4) {
  const b = [...new Set(bars)].sort((x, y) => x - y).map(x => x + 1);
  const runs = [];
  b.forEach(n => { const r = runs[runs.length - 1]; if (r && n === r[1] + 1) r[1] = n; else runs.push([n, n]); });
  const txt = runs.slice(0, max).map(([a, z]) => a === z ? a : a + '–' + z);
  return (b.length === 1 ? 'bar ' : 'bars ') + txt.join(', ') + (runs.length > max ? ' and more' : '');
}

/* the notes, with when they start and which hand plays them */
function pieceNotes(p) {
  const tb = timeBeats(p.time || '4/4');
  const staves = p.clef === 'grand' ? [['rh', p.rh], ['lh', p.lh]] : [[p.clef === 'bass' ? 'lh' : 'rh', p.music]];
  const events = [], sigs = { rh: [], lh: [] };
  let nBars = 0;
  staves.forEach(([hand, text]) => {
    let bars; try { bars = parseMusic(text || ''); } catch (e) { return; }
    let t = 0, tiedIn = false;
    bars.forEach((b, i) => {
      let pos = 0;
      sigs[hand].push(b.items.map(it => (it.rest ? 'r' : '') + it.dur + (it.dotted ? '.' : '') + (it.triplet ? 't' : '')).join(' '));
      b.items.forEach(it => {
        if (!it.rest) events.push({ hand, start: t + pos, beats: it.beats, pitches: it.pitches, midis: it.pitches.map(x => x.midi).sort((a, c) => a - c), bar: i, pos, tiedIn });
        tiedIn = !it.rest && it.tie;
        pos += it.beats;
      });
      t += b.items.length ? b.beats : tb;
    });
    nBars = Math.max(nBars, bars.length);
  });
  events.sort((a, b) => a.start - b.start || a.midis[0] - b.midis[0]);
  return { tb, events, nBars, sigs };
}

/* ---- chords ---- */
const CHORDS = [['', [0, 4, 7]], ['m', [0, 3, 7]], ['dim', [0, 3, 6]], ['aug', [0, 4, 8]], ['7', [0, 4, 7, 10]], ['maj7', [0, 4, 7, 11]], ['m7', [0, 3, 7, 10]], ['sus4', [0, 5, 7]], ['sus2', [0, 2, 7]]];
// the chord that best explains a set of weighted pitch classes
function bestChord(w, bassPc) {
  const total = w.reduce((a, b) => a + b, 0); if (!total) return null;
  const present = w.map((x, i) => x / total > 0.06 ? i : -1).filter(i => i >= 0);
  if (present.length < 2) return null;
  let best = null;
  present.forEach(root => CHORDS.forEach(([q, iv]) => {
    const pcs = iv.map(x => (root + x) % 12);
    let s = 0; for (let i = 0; i < 12; i++) s += pcs.includes(i) ? w[i] / total : -0.6 * w[i] / total;
    s -= pcs.filter(x => w[x] / total < 0.03).length * 0.3;
    if (root === bassPc) s += 0.1;
    if (q === '' || q === 'm') s += 0.02;
    if (q === 'aug') s -= 0.2; else if (q.startsWith('sus')) s -= 0.08; else if (q === 'dim') s -= 0.05; else if (q.endsWith('7')) s -= 0.04;   // rarer chords need more evidence
    if (!best || s > best.s) best = { s, root, q, pcs };
  }));
  return best && best.s > 0.3 ? best : null;
}
// are these notes all part of one triad or seventh chord?
function fitsChord(pcs) {
  for (let r = 0; r < 12; r++) for (const [q, iv] of CHORDS.slice(0, 7)) { const set = iv.map(x => (r + x) % 12); if (pcs.every(x => set.includes(x))) return true; }
  return false;
}
function spellRoot(root, events, sigN) {
  const seen = {};
  events.forEach(e => e.pitches.forEach(x => { if (x.midi % 12 === root) { const k = niceName(x); seen[k] = (seen[k] || 0) + 1; } }));
  const top = Object.entries(seen).sort((a, b) => b[1] - a[1])[0];
  if (top) return top[0];
  return (sigN < 0 ? ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'] : ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'])[root];
}
function roman(ch, tonicPc, minor) {
  const rel = (ch.root - tonicPc + 12) % 12;
  const maj = ['I', '♭II', 'II', '♭III', 'III', 'IV', '♯IV', 'V', '♭VI', 'VI', '♭VII', 'VII'];
  const min = ['I', '♭II', 'II', 'III', '♮III', 'IV', '♯IV', 'V', 'VI', '♮VI', 'VII', '♮VII'];
  let r = (minor ? min : maj)[rel];
  if (ch.q === 'm' || ch.q === 'm7' || ch.q === 'dim') r = r.toLowerCase();
  return r + (ch.q === 'dim' ? '°' : ch.q === 'aug' ? '+' : ch.q === '7' || ch.q === 'm7' ? '7' : ch.q === 'maj7' ? 'maj7' : ch.q.startsWith('sus') ? ch.q : '');
}
function chordsOf(notes, tonicPc, minor, sigN, time) {
  const { events, tb, nBars } = notes;
  const halves = ['4/4', 'C', '2/2', '6/8', '12/8'].includes(time) ? 2 : 1;   // up to two chords a bar in these times
  const segs = [];
  for (let b = 0; b < nBars; b++) {
    const barEv = events.filter(e => e.bar === b);
    if (!barEv.length) { segs.push({ bar: b, chord: null }); continue; }
    const start = Math.min(...barEv.map(e => e.start - e.pos));
    for (let h = 0; h < halves; h++) {
      const t0 = start + h * tb / halves, t1 = start + (h + 1) * tb / halves;
      const w = new Array(12).fill(0);
      const sounding = events.filter(e => e.start < t1 - 1e-6 && e.start + e.beats > t0 + 1e-6);
      if (!sounding.length) continue;
      const bass = Math.min(...sounding.map(e => e.midis[0]));
      sounding.forEach(e => {
        const dur = Math.min(t1, e.start + e.beats) - Math.max(t0, e.start);
        const strong = Math.abs(e.start - t0) < 1e-6 ? 1.4 : 1, offBeat = e.beats < 1 && Math.abs(((e.start - t0) % 1 + 1) % 1) > 1e-6 ? 0.5 : 1;   // quick notes between beats are often passing notes
        e.midis.forEach(m => { w[m % 12] += dur * strong * offBeat * (m === bass ? 1.6 : 1); });
      });
      // a single line of melody doesn't spell out chords, so don't guess
      const together = sounding.some(e => e.midis.length > 1) || sounding.some((e, i) => sounding.some((f, j) => j > i && f.hand !== e.hand && f.start < e.start + e.beats - 1e-6 && e.start < f.start + f.beats - 1e-6));
      // enough to name a chord: three different notes sounding at once, or an accompaniment that spreads one out
      const at = t => new Set(sounding.filter(e => e.start <= t + 1e-6 && e.start + e.beats > t + 1e-6).flatMap(e => e.midis.map(m => m % 12))).size;
      const handPcs = hd => [...new Set(sounding.filter(e => e.hand === hd).flatMap(e => e.midis.map(m => m % 12)))];
      const spread = ['rh', 'lh'].some(hd => { const ps = handPcs(hd); return ps.length >= 3 && fitsChord(ps); });
      const full = spread || sounding.some(e => at(Math.max(t0, e.start)) >= 3);
      let c = full ? bestChord(w, bass % 12) : null;
      if (!full && together) { const g = bestChord(w, bass % 12); if (g && g.s >= 0.55 && (g.q === '' || g.q === 'm')) c = g; }   // two notes at a time: only a clear triad
      // the second half of a bar that only uses notes of the first half's chord keeps that chord
      const before = segs[segs.length - 1];
      if (h && c && before && before.bar === b && before.chord) { const tot = w.reduce((x, y) => x + y, 0); if (w.every((x, i) => x / tot < 0.08 || before.chord.pcs.includes(i))) c = before.chord; }
      segs.push({ bar: b, half: h, chord: c, bass: bass % 12, ev: sounding, together });
    }
  }
  // fill the gaps (a bar of only octaves, say) from the chord before, when it fits
  let prev = null;
  segs.forEach(s => {
    if (!s.chord && s.together && prev && s.ev && s.ev.every(e => e.midis.every(m => prev.pcs.includes(m % 12)))) s.chord = prev;
    if (s.chord) prev = s.chord;
  });
  const name = c => spellRoot(c.root, events, sigN) + c.q;
  const counts = new Map();
  segs.forEach(s => {
    if (!s.chord) return;
    const n = name(s.chord);
    if (!counts.has(n)) counts.set(n, { name: n, roman: roman(s.chord, tonicPc, minor), bars: new Set(), chord: s.chord });
    counts.get(n).bars.add(s.bar);
  });
  const used = [...counts.values()].map(c => ({ name: c.name, roman: c.roman, bars: c.bars.size, root: c.chord.root, q: c.chord.q })).sort((a, b) => b.bars - a.bars);
  // the opening, bar by bar
  const byBar = [];
  segs.forEach(s => { const arr = byBar[s.bar] || (byBar[s.bar] = []); const n = s.chord ? name(s.chord) : '–'; if (arr[arr.length - 1] !== n) arr.push(n); });
  return { used, byBar: byBar.map(a => (a || ['–']).join(' ')), segs, name };
}

/* ---- the key ---- */
function keyOf(p, notes) {
  const sigN = KEY_SIGS[p.key] || 0, major = SIG_MAJOR[sigN] || 'C', minor = RELATIVE_MINOR[major];
  const majPc = pcOfName(major), minPc = (majPc + 9) % 12;
  const ev = notes.events.filter(e => !e.tiedIn);
  if (!ev.length) return { key: p.key || 'C', major, minor, minorMode: false, tonicPc: majPc, sigN, why: '' };
  const bassOf = list => Math.min(...list.flatMap(e => e.midis)) % 12;
  const firstT = ev[0].start, lastT = Math.max(...ev.map(e => e.start));
  const firstBass = bassOf(ev.filter(e => e.start < firstT + 1e-6)), last = ev.filter(e => e.start > lastT - 1e-6), lastBass = bassOf(last);
  const lastPcs = new Set(last.flatMap(e => e.midis.map(m => m % 12)));
  const all = ev.flatMap(e => e.midis.map(m => m % 12)), leadN = all.filter(x => x === (minPc + 11) % 12).length, lead = leadN / all.length;
  let sMaj = 0, sMin = 0;
  if (lastBass === majPc) sMaj += 3; if (lastBass === minPc) sMin += 3;
  if (firstBass === majPc) sMaj += 1; if (firstBass === minPc) sMin += 1;
  if (lastPcs.has(majPc) && lastPcs.has((majPc + 4) % 12)) sMaj += 1; if (lastPcs.has(minPc) && lastPcs.has((minPc + 3) % 12)) sMin += 1;
  if (leadN >= 3 || lead > 0.015) sMin += 2;
  if (/m$/.test(p.key || '')) sMin += 1.5;
  const minorMode = sMin > sMaj;
  const reasons = [];
  const tonicName = (minorMode ? minor : major).replace(/m$/, '').replace('#', '♯').replace(/^([A-G])b/, '$1♭');
  if (lastBass === (minorMode ? minPc : majPc)) reasons.push(`it ends on ${tonicName}`);
  if (minorMode && (leadN >= 3 || lead > 0.015)) {
    const ln = ev.flatMap(e => e.pitches).find(x => x.midi % 12 === (minPc + 11) % 12);
    if (ln) reasons.push(`${niceName(ln)} keeps appearing: the leading note of ${keyName(minor)}`);
  }
  return { key: minorMode ? minor : major, major, minor, minorMode, tonicPc: minorMode ? minPc : majPc, sigN, reasons };
}
function sigText(n) {
  if (!n) return 'no sharps or flats';
  const list = n > 0 ? SHARP_ORDER.slice(0, n).map(l => l.toUpperCase() + '♯') : FLAT_ORDER.slice(0, -n).map(l => l.toUpperCase() + '♭');
  const words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'][Math.abs(n)];
  return `${words} ${n > 0 ? (Math.abs(n) === 1 ? 'sharp' : 'sharps') : (Math.abs(n) === 1 ? 'flat' : 'flats')} (${list.join(' ')})`;
}

/* ---- notes outside the key ---- */
function outsideNotes(notes, k) {
  const ka = keyAlters(SIG_MAJOR[k.sigN] || 'C'), found = new Map();
  notes.events.forEach(e => {
    if (e.tiedIn) return;
    e.pitches.forEach(x => {
      if (x.alter === (ka[x.letter] || 0)) return;
      const label = x.alter === 0 ? x.letter.toUpperCase() + '♮' : niceName(x);
      if (!found.has(label)) found.set(label, { label, pc: x.midi % 12, count: 0, bars: [] });
      const f = found.get(label); f.count++; f.bars.push(e.bar);
    });
  });
  const tonic = keyName(k.key).replace(/ (major|minor)$/, '');
  const why = f => {
    const rel = (f.pc - k.tonicPc + 12) % 12;
    if (k.minorMode && rel === 11) return `The raised 7th of ${keyName(k.key)}, called the leading note. Minor keys nearly always raise it, so it pulls strongly back up to ${tonic}. It comes from the harmonic minor scale.`;
    if (k.minorMode && rel === 9) return `The raised 6th, from the melodic minor scale. It smooths the way up to the leading note.`;
    if (!k.minorMode && rel === 10) return `A flattened 7th. It gives a bluesy, rocky or folky colour, or turns a chord into a 7th that leads on to chord IV.`;
    if (!k.minorMode && rel === 6) return `A raised 4th. It usually belongs to a chord that leads to the dominant (chord V), making that arrival stronger.`;
    if (!k.minorMode && rel === 3) return `A flattened 3rd. In blues, rock and boogie it\u2019s a \u201cblue note\u201d, often bent against the normal 3rd; elsewhere it\u2019s borrowed from ${tonic} minor for a darker moment.`;
    if (!k.minorMode && rel === 8) return `Borrowed from ${tonic} minor, for a darker moment.`;
    if (!k.minorMode && rel === 1) return `A raised note that usually leads up to the next note of the scale.`;
    return `A note from outside the key. Often it’s a passing note between two notes of the key, or part of a chord borrowed from a nearby key.`;
  };
  return [...found.values()].sort((a, b) => b.count - a.count).map(f => Object.assign(f, { why: why(f) }));
}

/* ---- hand shapes and fingering ---- */
const SHAPE_FINGERS = {
  octave: { rh: [1, 5], lh: [5, 1] }, third: { rh: [1, 3], lh: [3, 1] }, sixth: { rh: [1, 5], lh: [5, 1] }, fifth: { rh: [1, 5], lh: [5, 1] }, fourth: { rh: [1, 4], lh: [4, 1] },
  root: { rh: [1, 3, 5], lh: [5, 3, 1] }, first: { rh: [1, 2, 5], lh: [5, 3, 1] }, second: { rh: [1, 3, 5], lh: [5, 2, 1] },
  root8: { rh: [1, 2, 3, 5], lh: [5, 4, 2, 1] }, first8: { rh: [1, 2, 4, 5], lh: [5, 4, 2, 1] }, second8: { rh: [1, 2, 4, 5], lh: [5, 3, 2, 1] }, seventh: { rh: [1, 2, 3, 5], lh: [5, 3, 2, 1] }
};
const SHAPE_TEXT = {
  octave: ['Octaves', 'Thumb and little finger, hand open. Keep the shape and move from the arm, not the fingers.'],
  third: ['Thirds', 'Two notes a third apart.'], sixth: ['Sixths', 'A wide-ish shape: thumb and little finger, or thumb and 4.'], fifth: ['Fifths', 'Thumb and little finger. In the left hand this is the classic root-and-fifth shape.'], fourth: ['Fourths', ''],
  root: ['Root-position chords', 'Chord name at the bottom, notes a third apart, like a snowman.'], first: ['First inversion chords', 'The root moved to the top, so there’s a gap (a fourth) at the top of the shape.'], second: ['Second inversion chords', 'The fifth is at the bottom, so the gap (a fourth) is at the bottom of the shape.'],
  root8: ['Root-position chords with the octave', 'A chord with the root doubled on top.'], first8: ['First inversion chords with the octave', 'The third doubled at the top.'], second8: ['Second inversion chords with the octave', 'The fifth doubled at the top.'], seventh: ['Seventh chords', 'Four different notes stacked in thirds.'], spread: ['Spread chords', 'Too wide for one hand position: keep the thumb and little finger on the outer notes.']
};
function shapeOf(midis, hand) {
  const ms = [...new Set(midis)].sort((a, b) => a - b), n = ms.length, span = ms[n - 1] - ms[0];
  if (n === 2) {
    const kind = span === 12 ? 'octave' : span === 3 || span === 4 ? 'third' : span === 8 || span === 9 ? 'sixth' : span === 7 ? 'fifth' : span === 5 ? 'fourth' : null;
    return kind ? { kind, fingers: SHAPE_FINGERS[kind][hand], span } : null;
  }
  if (n < 2 || n > 5) return null;
  const pcs = [...new Set(ms.map(m => m % 12))];
  let tri = null;
  for (const r of pcs) for (const [q, iv] of CHORDS.slice(0, 7)) { const set = iv.map(x => (r + x) % 12); if (set.length === pcs.length && set.every(x => pcs.includes(x))) tri = { root: r, q, iv }; }
  if (!tri) return span > 12 ? { kind: 'spread', fingers: null, span } : null;
  if (tri.iv.length === 4) return n === 4 && span <= 12 ? { kind: 'seventh', fingers: SHAPE_FINGERS.seventh[hand], span, chord: tri } : { kind: 'spread', fingers: null, span, chord: tri };
  const bassRel = (ms[0] % 12 - tri.root + 12) % 12, inv = bassRel === 0 ? 'root' : bassRel <= 4 ? 'first' : 'second';
  if (n === 3 && span <= 9) return { kind: inv, fingers: SHAPE_FINGERS[inv][hand], span, chord: tri };
  if (n === 4 && span === 12) return { kind: inv + '8', fingers: SHAPE_FINGERS[inv + '8'][hand], span, chord: tri };
  return { kind: 'spread', fingers: null, span, chord: tri };
}
function shapesOf(notes, chordName) {
  const out = { rh: [], lh: [] };
  ['rh', 'lh'].forEach(hand => {
    const groups = new Map();
    notes.events.filter(e => e.hand === hand && !e.tiedIn && e.midis.length >= 2).forEach(e => {
      const s = shapeOf(e.midis, hand); if (!s) return;
      if (!groups.has(s.kind)) groups.set(s.kind, { kind: s.kind, count: 0, example: e.midis, fingers: s.fingers, names: new Set(), bars: [] });
      const g = groups.get(s.kind); g.count++; g.bars.push(e.bar);
      if (s.chord) g.names.add(chordName({ root: s.chord.root, q: s.chord.q }));
    });
    out[hand] = [...groups.values()].filter(g => g.count >= 2).sort((a, b) => b.count - a.count).slice(0, 4)
      .map(g => ({ kind: g.kind, title: SHAPE_TEXT[g.kind][0], text: SHAPE_TEXT[g.kind][1], count: g.count, example: g.example, fingers: g.fingers, names: [...g.names].slice(0, 5), bars: g.bars }));
  });
  return out;
}

/* ---- patterns ---- */
const DUR_WORD = { w: 'semibreve', h: 'minim', q: 'crotchet', '8': 'quaver', '16': 'semiquaver', '32': 'demisemiquaver' };
function rhythmWords(sig) {
  return sig.split(' ').map(t => { const m = /^(r?)(w|h|q|8|16|32)(\.?)(t?)$/.exec(t); if (!m) return t; return (m[3] ? 'dotted ' : '') + DUR_WORD[m[2]] + (m[1] ? ' rest' : '') + (m[4] ? ' (triplet)' : ''); }).join(', ');
}
function patternsOf(notes, chords) {
  const out = [], { events, sigs, nBars } = notes;
  ['rh', 'lh'].forEach(hand => {
    const H = hand === 'rh' ? 'right' : 'left', ev = events.filter(e => e.hand === hand && !e.tiedIn);
    if (ev.length < 4) return;
    // octaves
    const oct = ev.filter(e => e.midis.length === 2 && e.midis[1] - e.midis[0] === 12).length;
    if (hand === 'lh' && oct / ev.length > 0.4) out.push({ title: 'Left-hand octaves', text: `Most of the left hand is octaves. Set your hand to an octave (5 on the bottom, thumb on top) and keep that shape as you move: let the arm do the travelling and watch the bottom note.` });
    // one rhythm over and over
    const sg = sigs[hand].filter(Boolean), tally = {};
    sg.forEach(s => tally[s] = (tally[s] || 0) + 1);
    const [topSig, topN] = Object.entries(tally).sort((a, b) => b[1] - a[1])[0] || [];
    if (topSig && topN >= 4 && topN / Math.max(1, sg.length) >= 0.5 && topSig.split(' ').length >= 3) out.push({ title: `One ${H}-hand rhythm`, text: `${topN} of the ${sg.length} bars use the same ${H}-hand rhythm: ${rhythmWords(topSig)}. Clap or tap it until it’s automatic, then it looks after itself while you watch the other hand.` });
    // repeated chords
    let rep = 0, run = 1;
    for (let i = 1; i < ev.length; i++) { if (ev[i].midis.length >= 3 && ev[i].midis.join() === ev[i - 1].midis.join()) { run++; if (run === 3) rep++; } else run = 1; }
    if (hand === 'rh' && rep >= 2) out.push({ title: 'Repeated chords', text: 'The right hand often plays the same chord several times in a row. Keep the hand in shape over the keys and play from the wrist, lightly, rather than lifting the whole arm each time.' });
    // scale runs
    const runBars = [];
    let len = 1, dir = 0;
    for (let i = 1; i < ev.length; i++) {
      const a = ev[i - 1], b = ev[i];
      const step = a.midis.length === 1 && b.midis.length === 1 ? b.midis[0] - a.midis[0] : 99, d = Math.sign(step);
      if (Math.abs(step) >= 1 && Math.abs(step) <= 2 && (d === dir || len === 1)) { len++; dir = d; if (len === 5) runBars.push(ev[i - 4].bar, b.bar); }
      else { len = Math.abs(step) >= 1 && Math.abs(step) <= 2 ? 2 : 1; dir = Math.abs(step) <= 2 ? d : 0; }
    }
    if (runBars.length) out.push({ title: `Scale passages (${H} hand)`, text: `Runs of five or more notes by step, in ${barList(runBars)}. Work out where the ${hand === 'rh' ? 'thumb tucks under (going up) or the third finger crosses over (coming down)' : 'thumb tucks under (going down) or the third finger crosses over (going up)'}, write the finger number in, and use the same fingering every time.`, bars: runBars });
    // broken chords: several single notes in a bar that all belong to that bar's chord
    const brokenBars = [];
    for (let b = 0; b < nBars; b++) {
      const singles = ev.filter(e => e.bar === b && e.midis.length === 1);
      const seg = chords.segs.find(s => s.bar === b && s.chord);
      if (singles.length >= 4 && seg && singles.every(e => seg.chord.pcs.includes(e.midis[0] % 12)) && new Set(singles.map(e => e.midis[0])).size >= 3) brokenBars.push(b);
    }
    if (brokenBars.length >= 2) out.push({ title: `Broken chords (${H} hand)`, text: `In ${barList(brokenBars)} the ${H} hand spreads a chord out one note at a time. Play those notes together as a chord first to find the hand shape, then break it up again: your hand barely needs to move.`, bars: brokenBars });
    // jumps
    const jumpBars = [];
    for (let i = 1; i < ev.length; i++) if (Math.abs(ev[i].midis[0] - ev[i - 1].midis[0]) > 12) jumpBars.push(ev[i].bar);
    if (jumpBars.length) out.push({ title: `Jumps (${H} hand)`, text: `The ${H} hand leaps more than an octave in ${barList(jumpBars)}. Look at the landing note before you go, and move early rather than fast.`, bars: jumpBars });
    // stretches
    const wide = ev.filter(e => e.midis.length >= 2 && e.midis[e.midis.length - 1] - e.midis[0] > 12).map(e => e.bar);
    if (wide.length) out.push({ title: `Wide chords (${H} hand)`, text: `Some chords stretch wider than an octave (${barList(wide)}). If your hand can’t reach, roll the chord quickly from the bottom up, or leave out a middle note.`, bars: wide });
    // one hand position
    const lo = Math.min(...ev.flatMap(e => e.midis)), hi = Math.max(...ev.flatMap(e => e.midis));
    if (hi - lo <= 8) out.push({ title: `One ${H}-hand position`, text: `The ${H} hand stays within a handful of notes the whole way through, so you can find a position and keep your hand there.` });
  });
  return out;
}

/* ---- where to start practising: the busiest bars ---- */
function hardBars(notes, outside) {
  const { events, nBars, tb } = notes, score = new Array(nBars).fill(0);
  const odd = new Set(outside.flatMap(o => o.bars.map(b => b + ':' + o.pc)));
  ['rh', 'lh'].forEach(hand => {
    const ev = events.filter(e => e.hand === hand && !e.tiedIn);
    ev.forEach((e, i) => {
      score[e.bar] += 1 / tb + (e.midis.length - 1) * 0.3 / tb;
      if (i && Math.abs(e.midis[0] - ev[i - 1].midis[0]) > 7) score[e.bar] += 0.25;
      e.midis.forEach(m => { if (odd.has(e.bar + ':' + m % 12)) score[e.bar] += 0.15; });
      if (e.beats < 0.5) score[e.bar] += 0.1;
    });
  });
  if (nBars < 6) return [];
  const sorted = score.map((s, b) => [s, b]).sort((a, b) => b[0] - a[0]), mean = score.reduce((a, b) => a + b, 0) / nBars, picks = [];
  for (const [s, b] of sorted) {
    if (s < mean * 1.25 || picks.length === 2) break;
    if (picks.some(p => Math.abs(p.from - b) <= 2)) continue;
    const from = Math.max(0, b === nBars - 1 ? b - 1 : b), to = Math.min(nBars - 1, from + 1);
    picks.push({ from, to });
  }
  return picks.sort((a, b) => a.from - b.from);
}

const ANALYSIS_CACHE = new Map();
function analysePiece(p) {
  const id = [p.key, p.time, p.clef, p.rh, p.lh, p.music].join('\u0001');
  if (ANALYSIS_CACHE.has(id)) return ANALYSIS_CACHE.get(id);
  const notes = pieceNotes(p);
  if (!notes.events.length) return null;
  const key = keyOf(p, notes);
  const outside = outsideNotes(notes, key);
  const chords = chordsOf(notes, key.tonicPc, key.minorMode, key.sigN, p.time);
  const res = { notes, key, outside, chords, shapes: shapesOf(notes, chords.name), patterns: patternsOf(notes, chords), practise: hardBars(notes, outside) };
  ANALYSIS_CACHE.set(id, res);
  return res;
}
// for the score: should this note be picked out as outside the key?
function outsideKeyTest(p) {
  const ka = keyAlters(SIG_MAJOR[KEY_SIGS[p.key] || 0] || 'C');
  return x => x.alter !== (ka[x.letter] || 0);
}

/* ---- a little keyboard with finger numbers ---- */
function miniKeys(midis, fingers, hand) {
  const ms = [...midis].sort((a, b) => a - b);
  let a = ms[0] - 2, b = ms[ms.length - 1] + 2;
  while (BLACK_PC.has(((a % 12) + 12) % 12)) a--; while (BLACK_PC.has(b % 12)) b++;
  const W = 14, H = 46, BW = 9, BH = 28, whites = [];
  for (let m = a; m <= b; m++) if (!BLACK_PC.has(m % 12)) whites.push(m);
  const xOf = m => BLACK_PC.has(m % 12) ? whites.indexOf(m - 1) * W + W - BW / 2 : whites.indexOf(m) * W;
  let s = `<svg class="mini-keys" viewBox="0 0 ${whites.length * W + 1} ${H + 1}" width="${whites.length * W + 1}" height="${H + 1}" role="img" aria-label="${escA((hand === 'lh' ? 'Left' : 'Right') + ' hand: ' + ms.map(m => midiToPitch(m).replace(/\d/, '').toUpperCase()).join(', '))}">`;
  whites.forEach((m, i) => { s += `<rect x="${i * W + 0.5}" y="0.5" width="${W}" height="${H}" rx="2" class="mk-w${ms.includes(m) ? ' on' : ''}"/>`; });
  for (let m = a; m <= b; m++) if (BLACK_PC.has(m % 12)) s += `<rect x="${xOf(m) + 0.5}" y="0.5" width="${BW}" height="${BH}" rx="1.5" class="mk-b${ms.includes(m) ? ' on' : ''}"/>`;
  ms.forEach((m, i) => {
    const black = BLACK_PC.has(m % 12), cx = xOf(m) + (black ? BW : W) / 2 + 0.5, cy = black ? BH - 8 : H - 9;
    s += `<circle cx="${cx}" cy="${cy}" r="6" class="mk-dot"/>` + (fingers ? `<text x="${cx}" y="${cy + 3.5}" class="mk-f" text-anchor="middle">${fingers[i]}</text>` : '');
  });
  return s + '</svg>';
}
