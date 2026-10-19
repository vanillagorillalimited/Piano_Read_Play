/* ============================================================
   The prompts for reading sheet music. Used by the app and by
   server/read-sheet.mjs, so both always ask the same way.
   Needs SHEET_PROMPT (from sheet-prompt.txt).
   ============================================================ */
const SheetPrompts = (() => {
  const VERSION = 2;
  const KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm'];
  const int = (v, lo, hi) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : null; };
  const time = t => /^(\d{1,2}\/\d{1,2}|C)$/.test(String(t)) ? String(t) : null;
  const key = k => KEYS.includes(String(k)) ? String(k) : null;
  // only notation characters get through, so nothing else can be slipped into a prompt
  const notes = s => String(s == null ? '' : s).replace(/[^a-zA-Z0-9#:.()~^@{}|=\s\/<>-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 300);

  function images(strips) {
    if (!strips) return 'The image is one page of the music.';
    return `The first image is the whole page, to show the title, key, time signature and layout. The next ${strips === 1 ? 'image is a close-up' : strips + ' images are close-ups'} of the lines of music on the page, top to bottom, at a higher resolution. Read the notes from the close-ups. The edge of a close-up may show a sliver of the line above or below it: ignore anything that isn't a whole line.`;
  }
  function context(hint) {
    if (!hint) return '';
    const page = int(hint.page, 2, 99), t = time(hint.time), k = key(hint.key), last = int(hint.lastBar, 0, 9999);
    if (!page) return '';
    let s = `\n\nThis is page ${page} of the piece.`;
    if (t && k) s += ` Page 1 was in ${t}, with the key signature of ${k}.`;
    if (last != null) s += ` The page before ended at bar ${last}, so if no bar number is printed, start this page at bar ${last + 1}.`;
    return s;
  }
  function read(o = {}) {
    return SHEET_PROMPT + '\n\nTHE IMAGES\n' + images(int(o.strips, 0, 20) || 0) + context(o.hint);
  }
  // A second look at the bars that didn't add up, with the first reading to work from.
  function fix(o = {}) {
    const grand = o.grand !== false, t = time(o.time) || '4/4', k = key(o.key) || 'C';
    const staff = s => s === 'lh' ? 'left hand (lower staff)' : s === 'rh' ? 'right hand (upper staff)' : 'music';
    const problems = (Array.isArray(o.problems) ? o.problems : []).slice(0, 24).map(p => {
      const n = int(p.n, 0, 9999);
      if (p.missing) return `- Bar ${n} is missing.`;
      if (p.unreadable) return `- Bar ${n}, ${staff(p.staff)}: couldn't be read in the notation.`;
      return `- Bar ${n}, ${staff(p.staff)}: adds up to ${int(p.have * 8, 0, 999) / 8} beats, but a bar of ${t} needs ${int(p.want * 8, 0, 999) / 8}.`;
    });
    const wanted = (Array.isArray(o.problems) ? o.problems : []).map(p => int(p.n, 0, 9999)).filter((n, i, a) => a.indexOf(n) === i).slice(0, 24);
    const bars = (Array.isArray(o.bars) ? o.bars : []).slice(0, 200).map(b => {
      const n = int(b.n, 0, 9999);
      return grand ? `${n}  rh: ${notes(b.rh)}  ||  lh: ${notes(b.lh)}` : `${n}  ${notes(b.music)}`;
    });
    const shape = grand ? '{"n": 62, "rh": "...", "lh": "..."}' : '{"n": 62, "music": "..."}';
    return SHEET_PROMPT + '\n\nTHE IMAGES\n' + images(int(o.strips, 0, 20) || 0) +
      `\n\nTHIS IS A SECOND LOOK.\nThis page has already been transcribed (below), in ${t} with the key signature of ${k}. Some bars don't add up, so something in them was misread. Find each of these bars on the page and read it again, carefully, staff by staff and beat by beat:\n${problems.join('\n')}\n\nThe transcription so far:\n${bars.join('\n')}\n\n` +
      `Reply with ONLY one JSON object: {"bars": [${shape}, ...]} with an entry for each of the bars ${wanted.join(', ')}, every staff written out again in full. Follow all the rules above, including writing only the accidentals that are printed.`;
  }
  return { VERSION, read, fix, notes };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = SheetPrompts;
