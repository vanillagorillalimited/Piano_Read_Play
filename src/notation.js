/* ============================================================
   Notation: a compact text format for music, rendered with VexFlow 4.

   Music text: bars separated by "|", tokens separated by spaces.
     c4:q        pitch + octave, then duration (w h q 8 16 32), "." dotted, "t" triplet
     f#4 bb3 en4 sharp / flat / natural spelt in the pitch (pitches are real pitches;
                 accidentals are shown or hidden automatically from the key signature)
     (c4 e4 g4):h chord          r:q  rest          duration may be left off (repeats the last)
     c4:h~       tie to the next note          c4:q^st  staccato (^ac accent, ^te tenuto,
                 ^fe fermata, ^ma marcato, ^tr trill, ^mo mordent, ^tu turn)
     c4:q{mf}    text under the note (dynamics, words)     c4:q@3  finger number above
     c4:q[Am]    chord symbol above the note (lead sheets)
     S( ... S)   slur around the notes between            P( ... P)  sustain pedal
     <( ... )<   crescendo hairpin   >( ... )>  diminuendo     8va( ... )8va  octave line
     RS / RE     repeat start / end barline     FIN  final barline     DBL  double barline
     clef=bass   clef change before the next note
   ============================================================ */
const VF = (typeof Vex !== 'undefined') ? Vex.Flow : null;
const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const LETTERS = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
const DUR_BEATS = { w: 4, h: 2, q: 1, '8': 0.5, '16': 0.25, '32': 0.125 };
const KEY_SIGS = {
  C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7,
  Am: 0, Em: 1, Bm: 2, 'F#m': 3, 'C#m': 4, 'G#m': 5, 'D#m': 6, 'A#m': 7, Dm: -1, Gm: -2, Cm: -3, Fm: -4, Bbm: -5, Ebm: -6, Abm: -7
};
const SHARP_ORDER = ['f', 'c', 'g', 'd', 'a', 'e', 'b'];
const FLAT_ORDER = ['b', 'e', 'a', 'd', 'g', 'c', 'f'];
function keyAlters(key) {
  const n = KEY_SIGS[key] || 0, out = {};
  if (n > 0) SHARP_ORDER.slice(0, n).forEach(l => out[l] = 1);
  if (n < 0) FLAT_ORDER.slice(0, -n).forEach(l => out[l] = -1);
  return out;
}
function parsePitch(p) {
  const m = /^([a-g])(##|#|bb|b|n)?(-?\d)$/.exec(p.trim().toLowerCase());
  if (!m) throw new Error('Bad pitch "' + p + '"');
  const acc = m[2] || '';
  const alter = acc === '#' ? 1 : acc === '##' ? 2 : acc === 'b' ? -1 : acc === 'bb' ? -2 : 0;
  const oct = +m[3];
  return { letter: m[1], oct, alter, natural: acc === 'n', midi: 12 * (oct + 1) + PC[m[1]] + alter, name: p };
}
function pitchLabel(p, withOct = true) {
  const x = typeof p === 'string' ? parsePitch(p) : p;
  const acc = { 1: '♯', 2: '𝄪', '-1': '♭', '-2': '𝄫' }[x.alter] || '';
  return x.letter.toUpperCase() + acc + (withOct ? x.oct : '');
}
function midiToPitch(midi, prefer = '#') {
  const pc = ((midi % 12) + 12) % 12, oct = Math.floor(midi / 12) - 1;
  const sharp = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
  const flat = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
  return (prefer === 'b' ? flat : sharp)[pc] + oct;
}

/* ---------------- Parsing ---------------- */
const TOKEN_RE = /^(w|h|q|8|16|32)?(\.)?(t)?(~)?((?:\^[a-z]{2})*)(?:\[([^\]]*)\])?(?:\{([^}]*)\})?(?:@(\d))?$/;
function parseBar(text, state) {
  const items = [], marks = { start: null, end: null, clefAt: [] };
  let pend = { slurStart: false, pedStart: false, hpStart: null, ottStart: false, clef: null };
  const tokens = text.trim() ? (text.trim().match(/\([^)]*\)\S*|\S+/g) || []) : [];
  for (const tok of tokens) {
    if (tok === 'RS') { marks.start = 'repeat'; continue; }
    if (tok === 'RE') { marks.end = 'repeat'; continue; }
    if (tok === 'FIN') { marks.end = 'end'; continue; }
    if (tok === 'DBL') { marks.end = 'double'; continue; }
    if (tok === 'S(') { pend.slurStart = true; continue; }
    if (tok === 'S)') { if (items.length) items[items.length - 1].slurEnd = true; else state.slurEndNext = true; continue; }
    if (tok === 'P(') { pend.pedStart = true; continue; }
    if (tok === 'P)') { if (items.length) items[items.length - 1].pedEnd = true; continue; }
    if (tok === '<(' || tok === '>(') { pend.hpStart = tok[0]; continue; }
    if (tok === ')<' || tok === ')>') { if (items.length) items[items.length - 1].hpEnd = true; continue; }
    if (tok === '8va(' || tok === '8vb(') { pend.ottStart = tok.slice(0, 3); continue; }
    if (tok === ')8va' || tok === ')8vb') { if (items.length) items[items.length - 1].ottEnd = true; continue; }
    if (tok.startsWith('clef=')) { pend.clef = tok.slice(5); continue; }
    const ci = tok.lastIndexOf(':');
    let head, tail;
    if (tok.startsWith('(')) { const close = tok.indexOf(')'); head = tok.slice(0, close + 1); tail = tok.slice(close + 1).replace(/^:/, ''); }
    else if (ci >= 0) { head = tok.slice(0, ci); tail = tok.slice(ci + 1); }
    else { const hm = /^(r|x|[a-g](?:##|#|bb|b|n)?-?\d)(.*)$/i.exec(tok); if (!hm) throw new Error('Bad token "' + tok + '"'); head = hm[1]; tail = hm[2]; }
    const m = TOKEN_RE.exec(tail);
    if (!m) throw new Error('Bad token "' + tok + '"');
    const dur = m[1] || state.lastDur || 'q';
    state.lastDur = dur;
    const item = {
      dur, dotted: !!m[2], triplet: !!m[3], tie: !!m[4],
      artic: (m[5] || '').split('^').filter(Boolean), sym: m[6] || null, text: m[7] || null, finger: m[8] || null,
      rest: head === 'r' || head === 'x', ghost: head === 'x', pitches: []
    };
    if (!item.rest) {
      const list = head.startsWith('(') ? head.slice(1, -1).trim().split(/\s+/) : [head];
      item.pitches = list.map(parsePitch);
    }
    let beats = DUR_BEATS[dur] * (item.dotted ? 1.5 : 1) * (item.triplet ? 2 / 3 : 1);
    item.beats = beats;
    Object.assign(item, { slurStart: pend.slurStart, pedStart: pend.pedStart, hpStart: pend.hpStart, ottStart: pend.ottStart, clefBefore: pend.clef });
    if (state.slurEndNext) { item.slurEnd = true; state.slurEndNext = false; }
    pend = { slurStart: false, pedStart: false, hpStart: null, ottStart: false, clef: null };
    items.push(item);
  }
  return { items, marks, beats: items.reduce((a, b) => a + b.beats, 0) };
}
function parseMusic(text) {
  const state = {};
  return text.split('|').map(b => parseBar(b, state)).filter((b, i, arr) => b.items.length || i < arr.length - 1 || b.marks.end);
}
function timeBeats(time) { if (time === 'C') return 4; const [n, d] = String(time).split('/').map(Number); return n && d ? n * 4 / d : 4; }

/* ---------------- Rendering ---------------- */
let uidSeq = 0;
const ARTIC = { st: 'a.', ac: 'a>', te: 'a-', fe: 'a@a', ma: 'a^' };
const ORN = { tr: 'tr', mo: 'mordent', tu: 'turn' };
const ACC_STR = { 1: '#', 2: '##', '-1': 'b', '-2': 'bb', 0: 'n' };

function minBarWidth(barA, barB) {
  const est = bar => !bar ? 0 : bar.items.reduce((w, it) => {
    const base = { w: 34, h: 30, q: 26, '8': 22, '16': 18, '32': 16 }[it.dur] || 24;
    const acc = it.pitches.some(p => p.alter || p.natural) ? 10 : 0;
    return w + base + acc + (it.dotted ? 6 : 0) + (it.text ? 6 : 0) + (it.sym ? 4 * it.sym.length : 0);
  }, 24);
  return Math.max(est(barA), est(barB), 70);
}

/* spec: { clef: 'treble'|'bass'|'grand'|'perc', key, time, music, rh, lh, showTime }
   opts: { width, scale, compact, ids } -> returns { events, svg, el } */
function renderScore(el, spec, opts = {}) {
  if (!VF) { el.innerHTML = '<p class="muted">Music notation could not load. Check your connection and reopen the app.</p>'; return { events: [] }; }
  el.innerHTML = '';
  const grand = spec.clef === 'grand';
  const key = spec.key || 'C';
  const time = spec.time || '4/4';
  const showTime = spec.showTime !== false && !spec.noTime;
  const staves = grand ? [{ hand: 'rh', clef: 'treble', bars: parseMusic(spec.rh || '') }, { hand: 'lh', clef: 'bass', bars: parseMusic(spec.lh || '') }]
    : [{ hand: 'single', clef: spec.clef || 'treble', bars: parseMusic(spec.music || '') }];
  if (opts.firstBarOnly) staves.forEach(s => { s.bars = s.bars.slice(0, 1); if (opts.maxItems && s.bars[0]) { s.bars[0].items = s.bars[0].items.slice(0, opts.maxItems); s.bars[0].marks = {}; } });
  const nBars = Math.max(...staves.map(s => s.bars.length));
  staves.forEach(s => { while (s.bars.length < nBars) s.bars.push({ items: [], marks: {}, beats: 0 }); });
  const scale = opts.scale || 1;
  const fullW = Math.max(opts.firstBarOnly ? 40 : 150, Math.floor((opts.width || el.clientWidth || 340) / scale));
  const left = grand ? 22 : 6, right = 6;
  const keyN = Math.abs(KEY_SIGS[key] || 0);
  const firstExtra = (opts.noClef ? 6 : (staves[0].clef === 'perc' ? 30 : 40)) + keyN * 11;
  const timeExtra = showTime ? 28 : 0;

  // lay bars out into lines
  const lines = []; let cur = [], used = 0;
  for (let i = 0; i < nBars; i++) {
    const w = minBarWidth(staves[0].bars[i], staves[1] && staves[1].bars[i]);
    const extra = cur.length === 0 ? firstExtra + (lines.length === 0 ? timeExtra : 0) : 0;
    const maxPerLine = opts.maxBarsPerLine || 99;
    if (cur.length && (used + w + extra > fullW - left - right || cur.length >= maxPerLine)) { lines.push(cur); cur = []; used = 0; i--; continue; }
    cur.push({ i, w, extra }); used += w + extra;
  }
  if (cur.length) lines.push(cur);

  const staffGap = grand ? 92 : 0;
  const topPad = opts.compact ? 18 : 28;
  const sysH = (grand ? 92 + 112 : 116) + (opts.compact ? -14 : 8) + (opts.extraGap || 0);
  const height = Math.ceil(lines.length * sysH + topPad + 8);
  const renderer = new VF.Renderer(el, VF.Renderer.Backends.SVG);
  renderer.resize(Math.round(fullW * scale), Math.round(height * scale));
  const ctx = renderer.getContext();
  ctx.scale(scale, scale);
  const svg = el.querySelector('svg');
  svg.setAttribute('class', 'score-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', opts.label || 'Music notation');

  const events = [];   // playback / highlight events
  const ties = [], slurs = [], peds = [], hairpins = [], otts = [];
  const open = { tie: {}, slur: {}, ped: {}, hp: {}, ott: {} };
  const keyAlt = keyAlters(key);
  const clefNow = {}; staves.forEach(s => clefNow[s.hand] = s.clef);
  const ottNow = {};
  let beatPos = 0;
  const tb = timeBeats(time);

  const lineTops = [];
  lines.forEach((line, li) => {
    const y = topPad + li * sysH - (opts.compact ? 10 : 0);
    lineTops.push(Math.max(0, (y - topPad + 4) * scale));
    const lineW = line.reduce((a, b) => a + b.w + b.extra, 0);
    const stretch = (fullW - left - right) / lineW;
    let x = left;
    const lineStaves = staves.map(() => []);
    line.forEach((b, bi) => {
      const w = (b.w + b.extra) * (li === lines.length - 1 && lineW < (fullW - left - right) * 0.6 ? Math.min(stretch, 1.6) : stretch);
      const vfStaves = staves.map((s, si) => {
        const st = new VF.Stave(x, y + si * staffGap, w);
        if (bi === 0) {
          if (!opts.noClef) { if (s.clef === 'perc') st.addClef('percussion'); else st.addClef(clefNow[s.hand]); }
          if (key !== 'C' && key !== 'Am' && s.clef !== 'perc') st.addKeySignature(key);
          if (li === 0 && showTime) st.addTimeSignature(time === 'C' ? 'C' : time);
        }
        const bar = s.bars[b.i];
        if (bar.marks.start === 'repeat') st.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
        if (bar.marks.end === 'repeat') st.setEndBarType(VF.Barline.type.REPEAT_END);
        else if (bar.marks.end === 'end') st.setEndBarType(VF.Barline.type.END);
        else if (bar.marks.end === 'double') st.setEndBarType(VF.Barline.type.DOUBLE);
        st.setContext(ctx);
        return st;
      });
      // align note start across the grand stave
      const nsx = Math.max(...vfStaves.map(s => s.getNoteStartX()));
      vfStaves.forEach(s => s.setNoteStartX(nsx));
      vfStaves.forEach(s => s.draw());
      if (grand) {
        if (bi === 0) {
          new VF.StaveConnector(vfStaves[0], vfStaves[1]).setType(VF.StaveConnector.type.BRACE).setContext(ctx).draw();
          new VF.StaveConnector(vfStaves[0], vfStaves[1]).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
        }
        const endType = staves[0].bars[b.i].marks.end === 'end' ? VF.StaveConnector.type.BOLD_DOUBLE_RIGHT : VF.StaveConnector.type.SINGLE_RIGHT;
        new VF.StaveConnector(vfStaves[0], vfStaves[1]).setType(endType).setContext(ctx).draw();
      }

      // notes per stave
      const voices = [], beamsAll = [], tuplets = [];
      const barStart = beatPos;
      let barLen = 0;
      staves.forEach((s, si) => {
        const bar = s.bars[b.i];
        const accState = {};
        const notes = [], myTrips = [];
        let pos = 0, trip = [];
        bar.items.forEach(it => {
          let clef = clefNow[s.hand];
          if (it.clefBefore) { clefNow[s.hand] = it.clefBefore; clef = it.clefBefore; notes.push(new VF.ClefNote(clef, 'small')); }
          const durStr = it.dur + (it.dotted ? 'd' : '') + (it.rest ? 'r' : '');
          let keys;
          if (it.ottStart) ottNow[s.hand] = it.ottStart === '8vb' ? 1 : -1;
          const shift = ottNow[s.hand] || 0;
          if (it.rest) keys = [s.clef === 'perc' ? 'b/4' : (clef === 'bass' ? 'd/3' : 'b/4')];
          else keys = it.pitches.map(p => p.letter + '/' + (p.oct + shift));
          const nOpts = { keys, duration: durStr, clef: s.clef === 'perc' ? 'percussion' : clef, auto_stem: true };
          if (s.clef === 'perc' && !it.rest) nOpts.keys = ['b/4'];
          if (it.ghost) {
            const gn = new VF.GhostNote({ duration: it.dur + (it.dotted ? 'd' : '') });
            notes.push(gn);
            events.push({ hand: s.hand, id: null, note: gn, start: barStart + pos, beats: it.beats, rest: true, ghost: true, midis: [], pitches: [], bar: b.i });
            pos += it.beats;
            return;
          }
          const note = new VF.StaveNote(nOpts);
          const id = 'n' + (++uidSeq);
          note.setAttribute('id', id);
          if (!it.rest && s.clef !== 'perc') {
            it.pitches.forEach((p, k) => {
              const slot = p.letter + (p.oct + shift);
              const expected = slot in accState ? accState[slot] : (keyAlt[p.letter] || 0);
              const look = opts.noteStyle ? opts.noteStyle(p) : null;   // e.g. picking out notes outside the key
              if (p.alter !== expected || p.natural) {
                const acc = new VF.Accidental(ACC_STR[p.alter]);
                if (look) acc.setStyle(look);
                note.addModifier(acc, k);
              }
              if (look) note.setKeyStyle(k, look);
              accState[slot] = p.alter;
            });
          }
          if (it.dotted) VF.Dot.buildAndAttach([note], { all: true });
          it.artic.forEach(a => {
            if (ARTIC[a]) note.addModifier(new VF.Articulation(ARTIC[a]).setPosition(a === 'fe' ? VF.Modifier.Position.ABOVE : VF.Modifier.Position.ABOVE), 0);
            if (ORN[a]) note.addModifier(new VF.Ornament(ORN[a]), 0);
          });
          if (it.text) {
            const ann = new VF.Annotation(it.text).setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
            ann.setFont('Times New Roman, serif', 13, 'bold', 'italic');
            note.addModifier(ann, 0);
          }
          if (it.sym) {
            const cs = new VF.Annotation(it.sym).setVerticalJustification(VF.Annotation.VerticalJustify.TOP);
            cs.setFont('Arial, sans-serif', 13, 'bold');
            note.addModifier(cs, 0);
          }
          if (it.finger) {
            const f = new VF.Annotation(it.finger).setVerticalJustification(VF.Annotation.VerticalJustify.TOP);
            f.setFont('Arial, sans-serif', 10, 'bold');
            note.addModifier(f, 0);
          }
          notes.push(note);
          if (it.triplet) { trip.push(note); if (trip.length === 3) { tuplets.push(trip); myTrips.push(trip); trip = []; } }
          // spanners
          const hand = s.hand;
          if (it.slurStart) open.slur[hand] = note;
          if (it.slurEnd && open.slur[hand]) { slurs.push([open.slur[hand], note]); open.slur[hand] = null; }
          if (it.pedStart) open.ped[hand] = [note];
          else if (open.ped[hand]) open.ped[hand].push(note);
          if (it.pedEnd && open.ped[hand]) { peds.push(open.ped[hand]); open.ped[hand] = null; }
          if (it.hpStart) open.hp[hand] = { from: note, type: it.hpStart };
          if (it.hpEnd && open.hp[hand]) { hairpins.push({ ...open.hp[hand], to: note }); open.hp[hand] = null; }
          if (it.ottStart) open.ott[hand] = { from: note, kind: it.ottStart };
          if (it.ottEnd && open.ott[hand]) { otts.push({ ...open.ott[hand], to: note }); open.ott[hand] = null; }
          if (it.ottEnd) ottNow[hand] = 0;
          if (open.tie[hand]) { ties.push({ from: open.tie[hand].note, to: note, n: Math.min(open.tie[hand].n, keys.length), line: open.tie[hand].line, line2: li }); }
          const tiedIn = !!open.tie[hand];
          open.tie[hand] = it.tie && !it.rest ? { note, n: keys.length, line: li } : null;
          events.push({
            hand, id, note, start: barStart + pos, beats: it.beats, rest: it.rest, tiedIn, tieOut: it.tie,
            midis: it.rest ? [] : it.pitches.map(p => p.midi), pitches: it.rest ? [] : it.pitches.map(p => p.name), bar: b.i, line: li
          });
          pos += it.beats;
        });
        barLen = Math.max(barLen, pos);
        const voice = new VF.Voice({ num_beats: Math.max(1, Math.round(tb * 4)), beat_value: 16 }).setMode(VF.Voice.Mode.SOFT);
        voice.addTickables(notes);
        voices.push({ voice, stave: vfStaves[si], notes: notes.filter(n => n instanceof VF.StaveNote) });
        const groups = time === '6/8' || time === '9/8' || time === '12/8' || time === '3/8' ? [new VF.Fraction(3, 8)] : [new VF.Fraction(2, 8)];
        const inTrip = new Set(myTrips.flat());
        const beamable = notes.filter(n => n instanceof VF.StaveNote && !inTrip.has(n));
        // beam each run of consecutive beamable notes separately so tuplets stay apart
        let run = [];
        const flush = () => { if (run.length > 1) beamsAll.push(...VF.Beam.generateBeams(run, { groups, beam_rests: false })); run = []; };
        notes.forEach(n => { if (n instanceof VF.StaveNote && !inTrip.has(n)) run.push(n); else flush(); });
        flush();
        myTrips.forEach(t => { if (t.every(n => ['8', '16', '32'].includes(n.getDuration()))) { try { beamsAll.push(new VF.Beam(t)); } catch (e) {} } });
      });
      const fmt = new VF.Formatter();
      voices.forEach(v => fmt.joinVoices([v.voice]));
      const avail = vfStaves[0].getNoteEndX() - nsx - 10;
      fmt.format(voices.map(v => v.voice), Math.max(20, avail));
      voices.forEach(v => v.voice.draw(ctx, v.stave));
      beamsAll.forEach(bm => bm.setContext(ctx).draw());
      tuplets.forEach(t => new VF.Tuplet(t).setContext(ctx).draw());
      beatPos += barLen > 0 ? barLen : tb;
      x += w;
      lineStaves.forEach((arr, si) => arr.push(vfStaves[si]));
    });
  });
  // spanners after all notes exist
  ties.forEach(t => {
    const idx = [...Array(t.n).keys()];
    try {
      if (t.line === t.line2) new VF.StaveTie({ first_note: t.from, last_note: t.to, first_indices: idx, last_indices: idx }).setContext(ctx).draw();
      else {
        new VF.StaveTie({ first_note: t.from, last_note: null, first_indices: idx, last_indices: idx }).setContext(ctx).draw();
        new VF.StaveTie({ first_note: null, last_note: t.to, first_indices: idx, last_indices: idx }).setContext(ctx).draw();
      }
    } catch (e) {}
  });
  slurs.forEach(([a, z]) => { try { new VF.Curve(a, z, { cps: [{ x: 0, y: 10 }, { x: 0, y: 10 }] }).setContext(ctx).draw(); } catch (e) {} });
  peds.forEach(arr => { try { const pm = VF.PedalMarking.createSustain(arr.length > 1 ? [arr[0], arr[arr.length - 1]] : [arr[0], arr[0]]); pm.setType(VF.PedalMarking.type.MIXED); pm.setContext(ctx).draw(); } catch (e) {} });
  hairpins.forEach(h => {
    try {
      const st = h.from.getStave(), x1 = h.from.getAbsoluteX() - 2, x2 = h.to.getAbsoluteX() + 14;
      const y = st.getYForLine(4) + 30, half = 5;
      const narrow = h.type === '<' ? x1 : x2, wide = h.type === '<' ? x2 : x1;
      ctx.beginPath(); ctx.moveTo(wide, y - half); ctx.lineTo(narrow, y); ctx.lineTo(wide, y + half); ctx.setLineWidth(1.2); ctx.stroke();
    } catch (e) {}
  });
  otts.forEach(o => { try { new VF.TextBracket({ start: o.from, stop: o.to, text: '8', superscript: o.kind === '8vb' ? 'vb' : 'va', position: o.kind === '8vb' ? VF.TextBracket.Position.BOTTOM : VF.TextBracket.Position.TOP }).setContext(ctx).draw(); } catch (e) {} });

  // tag each note's SVG group so the page can highlight it
  events.forEach(ev => { ev.el = ev.id ? svg.querySelector('#vf-' + ev.id) : null; });
  return { events, svg, el, lineTops };
}

function markEvent(ev, cls, on = true) { if (ev && ev.el) ev.el.classList.toggle(cls, on); }
function clearMarks(events, cls) { events.forEach(ev => ev.el && (cls ? ev.el.classList.remove(cls) : ev.el.classList.remove('hi', 'ok', 'bad', 'dim', 'late', 'early'))); }

/* Merge simultaneous notes from both hands into play steps (for playback and play-along) */
function playSteps(events, hands) {
  const map = new Map();
  events.forEach(ev => {
    if (ev.rest || ev.tiedIn) return;
    if (hands && !hands.includes(ev.hand)) return;
    const k = Math.round(ev.start * 1000);
    if (!map.has(k)) map.set(k, { start: ev.start, events: [], midis: [] });
    const st = map.get(k); st.events.push(ev); st.midis.push(...ev.midis);
  });
  return [...map.values()].sort((a, b) => a.start - b.start);
}
/* how long a note really sounds, following ties */
function soundingBeats(events, ev) {
  let total = ev.beats, i = events.indexOf(ev), cur = ev;
  while (cur.tieOut) {
    const next = events.slice(i + 1).find(e => e.hand === cur.hand);
    if (!next) break;
    total += next.beats; i = events.indexOf(next); cur = next;
  }
  return total;
}

/* Draw one SMuFL glyph (by name) into an element, centred */
function renderGlyph(el, name, opts = {}) {
  if (!VF) return;
  el.innerHTML = '';
  const w = opts.w || 64, h = opts.h || 64, pt = opts.size || 38;
  const r = new VF.Renderer(el, VF.Renderer.Backends.SVG); r.resize(w, h);
  const ctx = r.getContext();
  const g = new VF.Glyph(name, pt);
  const m = g.getMetrics();
  const gw = m.width || 0;
  const x = (w - gw) / 2 + (opts.dx || 0);
  const y = opts.y !== undefined ? opts.y : h * 0.62;
  g.render(ctx, x, y);
  const s = el.querySelector('svg'); s.setAttribute('class', 'score-svg'); s.setAttribute('aria-hidden', 'true');
}
