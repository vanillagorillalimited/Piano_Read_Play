/* ============================================================
   Piano: Read & Play: app shell, progress store, screens and practice tools
   ============================================================ */
(function () {
'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SYMBOL_BY_ID = Object.fromEntries(SYMBOLS.map(s => [s.id, s]));
const PIECE_BY_ID = Object.fromEntries(PIECES.map(p => [p.id, p]));
/* a built-in piece, or one of your own songs read from a photo */
function getPiece(id) {
  if (PIECE_BY_ID[id]) return PIECE_BY_ID[id];
  const s = Store.state && Store.state.songs && Store.state.songs[id];
  if (!s || s.deleted) return null;
  return Object.assign({ id, genre: 'My songs', level: null, about: '', mine: true }, s, { by: s.by || 'My song', title: s.title || 'Untitled song' });
}
function mySongs() { return Object.entries(Store.state.songs || {}).filter(([, s]) => !s.deleted).map(([id]) => getPiece(id)).sort((a, b) => (b.created || 0) - (a.created || 0)); }
const RHYTHM_BY_ID = Object.fromEntries(RHYTHMS.map(r => [r.id, r]));
const LEVEL_IDX = Object.fromEntries(LEVELS.map((l, i) => [l.id, i]));
const midiOf = p => parsePitch(p).midi;
const label = p => pitchLabel(p);

const svgI = (paths, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${paths}</svg>`;
const ICON = {
  back: svgI('<path d="M15 18l-6-6 6-6"/>'),
  play: svgI('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>'),
  stop: svgI('<rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor" stroke="none"/>'),
  learn: svgI('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5zM9 7.5h7M9 11h5"/>'),
  practise: svgI('<path d="M3 6h18M3 10h18M3 14h18M3 18h18"/><ellipse cx="9" cy="16" rx="2.6" ry="2" fill="currentColor" stroke="none" transform="rotate(-20 9 16)"/><path d="M11.4 15.2V5"/>'),
  pieces: svgI('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
  library: svgI('<rect x="3" y="4" width="18" height="15" rx="1.5"/><path d="M7 4v9M11 4v9M15 4v9M19 4v15M5.5 4v5.5h3V4M13.5 4v5.5h3V4"/>'),
  settings: svgI('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'),
  gear: svgI('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
  help: svgI('<circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.5-2.7 4"/><circle cx="12" cy="17.4" r=".6" fill="currentColor"/>'),
  close: svgI('<path d="M6 6l12 12M18 6L6 18"/>'),
  lock: svgI('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  check: svgI('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  star: svgI('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>'),
  starOn: svgI('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="currentColor"/>'),
  arrowR: svgI('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  arrowL: svgI('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  restart: svgI('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  ear: svgI('<path d="M6 8.5a6 6 0 1 1 12 0c0 3.5-3 4.5-3 7.5a3 3 0 0 1-6 0"/><path d="M9 9a3 3 0 0 1 6 0"/>'),
  bolt: svgI('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
  target: svgI('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>'),
  drum: svgI('<ellipse cx="12" cy="8" rx="8" ry="3"/><path d="M4 8v8c0 1.7 3.6 3 8 3s8-1.3 8-3V8M2 3l7 6M22 3l-7 6"/>'),
  key: svgI('<path d="M7 4v16M7 4c3 0 5 2 5 4.5S10 13 7 13M14 7l6 0M14 11l6 0M14 15l6 0"/>'),
  expand: svgI('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  shrink: svgI('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'),
  midi: svgI('<rect x="2.5" y="6" width="19" height="12" rx="1.5"/><path d="M7 6v7M12 6v7M17 6v7M5.5 6v4.5h3V6M15.5 6v4.5h3V6"/>'),
  upload: svgI('<path d="M12 16V4M7 9l5-5 5 5M5 15v4h14v-4"/>'),
  camera: svgI('<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
  mic: svgI('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>'),
  metro: svgI('<path d="M9.5 3h5L19 21H5z"/><path d="M12 17l5-10M8 13h8"/>')
};

/* ============================================================
   Installed-app (Capacitor) hooks
   ============================================================ */
const Cap = window.Capacitor;
const IS_NATIVE = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
function capPlugin(name) { try { return IS_NATIVE ? (Cap.registerPlugin ? Cap.registerPlugin(name) : Cap.Plugins[name]) : null; } catch (e) { return null; } }
const NativePrefs = capPlugin('Preferences');
const NativeApp = capPlugin('App');
const NativeStatusBar = capPlugin('StatusBar');
const NativeKeepAwake = capPlugin('KeepAwake');
// keep the screen on while someone is practising, and let it sleep elsewhere
let awake = false;
function nativeAwake(on) {
  if (!NativeKeepAwake || on === awake) return;
  awake = on; (on ? NativeKeepAwake.keepAwake() : NativeKeepAwake.allowSleep()).catch(() => {});
}

/* ============================================================
   Progress store. Every record carries `at` so copies from two
   devices can be merged record by record (latest wins). The
   adapter is the only part that touches storage, so an online
   adapter can replace it later.
   ============================================================ */
const STORAGE_KEY = 'read-music-piano:v1';
const LocalAdapter = {
  load() { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
  save(obj) {
    const text = JSON.stringify(obj);
    if (NativePrefs) NativePrefs.set({ key: STORAGE_KEY, value: text }).catch(() => {});
    try { localStorage.setItem(STORAGE_KEY, text); return true; } catch (e) { return !!NativePrefs; }
  }
};
async function loadNativeCopy() {
  if (!NativePrefs) return;
  try {
    const r = await NativePrefs.get({ key: STORAGE_KEY });
    if (!r || !r.value) return;
    let local = null; try { local = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) {}
    const nat = JSON.parse(r.value);
    if (!local || (nat.updatedAt || 0) >= (local.updatedAt || 0)) { try { localStorage.setItem(STORAGE_KEY, r.value); } catch (e) { LocalAdapter.load = () => nat; } }
  } catch (e) {}
}
function defaultState() {
  return {
    schema: 1, deviceId: 'd' + Math.random().toString(36).slice(2, 10),
    profile: null, lessons: {}, scores: {}, checks: {}, favourites: {}, practice: {},
    noteStats: {},   // 'treble|64' -> { n, ok, ms, at }
    pieces: {},      // id -> { stars, best, at }
    rhythms: {},     // id -> { best, at }
    songs: {},       // id -> your own music read from photos { title, clef, key, time, bpm, rh, lh | music, at }
    settings: {}, lastLesson: null, updatedAt: 0
  };
}
function mergeMap(a = {}, b = {}) {
  const out = Object.assign({}, a);
  Object.keys(b).forEach(k => { if (!out[k] || (b[k] && (b[k].at || 0) > (out[k].at || 0))) out[k] = b[k]; });
  return out;
}
function mergeStates(a, b) {
  const out = Object.assign(defaultState(), a);
  out.deviceId = a.deviceId || out.deviceId;
  out.profile = (!a.profile || (b.profile && b.profile.at > a.profile.at)) ? (b.profile || a.profile) : a.profile;
  ['lessons', 'scores', 'checks', 'favourites', 'settings', 'noteStats', 'pieces', 'rhythms', 'songs'].forEach(k => { out[k] = mergeMap(a[k], b[k]); });
  out.practice = Object.assign({}, a.practice);
  Object.keys(b.practice || {}).forEach(d => { out.practice[d] = Math.max(out.practice[d] || 0, b.practice[d]); });
  out.lastLesson = (!a.lastLesson || (b.lastLesson && b.lastLesson.at > a.lastLesson.at)) ? (b.lastLesson || a.lastLesson) : a.lastLesson;
  out.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
  return out;
}
const Store = {
  adapter: LocalAdapter, state: null, ok: true,
  init() { const l = this.adapter.load(); this.state = l && l.schema === 1 ? mergeStates(defaultState(), l) : defaultState(); },
  save() { this.state.updatedAt = Date.now(); clearTimeout(this._t); this._t = setTimeout(() => { this.ok = this.adapter.save(this.state); }, 150); },
  setting(k, def) { const r = this.state.settings[k]; return r ? r.v : def; },
  setSetting(k, v) { this.state.settings[k] = { v, at: Date.now() }; this.save(); },
  isDone(id) { const r = this.state.lessons[id]; return !!(r && r.s === 'done'); },
  setLesson(id, s) { this.state.lessons[id] = { s, at: Date.now() }; this.save(); },
  setProfile(level) { this.state.profile = { startLevel: level, at: Date.now() }; this.save(); },
  fav(kind, id) { const r = this.state.favourites[kind + ':' + id]; return !!(r && r.on); },
  toggleFav(kind, id) { const k = kind + ':' + id; this.state.favourites[k] = { on: !this.fav(kind, id), at: Date.now() }; this.save(); },
  best(key) { const r = this.state.scores[key]; return r ? r.best : null; },
  setBest(key, v) { const prev = this.best(key); const best = prev === null ? v : Math.max(prev, v); this.state.scores[key] = { best, last: v, at: Date.now() }; this.save(); return prev === null || v > prev; },
  check(key, i) { const r = this.state.checks[key]; return !!(r && r.items && r.items[i]); },
  setCheck(key, i, on) { const r = this.state.checks[key] || { items: {} }; this.state.checks[key] = { items: Object.assign({}, r.items, { [i]: on }), at: Date.now() }; this.save(); },
  addPractice(mins) { if (!(mins > 0.05)) return; const d = dayKey(new Date()); this.state.practice[d] = +(((this.state.practice[d] || 0) + mins).toFixed(2)); this.save(); },
  noteStat(clef, midi) { return this.state.noteStats[clef + '|' + midi] || null; },
  recordNote(clef, midi, ok, ms) {
    const k = clef + '|' + midi, r = this.state.noteStats[k] || { n: 0, ok: 0, ms: 0 };
    // keep a rolling window so recent improvement shows
    const n = Math.min(r.n, 19);
    const keep = r.n ? n / r.n : 0;
    this.state.noteStats[k] = { n: n + 1, ok: r.ok * keep + (ok ? 1 : 0), ms: r.ms * keep + Math.min(ms, 8000), at: Date.now() };
    this.save();
  },
  setPiece(id, stars, acc) { const r = this.state.pieces[id] || {}; this.state.pieces[id] = { stars: Math.max(r.stars || 0, stars), best: Math.max(r.best || 0, acc), at: Date.now() }; this.save(); },
  setRhythm(id, score) { const r = this.state.rhythms[id] || {}; const better = !r.best || score > r.best; this.state.rhythms[id] = { best: Math.max(r.best || 0, score), at: Date.now() }; this.save(); return better; },
  setLast(id) { this.state.lastLesson = { id, at: Date.now() }; this.save(); }
};
function dayKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function streak() {
  const s = new Set(Object.keys(Store.state.practice).filter(d => Store.state.practice[d] >= 0.5));
  Object.values(Store.state.lessons).forEach(r => { if (r.s === 'done') s.add(dayKey(new Date(r.at))); });
  const d = new Date(); let n = 0;
  if (!s.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (s.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function notesRead() { return Math.round(Object.values(Store.state.noteStats).reduce((a, r) => a + r.n, 0)); }
function accuracyAll() { let n = 0, ok = 0; Object.values(Store.state.noteStats).forEach(r => { n += r.n; ok += r.ok; }); return n ? Math.round(ok / n * 100) : null; }
function startIdx() { return Store.state.profile ? LEVEL_IDX[Store.state.profile.startLevel] || 0 : 0; }
function nextLesson() {
  const last = Store.state.lastLesson && LESSON_BY_ID[Store.state.lastLesson.id];
  if (last && !Store.isDone(last.id) && last.levelIndex >= startIdx()) return last;
  return ALL_LESSONS.find(l => l.levelIndex >= startIdx() && !Store.isDone(l.id)) || ALL_LESSONS.find(l => !Store.isDone(l.id)) || null;
}

/* ============================================================
   Routing and render cycle
   ============================================================ */
let route = { tab: 'learn', view: 'home', id: null };
const stack = [];
const ui = { learnLevel: null, libTab: 'notes', symCat: null, symQuery: '', importOpen: false, resetAsk: false, drillCfg: null, heatClef: 'treble', pieceLevel: null, paFull: false, paKb: null };
let renderSeq = 0, reg = [], mounts = [], kbs = [];

function go(r) { stopAll(); stack.push(route); route = r; render(); window.scrollTo(0, 0); }
function back() { stopAll(); route = stack.pop() || { tab: route.tab, view: 'home' }; render(); window.scrollTo(0, 0); }
function tabTo(tab) { stopAll(); stack.length = 0; route = { tab, view: 'home' }; render(); window.scrollTo(0, 0); }
function replaceRoute(r) { stopAll(); route = r; render(); window.scrollTo(0, 0); }
function stopAll() { Player.stop(); if (Metronome.running) Metronome.stop(); reg.forEach(r => r && r.cleanup && r.cleanup()); }

function topbar(title, right = '') {
  const backBtn = stack.length && route.view !== 'home' ? `<button class="icon-btn" data-act="back" aria-label="Back">${ICON.back}</button>` : '';
  return `<header class="topbar">${backBtn}<div class="title">${esc(title)}</div>${right}</header>`;
}
const settingsBtn = () => `<button class="icon-btn" data-act="open-settings" aria-label="Settings">${ICON.gear}</button>`;
const helpBtn = id => `<button class="icon-btn" data-act="tour" data-id="${id}" aria-label="Show me around this screen">${ICON.help}</button>`;
function navHTML() {
  const items = [['learn', 'Learn', ICON.learn], ['practise', 'Practise', ICON.practise], ['pieces', 'Pieces', ICON.pieces], ['library', 'Library', ICON.library]];
  return `<nav class="nav" aria-label="Sections"><div class="nav-inner">${items.map(([id, l, ic]) => `<button data-act="tab" data-tab="${id}" ${route.tab === id ? 'aria-current="page"' : ''}>${ic}<span>${l}</span></button>`).join('')}</div></nav>`;
}

function render() {
  reg.forEach(r => r && r.cleanup && r.cleanup());
  kbs.forEach(k => k.destroy()); kbs = [];
  renderSeq++; reg = []; mounts = [];
  const app = $('#app');
  let html;
  if (!Store.state.profile) {
    app.innerHTML = screenOnboarding(false);
    const n = $('.nav'); if (n) n.remove();
    return;
  }
  const v = route.view, t = route.tab;
  if (v !== 'piece' && ui.paFull) { ui.paFull = false; ui.paKb = null; try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch (e) {} }
  document.body.classList.toggle('pa-full', !!ui.paFull);
  document.body.classList.toggle('no-nav', v === 'piece');   // the music gets the room the tab bar would take
  if (v !== 'piece') ui.paSheet = false;
  nativeAwake(['piece', 'lesson', 'drill', 'rhythm', 'tech', 'intervals', 'keyquiz'].includes(v));
  if (v === 'settings') html = screenSettings();
  else if (v === 'premium') html = screenPremium();
  else if (v === 'level') html = screenOnboarding(true);
  else if (t === 'learn') html = v === 'lesson' ? screenLesson(route.id) : screenLearn();
  else if (t === 'practise') {
    if (v === 'drill') html = screenDrill();
    else if (v === 'rhythm') html = screenRhythm(route.id);
    else if (v === 'intervals') html = screenIntervals();
    else if (v === 'tech') html = screenTech();
    else if (v === 'keyquiz') html = screenKeyQuiz();
    else html = screenPractise();
  }
  else if (t === 'pieces') html = v === 'piece' ? screenPiece(route.id) : v === 'scan' ? screenScan() : v === 'song-edit' ? screenSongEdit(route.id) : screenPieces();
  else html = v === 'symbol' ? screenSymbol(route.id) : v === 'key' ? screenKey(route.id) : screenLibrary();
  app.innerHTML = html;
  const navMarkup = navHTML(), nav = $('.nav');
  if (nav) nav.outerHTML = navMarkup; else document.body.insertAdjacentHTML('beforeend', navMarkup);
  mounts.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  onScroll();
}
function mount(fn) { mounts.push(fn); }

let toastTimer;
function toast(msg) {
  let el = $('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

/* ============================================================
   Shared helpers: scores, playback, keyboards
   ============================================================ */
const playBtn = (act, i, lab = 'Play') => `<button class="play" data-act="${act}" data-b="${i}" aria-pressed="false" aria-label="${lab}">${ICON.play}</button>`;
function setPlayBtn(btn, on) { if (!btn) return; btn.setAttribute('aria-pressed', on); btn.innerHTML = on ? ICON.stop : ICON.play; btn.setAttribute('aria-label', on ? 'Stop' : 'Play'); }

/* schedule a rendered score; returns the builder for Player.play */
/* swung quavers: the off-beat quaver lands two-thirds of the way through the beat */
function swingBeat(b) { const w = Math.floor(b + 1e-6), f = b - w; return w + (f <= 0.5 ? f * 4 / 3 : 2 / 3 + (f - 0.5) * 2 / 3); }
function scoreBuilder(rendered, getBpm, opts = {}) {
  const evs = rendered.events;
  return (t0, sess) => {
    const spb = 60 / getBpm();
    const total = Math.max(0, ...evs.map(e => e.start + e.beats));
    const from = opts.from || 0, to = opts.to === undefined ? total : opts.to, sw = b => opts.swing ? swingBeat(b) : b;
    evs.forEach(ev => {
      if (ev.rest || ev.tiedIn) return;
      if (opts.hands && !opts.hands.includes(ev.hand)) return;
      if (ev.start < from - 1e-6 || ev.start >= to - 1e-6) return;
      const sb = Math.min(soundingBeats(evs, ev), to - ev.start);
      const t = t0 + (sw(ev.start) - sw(from)) * spb;
      const dur = (sw(ev.start + sb) - sw(ev.start)) * spb;
      ev.midis.forEach(m => Piano.note(m, t, { gain: ev.hand === 'lh' ? 0.62 : 0.78, dur: Math.max(0.15, dur * 0.96) }));
      if (ev.el) {
        Player.uiAt(sess, t, () => ev.el.classList.add('hi'));
        Player.uiAt(sess, t + dur - 0.03, () => ev.el.classList.remove('hi'));
      }
      if (opts.onNote) Player.uiAt(sess, t, () => opts.onNote(ev, true));
      if (opts.onNote) Player.uiAt(sess, t + dur - 0.03, () => opts.onNote(ev, false));
    });
    if (opts.click) for (let b = 0; b < Math.ceil(total); b++) Piano.click(t0 + b * spb, b % opts.click === 0);
    return Math.max(1, (sw(to) - sw(from))) * spb;
  };
}
function kbDefaults() { return { labels: Store.setting('kbLabels', 'c') }; }
function makeKeyboard(host, o) { const kb = createKeyboard(host, Object.assign(kbDefaults(), o)); kbs.push(kb); return kb; }
function rangeFor(pitches, pad = 2) {
  const ms = pitches.map(midiOf);
  let lo = Math.min(...ms) - pad, hi = Math.max(...ms) + pad;
  while (lo % 12 !== 0 && lo % 12 !== 5) lo--;   // start on a C or F
  while (hi % 12 !== 4 && hi % 12 !== 11) hi++;  // end on an E or B
  return [lo, hi];
}

/* ============================================================
   Content blocks (lessons and libraries)
   ============================================================ */
function renderBlock(b) { const i = reg.length; reg.push({ b, st: {} }); return blockHTML(i); }
function blockHTML(i) {
  const r = reg[i], b = r.b;
  switch (b.t) {
    case 'p': return `<p>${esc(b.x)}</p>`;
    case 'h': return `<h2 class="blk-h">${esc(b.x)}</h2>`;
    case 'steps': return `<ol class="steps">${b.x.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
    case 'list': return `<ul class="blist">${b.x.map(s => `<li>${esc(s)}</li>`).join('')}</ul>`;
    case 'tip': return `<div class="tip">${esc(b.x)}</div>`;
    case 'table': return `<div class="tbl-wrap"><table><thead><tr>${b.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(row => `<tr>${row.map((c, k) => k ? `<td>${esc(c)}</td>` : `<td><b>${esc(c)}</b></td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    case 'score': return blockScore(i);
    case 'keys': return blockKeys(i);
    case 'drill': return blockDrill(i);
    case 'rhythm': return blockRhythm(i);
    case 'piece': return blockPieceLink(i);
    case 'symbols': return blockSymbols(i);
    case 'keysig': return blockKeySig(i);
    case 'intervals': return blockIntervals(i);
    case 'play': return blockPlay(i);
    case 'hands': return blockHands(i);
    case 'checklist': return `<div class="list">${b.items.map((it, k) => `<label class="check"><input type="checkbox" data-change="check" data-key="${esc(b.key)}" data-k="${k}" ${Store.check(b.key, k) ? 'checked' : ''}><span>${esc(it)}</span></label>`).join('')}</div>`;
    default: return '';
  }
}

/* --- score with playback --- */
function blockScore(i) {
  const r = reg[i], b = r.b;
  r.st.bpm = r.st.bpm || b.bpm || 80;
  mount(() => {
    const el = $(`[data-score="${renderSeq}-${i}"]`); if (!el) return;
    r.st.rendered = renderScore(el, b.spec, { label: b.title });
  });
  return `<div class="media" data-b-root="${i}">
    <div class="media-head">${playBtn('score-play', i)}<div class="mt">${esc(b.title || 'Example')}</div>
      <div class="tempo" role="group" aria-label="Tempo"><button data-act="score-tempo" data-b="${i}" data-d="-8" aria-label="Slower">−</button><span data-tempo="${i}">${r.st.bpm} bpm</span><button data-act="score-tempo" data-b="${i}" data-d="8" aria-label="Faster">+</button></div></div>
    <div class="paper"><div class="score" data-score="${renderSeq}-${i}"></div></div></div>`;
}
function playScoreBlock(i) {
  const r = reg[i], key = 'score-' + renderSeq + '-' + i, btn = $(`[data-act="score-play"][data-b="${i}"]`);
  if (Player.key === key) { Player.stop(); return; }
  if (!r.st.rendered || !Piano.ensure()) return;
  Player.play(key, scoreBuilder(r.st.rendered, () => r.st.bpm, { swing: !!r.b.swing }), { onStop: () => { setPlayBtn(btn, false); clearMarks(r.st.rendered.events, 'hi'); } });
  setPlayBtn(btn, true);
}

/* --- keyboard picture --- */
function blockKeys(i) {
  const b = reg[i].b;
  mount(() => {
    const host = $(`[data-kb="${renderSeq}-${i}"]`); if (!host) return;
    const kb = makeKeyboard(host, { from: b.from, to: b.to, labels: b.labels || 'c', minKey: 24 });
    (b.mark || []).forEach(p => kb.mark(midiOf(p), 'sel'));
    if (b.fingers) Object.entries(b.fingers).forEach(([p, f]) => { kb.mark(midiOf(p), 'sel'); kb.label(midiOf(p), String(f)); });
    reg[i].st.kb = kb;
  });
  return `<div class="media" data-b-root="${i}"><div class="media-head"><div class="mt">${esc(b.title || 'Keyboard')}</div><button class="toggle" data-act="keys-play" data-b="${i}">Play marked keys</button></div>
    <div class="kb-host" data-kb="${renderSeq}-${i}"></div></div>`;
}

/* --- play-it-yourself exercise: the app waits for the right keys --- */
function blockPlay(i) {
  const r = reg[i], b = r.b;
  if (r.st.hint === undefined) r.st.hint = b.hint !== false;
  r.st.bpm = r.st.bpm || b.bpm || 72;
  mount(() => mountPlayBlock(i));
  const best = b.id ? Store.best('ex-' + b.id) : null;
  return `<div class="media play-ex" data-b-root="${i}">
    <div class="media-head">${playBtn('ex-listen', i, 'Listen')}<div class="mt">${esc(b.title || 'Your turn')}<span class="ex-tag">Play it${best !== null ? ' · best ' + best + '%' : ''}</span></div>
      <button class="toggle" data-act="ex-hint" data-b="${i}" aria-pressed="${r.st.hint}">Show keys</button>${micChip(true)}</div>
    <div class="paper"><div class="score" data-ex="${renderSeq}-${i}"></div></div>
    <div class="ex-status" data-ex-fb="${i}" aria-live="polite"></div>
    <div class="kb-host" data-ex-kb="${renderSeq}-${i}"></div></div>`;
}
function mountPlayBlock(i) {
  const r = reg[i], b = r.b, el = $(`[data-ex="${renderSeq}-${i}"]`), host = $(`[data-ex-kb="${renderSeq}-${i}"]`);
  if (!el || !host) return;
  r.st.rendered = renderScore(el, b.spec, { label: b.title });
  r.st.steps = playSteps(r.st.rendered.events, null);
  const all = r.st.rendered.events.filter(e => !e.rest).flatMap(e => e.midis);
  let lo = Math.min(...all) - 2, hi = Math.max(...all) + 2;
  while (lo % 12 !== 0 && lo % 12 !== 5) lo--; while (hi % 12 !== 4 && hi % 12 !== 11) hi++;
  r.st.kb = makeKeyboard(host, { from: lo, to: hi, minKey: 26, onPress: m => exPress(i, m) });
  exReset(i);
}
function exReset(i) {
  const st = reg[i].st;
  Object.assign(st, { idx: 0, errors: 0, pressed: new Set(), done: false, started: 0 });
  clearMarks(st.rendered.events);
  exStatus(i, `<span class="muted">Play the highlighted ${st.steps.some(s => s.midis.length > 1) ? 'notes (press chords together)' : 'notes'}. The app waits for you, so take your time.</span>`);
  exShow(i);
}
function exStatus(i, html) { const f = $(`[data-ex-fb="${i}"]`); if (f) f.innerHTML = html; }
function exShow(i) {
  const st = reg[i].st;
  clearMarks(st.rendered.events, 'hi'); st.kb.clear('target');
  const s = st.steps[st.idx]; if (!s) return;
  s.events.forEach(ev => ev.el && ev.el.classList.add('hi'));
  if (st.hint) s.midis.forEach(m => st.kb.mark(m, 'target'));
  const left = s.midis.filter(m => !st.pressed.has(m)).sort((a, b) => a - b);
  if (left.length) { st.kb.ensureVisible(left[left.length - 1]); st.kb.ensureVisible(left[0]); }
}
function exPress(i, m) {
  const r = reg[i]; if (!r || !r.st.steps) return;
  const st = r.st, s = st.steps[st.idx];
  if (st.done || !s) return;
  if (!st.started) st.started = Date.now();
  if (s.midis.includes(m)) {
    st.pressed.add(m); st.kb.flash(m, 'ok', 300);
    if (s.midis.every(x => st.pressed.has(x))) {
      s.events.forEach(ev => ev.el && ev.el.classList.add(ev.missed ? 'late' : 'ok'));
      st.idx++; st.pressed = new Set();
      if (st.idx >= st.steps.length) return exFinish(i);
    }
    exShow(i);
  } else {
    st.errors++; s.events.forEach(ev => ev.missed = true);
    st.kb.flash(m, 'bad', 450);
    exStatus(i, `<span class="bad">Not that one.</span> <span class="muted">You need ${s.events.map(e => e.pitches.map(label).join(' + ')).join(' and ')}.</span>`);
  }
}
function exFinish(i) {
  const r = reg[i], st = r.st, n = st.steps.length;
  st.done = true; st.kb.clear('target'); clearMarks(st.rendered.events, 'hi');
  const acc = Math.max(0, Math.round((n - st.errors) / n * 100));
  if (r.b.id) Store.setBest('ex-' + r.b.id, acc);
  Store.addPractice((Date.now() - (st.started || Date.now())) / 60000);
  exStatus(i, `<span class="good">${ICON.check} Done</span> <span class="muted">${acc}% right first time${st.errors ? ' · ' + st.errors + ' wrong key' + (st.errors === 1 ? '' : 's') : ''}.</span> <button class="btn small" data-act="ex-again" data-b="${i}">Again</button>`);
}
function exListen(i) {
  const r = reg[i], key = 'ex-' + renderSeq + '-' + i, btn = $(`[data-act="ex-listen"][data-b="${i}"]`);
  if (Player.key === key) { Player.stop(); return; }
  if (!r.st.rendered || !Piano.ensure()) return;
  Player.play(key, scoreBuilder(r.st.rendered, () => r.st.bpm, { swing: !!r.b.swing, onNote: (ev, on) => ev.midis.forEach(m => r.st.kb && r.st.kb.mark(m, 'lit', on)) }), { onStop: () => { setPlayBtn(btn, false); r.st.kb && r.st.kb.clear('lit'); exShow(i); } });
  setPlayBtn(btn, true);
}

/* --- hands with finger numbers --- */
function handSVG(side) {
  // drawn palm-down, as you see your own hands on the keys; side 'r' or 'l'
  const fingers = [[58, 21, 74], [82, 22, 86], [107, 21, 78], [130, 19, 60]]; // index to little: x, width, length (right hand)
  const flip = x => side === 'r' ? x : 200 - x;
  const tx = flip(68), ang = side === 'r' ? -42 : 42, rad = ang * Math.PI / 180;
  let shapes = `<rect x="${tx - 12}" y="96" width="24" height="76" rx="12" class="finger" transform="rotate(${ang} ${tx} 160)"/>`;
  const nums = [[tx + 50 * Math.sin(rad), 160 - 50 * Math.cos(rad), 1]];
  fingers.forEach(([x, w, len], k) => {
    const cx = flip(x + w / 2), top = 112 - len;
    shapes += `<rect x="${cx - w / 2}" y="${top}" width="${w}" height="${len + 20}" rx="${w / 2}" class="finger"/>`;
    nums.push([cx, top + 13, k + 2]);
  });
  shapes += `<rect x="${side === 'r' ? 52 : 48}" y="104" width="100" height="78" rx="34" class="palm"/>`;
  return shapes + nums.map(([x, y, n]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" class="fnum"/><text x="${x.toFixed(1)}" y="${(y + 4.5).toFixed(1)}" text-anchor="middle" class="fnum-t">${n}</text>`).join('');
}
function blockHands(i) {
  const b = reg[i].b;
  return `<figure class="hands-fig"><svg viewBox="0 0 420 200" role="img" aria-label="Finger numbers: thumbs are 1, little fingers are 5, on both hands">
    <g transform="translate(0 4)">${handSVG('l')}</g><g transform="translate(220 4)">${handSVG('r')}</g>
    <text x="100" y="198" text-anchor="middle" class="hand-cap">Left hand</text><text x="320" y="198" text-anchor="middle" class="hand-cap">Right hand</text></svg>
    ${b.caption ? `<figcaption class="muted small">${esc(b.caption)}</figcaption>` : ''}</figure>`;
}

/* --- symbols strip --- */
function symbolThumb(s, size = 64) {
  return `<span class="sym-art" data-sym="${s.id}" data-size="${size}" style="width:${size}px;height:${size}px"></span>`;
}
function mountSymbolArt(root = document) {
  $$('.sym-art[data-sym]', root).forEach(el => {
    if (el.dataset.done) return; el.dataset.done = '1';
    const s = SYMBOL_BY_ID[el.dataset.sym]; const size = +el.dataset.size || 64;
    if (s.glyph) renderGlyphs(el, s.glyph, { w: size, h: size, size: s.size ? s.size * size / 64 : 38 * size / 64, y: (s.y || 0.62) * size, stack: s.stack });
    else if (s.text) el.innerHTML = `<span class="sym-text" style="font-size:${Math.round(size * (s.text.length > 6 ? 0.2 : 0.28))}px">${esc(s.text)}</span>`;
    else if (s.ex) {
      // thumbnail: the first bar of the example, without clef, scaled to fit
      const ex = Object.assign({}, s.ex, { noTime: true });
      el.classList.add('sym-mini');
      const grand = ex.clef === 'grand';
      const items = s.cat === 'Notes' ? ({ quaver: 2, semiquaver: 4, triplet: 3, 'dotted-note': 1, tie: 2, chord: 1 }[s.id] || 1) : 4;
      const vw = grand ? 110 : (items <= 1 ? 64 : items <= 2 ? 80 : 110);
      renderScore(el, ex, { width: size, scale: size / vw, compact: true, firstBarOnly: true, maxItems: grand ? 0 : items, noClef: !grand && ex.clef !== 'bass' });
    }
  });
}
function renderGlyphs(el, names, o) {
  if (!VF) return;
  el.innerHTML = '';
  const r = new VF.Renderer(el, VF.Renderer.Backends.SVG); r.resize(o.w, o.h);
  const ctx = r.getContext();
  const glyphs = names.map(n => new VF.Glyph(n, o.size));
  if (o.stack) {
    glyphs.forEach((g, k) => { const w = g.getMetrics().width; g.render(ctx, (o.w - w) / 2, o.h * (k === 0 ? 0.47 : 0.8)); });
  } else {
    const widths = glyphs.map(g => g.getMetrics().width || o.size * 0.4);
    const total = widths.reduce((a, b) => a + b, 0) + (glyphs.length - 1) * 1;
    let x = (o.w - total) / 2;
    glyphs.forEach((g, k) => { g.render(ctx, x, o.y); x += widths[k] + 1; });
  }
  const s = el.querySelector('svg'); s.setAttribute('class', 'score-svg'); s.setAttribute('aria-hidden', 'true');
}
function blockSymbols(i) {
  const b = reg[i].b;
  mount(() => mountSymbolArt($(`[data-b-root="${i}"]`)));
  return `<div class="sym-grid" data-b-root="${i}">${b.ids.map(id => { const s = SYMBOL_BY_ID[id]; return s ? `<button class="sym-card" data-act="open-symbol" data-id="${s.id}">${symbolThumb(s, 56)}<span class="sym-name">${esc(s.name)}</span>${s.aka ? `<span class="sym-aka">${esc(s.aka)}</span>` : ''}</button>` : ''; }).join('')}</div>`;
}

/* --- key signatures strip --- */
function blockKeySig(i) {
  const b = reg[i].b;
  mount(() => b.keys.forEach((k, j) => { const el = $(`[data-ks="${renderSeq}-${i}-${j}"]`); if (el) renderScore(el, { clef: 'grand', key: k, noTime: true, rh: 'x:w', lh: 'x:w' }, { width: 150, compact: true }); }));
  return `<div class="ks-grid" data-b-root="${i}">${b.keys.map((k, j) => `<button class="ks-card" data-act="open-key" data-id="${k}"><div class="paper ks-paper"><div data-ks="${renderSeq}-${i}-${j}"></div></div><b>${esc(keyName(k))}</b><span>${esc(keyName(RELATIVE_MINOR[k]))}</span></button>`).join('')}</div>`;
}

/* --- link to a piece --- */
function blockPieceLink(i) {
  const p = PIECE_BY_ID[reg[i].b.id]; if (!p) return '';
  const st = Store.state.pieces[p.id];
  return `<button class="link-card" data-act="open-piece" data-id="${p.id}"><span><span class="eyebrow">Play along · ${esc(PIECE_LEVELS[p.level - 1].name)}</span><b>${esc(p.title)}</b><span class="muted">${esc(p.by)}${st ? ' · ' + starsText(st.stars) : ''}</span></span>${ICON.arrowR}</button>`;
}
const starsText = n => '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n);

/* ============================================================
   Note drill engine (inline blocks and the Practise screen)
   ============================================================ */
const NO_SPELL = new Set(['e#', 'b#', 'cb', 'fb']);
function poolList(pool) { return Array.isArray(pool) ? pool : POOLS[pool] || []; }
function makeQuestionSource(cfg) {
  // returns candidate {clef, pitch}
  const cands = [];
  const addPool = (clef, pool) => poolList(pool).forEach(p => {
    cands.push({ clef, pitch: p });
    if (cfg.accidentals) {
      const L = p[0], o = p.slice(-1);
      ['#', 'b'].forEach(a => { if (!NO_SPELL.has(L + a)) cands.push({ clef, pitch: L + a + o }); });
    }
  });
  if (cfg.pool && typeof cfg.pool === 'object' && !Array.isArray(cfg.pool)) Object.entries(cfg.pool).forEach(([c, p]) => addPool(c, p));
  else addPool(cfg.clef === 'grand' ? 'treble' : cfg.clef, cfg.pool);
  return cands;
}
function pickQuestion(cands, prev, adaptive) {
  const w = cands.map(c => {
    if (prev && c.pitch === prev.pitch && c.clef === prev.clef) return 0;
    if (!adaptive) return 1;
    const s = Store.noteStat(c.clef, midiOf(c.pitch));
    if (!s || s.n < 2) return 2.2;
    const err = 1 - s.ok / s.n, avg = s.ms / s.n;
    return 0.6 + err * 5 + Math.min(2.5, avg / 2200);
  });
  let total = w.reduce((a, b) => a + b, 0), r = Math.random() * total;
  for (let k = 0; k < cands.length; k++) { r -= w[k]; if (r <= 0) return cands[k]; }
  return cands[cands.length - 1];
}
function newDrill(cfg) {
  return { cfg, cands: makeQuestionSource(cfg), i: 0, ok: 0, bad: 0, streak: 0, bestStreak: 0, q: null, qStart: 0, misses: [], times: [], done: false, startedAt: Date.now(), locked: false };
}
function drillNext(d) {
  d.q = pickQuestion(d.cands, d.q, d.cfg.adaptive !== false);
  d.qStart = performance.now(); d.locked = false; d.tries = 0;
}
function drillAnswer(d, val) {
  if (d.locked || d.done) return null;
  const q = d.q, qm = midiOf(q.pitch);
  let ok;
  if (d.cfg.mode === 'keys') ok = d.cfg.anyOctave ? ((val - qm) % 12 === 0) : val === qm;
  else ok = ((val - qm) % 12 + 12) % 12 === 0;
  const ms = performance.now() - d.qStart;
  if (d.tries === 0) {
    Store.recordNote(q.clef, qm, ok, ms);
    if (ok) { d.ok++; d.streak++; d.bestStreak = Math.max(d.bestStreak, d.streak); d.times.push(ms); }
    else { d.bad++; d.streak = 0; d.misses.push(q); }
  }
  d.tries++;
  if (ok) { d.i++; d.locked = true; }
  return { ok, q, qm, ms, wrongOctave: !ok && d.cfg.mode === 'keys' && (val - qm) % 12 === 0 };
}

/* inline drill block */
function blockDrill(i) {
  const r = reg[i], b = r.b;
  if (!r.st.d) r.st.d = null;
  return `<div class="media drill-block" data-b-root="${i}">${drillBlockInner(i)}</div>`;
}
function drillBlockInner(i) {
  const r = reg[i], b = r.b, d = r.st.d;
  const mode = b.mode === 'keys' ? 'Play the note on the keyboard' : 'Name the note';
  if (!d) return `<div class="media-head"><div class="mt">${esc(b.title || 'Note drill')}</div></div>
      <div class="drill-intro"><p class="muted">${b.n} notes · ${mode}</p><button class="btn primary" data-act="drill-start" data-b="${i}">${ICON.target} Start</button></div>`;
  if (d.done) return drillSummaryHTML(d, `data-act="drill-start" data-b="${i}"`);
  return drillLiveHTML(d, `drill-${renderSeq}-${i}`, b.n);
}
function drillLiveHTML(d, id, total) {
  const prog = total ? `${Math.min(d.i + 1, total)} / ${total}` : `${d.ok} correct`;
  return `<div class="drill-live">
    <div class="drill-top"><span class="pill">${prog}</span><span class="pill" data-streak>Streak ${d.streak}</span>${d.cfg.seconds ? `<span class="pill timer" data-left>${Math.max(0, Math.ceil(d.cfg.seconds - (Date.now() - d.startedAt) / 1000))}s</span>` : ''}</div>
    <div class="paper drill-paper"><div class="score" data-drill-score="${id}"></div></div>
    <div class="feedback" aria-live="polite" data-fb></div>
    ${d.cfg.mode === 'keys' ? `<div class="kb-host" data-drill-kb="${id}"></div>` : lettersHTML(d)}
  </div>`;
}
function lettersHTML(d) {
  const list = d.cfg.accidentals
    ? [[0, 'C'], [1, 'C♯ D♭'], [2, 'D'], [3, 'D♯ E♭'], [4, 'E'], [5, 'F'], [6, 'F♯ G♭'], [7, 'G'], [8, 'G♯ A♭'], [9, 'A'], [10, 'A♯ B♭'], [11, 'B']]
    : [[0, 'C'], [2, 'D'], [4, 'E'], [5, 'F'], [7, 'G'], [9, 'A'], [11, 'B']];
  return `<div class="letters ${d.cfg.accidentals ? 'twelve' : ''}">${list.map(([pc, n]) => `<button class="letter" data-act="drill-letter" data-pc="${pc}">${n}</button>`).join('')}</div>`;
}
function drillSummaryHTML(d, againAttrs) {
  const total = d.ok + d.bad, acc = total ? Math.round(d.ok / total * 100) : 0;
  const avg = d.times.length ? (d.times.reduce((a, b) => a + b, 0) / d.times.length / 1000).toFixed(1) + 's' : '–';
  const missed = [...new Set(d.misses.map(q => label(q.pitch)))];
  return `<div class="drill-sum">
    <div class="sum-big"><b>${acc}%</b><span>${d.ok} of ${total} right first time</span></div>
    <div class="stats three"><div class="stat"><b>${avg}</b><span>average</span></div><div class="stat"><b>${d.bestStreak}</b><span>best streak</span></div><div class="stat"><b>${missed.length}</b><span>notes missed</span></div></div>
    ${missed.length ? `<p class="muted">Missed: ${missed.map(esc).join(', ')}</p>` : '<p class="muted">No misses. Nice reading.</p>'}
    <div class="row"><button class="btn primary" ${againAttrs}>${ICON.restart} Go again</button></div></div>`;
}
/* mount the live parts of a drill into a container */
function mountDrill(d, id, onDone, root) {
  const scoreEl = $(`[data-drill-score="${id}"]`, root); if (!scoreEl) return;
  const q = d.q, spec = d.cfg.clef === 'grand' || (d.cfg.pool && typeof d.cfg.pool === 'object' && !Array.isArray(d.cfg.pool))
    ? { clef: 'grand', noTime: true, key: d.cfg.key, rh: q.clef === 'treble' ? q.pitch + ':w' : 'x:w', lh: q.clef === 'bass' ? q.pitch + ':w' : 'x:w' }
    : { clef: q.clef, noTime: true, key: d.cfg.key, music: q.pitch + ':w' };
  const dw = Math.min(260, scoreEl.clientWidth || 260);
  renderScore(scoreEl, spec, { width: dw, scale: 1.35, label: 'Which note is this?' });
  const kbHost = $(`[data-drill-kb="${id}"]`, root);
  const handle = val => {
    const res = drillAnswer(d, val); if (!res) return;
    const fb = $('[data-fb]', root);
    const kb = d.kb;
    if (res.ok) {
      fb.innerHTML = `<span class="good">${esc(label(q.pitch))}</span>`;
      if (d.cfg.mode !== 'keys') Piano.note(res.qm, undefined, { dur: 0.9 });
      if (kb) kb.flash(res.qm, 'ok', 600);
      const ev = scoreEl.querySelector('.vf-stavenote'); if (ev) ev.classList.add('ok');
      const s = $('[data-streak]', root); if (s) s.textContent = 'Streak ' + d.streak;
      setTimeout(() => onDone(), d.tries > 1 ? 650 : 380);
    } else {
      fb.innerHTML = `<span class="bad">${res.wrongOctave ? 'Right letter, wrong octave' : 'Not that one'}</span>`;
      if (kb) kb.flash(val, 'bad', 500);
      else { const btn = $(`.letter[data-pc="${((val % 12) + 12) % 12}"]`, root); if (btn) { btn.classList.add('bad'); setTimeout(() => btn.classList.remove('bad'), 500); } }
      if (d.tries >= 2 && kb) { kb.flash(res.qm, 'target', 1200); }
      if (d.tries >= 2 && !kb) fb.innerHTML += ` <span class="muted">It is ${esc(label(q.pitch))}</span>`;
    }
  };
  d.handle = handle;
  if (kbHost) {
    const pitches = d.cands.filter(c => c.clef === q.clef).map(c => c.pitch);
    const [lo, hi] = rangeFor(pitches, 1);
    d.kb = makeKeyboard(kbHost, { from: lo, to: hi, labels: Store.setting('kbLabels', 'c') === 'all' ? 'c' : Store.setting('kbLabels', 'c'), minKey: 19, onPress: m => handle(m) });
  } else d.kb = null;
}
function startBlockDrill(i) {
  const r = reg[i], b = r.b;
  Piano.ensure();
  r.st.d = newDrill({ clef: b.clef, pool: b.pool, mode: b.mode || 'letters', accidentals: !!b.accidentals, key: b.key });
  drillNext(r.st.d);
  refreshDrillBlock(i);
}
function refreshDrillBlock(i) {
  const r = reg[i], root = $(`[data-b-root="${i}"]`); if (!root) return;
  if (r.st.d && r.st.d.kb) { r.st.d.kb.destroy(); r.st.d.kb = null; }
  root.innerHTML = drillBlockInner(i);
  const d = r.st.d;
  if (d && !d.done) mountDrill(d, `drill-${renderSeq}-${i}`, () => {
    if (d.i >= r.b.n) { d.done = true; Store.addPractice((Date.now() - d.startedAt) / 60000); }
    else drillNext(d);
    refreshDrillBlock(i);
  }, root);
}

/* ============================================================
   Interval quiz (block and screen)
   ============================================================ */
const INTERVAL_NAMES = ['', 'Unison', '2nd', '3rd', '4th', '5th', '6th', '7th', 'Octave'];
function newIntervalQ(clef, max) {
  const base = clef === 'bass' ? ['g2', 'a2', 'b2', 'c3', 'd3', 'e3', 'f3'] : ['e4', 'f4', 'g4', 'a4', 'b4', 'c5', 'd5'];
  const p1 = parsePitch(base[Math.floor(Math.random() * base.length)]);
  const size = 2 + Math.floor(Math.random() * (max - 1));
  const li = LETTERS.indexOf(p1.letter) + size - 1;
  const p2 = LETTERS[li % 7] + (p1.oct + Math.floor(li / 7));
  const up = Math.random() < 0.75;
  return { clef, a: up ? p1.name : p2, b: up ? p2 : p1.name, size };
}
function blockIntervals(i) {
  const r = reg[i], b = r.b;
  if (!r.st.q) { r.st.q = newIntervalQ(b.clef || 'treble', b.max || 8); r.st.n = 0; r.st.ok = 0; }
  mount(() => mountInterval(i));
  return `<div class="media" data-b-root="${i}">${intervalInner(i)}</div>`;
}
function intervalInner(i) {
  const r = reg[i], b = r.b;
  const sizes = []; for (let k = 2; k <= (b.max || 8); k++) sizes.push(k);
  return `<div class="media-head"><button class="play" data-act="int-play" data-b="${i}" aria-label="Hear it">${ICON.play}</button><div class="mt">Interval quiz</div><span class="pill">${r.st.ok} / ${r.st.n}</span></div>
    <div class="paper drill-paper"><div class="score" data-int="${renderSeq}-${i}"></div></div>
    <div class="feedback" data-fb aria-live="polite">${r.st.fb || 'Count the letters from the lower note to the higher one, including both.'}</div>
    <div class="letters">${sizes.map(k => `<button class="letter" data-act="int-answer" data-b="${i}" data-v="${k}">${INTERVAL_NAMES[k]}</button>`).join('')}</div>`;
}
function mountInterval(i) {
  const r = reg[i], el = $(`[data-int="${renderSeq}-${i}"]`); if (!el) return;
  renderScore(el, { clef: r.st.q.clef, noTime: true, music: r.st.q.a + ':h ' + r.st.q.b + ':h' }, { width: Math.min(260, el.clientWidth || 260) });
}

/* ============================================================
   Rhythm reading: listen, then tap along
   ============================================================ */
function blockRhythm(i) {
  const r = reg[i], ex = RHYTHM_BY_ID[r.b.id]; if (!ex) return '';
  r.st.ex = ex; r.st.bpm = r.st.bpm || ex.bpm;
  mount(() => mountRhythm(i));
  return `<div class="media rhythm" data-b-root="${i}">${rhythmInner(i)}</div>`;
}
function rhythmInner(i) {
  const r = reg[i], ex = r.st.ex, best = Store.state.rhythms[ex.id];
  return `<div class="media-head"><div class="mt">${esc(ex.title)}<span class="muted" style="font-weight:500"> · ${ex.time}${best ? ' · best ' + best.best + '%' : ''}</span></div>
      <div class="tempo" role="group" aria-label="Tempo"><button data-act="rh-tempo" data-b="${i}" data-d="-6" aria-label="Slower">−</button><span data-tempo="${i}">${r.st.bpm} bpm</span><button data-act="rh-tempo" data-b="${i}" data-d="6" aria-label="Faster">+</button></div></div>
    <div class="paper"><div class="score" data-rh="${renderSeq}-${i}"></div></div>
    <p class="count-hint">${esc(ex.count || '')}</p>
    <div class="rh-controls">
      <button class="btn" data-act="rh-listen" data-b="${i}">${ICON.ear} Listen</button>
      <button class="btn primary" data-act="rh-go" data-b="${i}">${ICON.drum} Tap along</button>
    </div>
    <button class="tap-pad" data-act="rh-tap" data-b="${i}" aria-label="Tap the rhythm here" hidden>Tap</button>
    <div class="feedback" data-fb aria-live="polite">${esc(r.st.fb || '')}</div>`;
}
function mountRhythm(i) {
  const r = reg[i], el = $(`[data-rh="${renderSeq}-${i}"]`); if (!el) return;
  r.st.rendered = renderScore(el, { clef: 'perc', time: r.st.ex.time, music: rhythmMusic(r.st.ex.r) }, { label: r.st.ex.title });
}
function rhythmListen(i) {
  const r = reg[i], key = 'rh-' + renderSeq + '-' + i;
  if (Player.key === key) { Player.stop(); return; }
  if (!r.st.rendered || !Piano.ensure()) return;
  const evs = r.st.rendered.events, beatsPerBar = timeBeats(r.st.ex.time);
  Player.play(key, (t0, sess) => {
    const spb = 60 / r.st.bpm, unitBeat = r.st.ex.time.endsWith('/8') ? 0.5 : 1;
    const total = Math.max(...evs.map(e => e.start + e.beats));
    for (let b = 0; b < total / unitBeat - 0.001; b++) Piano.click(t0 + b * unitBeat * spb, (b * unitBeat) % beatsPerBar === 0);
    evs.forEach(ev => {
      if (ev.rest || ev.tiedIn) return;
      const t = t0 + ev.start * spb;
      Piano.note(72, t, { gain: 0.6, dur: Math.min(0.5, soundingBeats(evs, ev) * spb * 0.9) });
      if (ev.el) { Player.uiAt(sess, t, () => ev.el.classList.add('hi')); Player.uiAt(sess, t + Math.max(0.1, ev.beats * spb - 0.04), () => ev.el.classList.remove('hi')); }
    });
    return total * spb;
  }, { onStop: () => clearMarks(evs, 'hi') });
}
function rhythmGo(i) {
  const r = reg[i], root = $(`[data-b-root="${i}"]`);
  if (!r.st.rendered || !Piano.ensure()) return;
  const c = Piano.ctx, evs = r.st.rendered.events, ex = r.st.ex;
  clearMarks(evs);
  const spb = 60 / r.st.bpm, beatsPerBar = timeBeats(ex.time), unitBeat = ex.time.endsWith('/8') ? 0.5 : 1;
  const total = Math.max(...evs.map(e => e.start + e.beats));
  // pickup bar: count in so the first note lands at its place in a full bar
  const firstBarLen = evs.filter(e => e.bar === 0).reduce((a, e) => Math.max(a, e.start + e.beats), 0);
  const pickup = firstBarLen < beatsPerBar - 0.01 ? beatsPerBar - firstBarLen : 0;
  const countIn = beatsPerBar + pickup;
  const tStart = c.currentTime + 0.15, t0 = tStart + countIn * spb;
  const expected = evs.filter(e => !e.rest && !e.tiedIn).map(e => ({ ev: e, t: t0 + e.start * spb, hit: null }));
  const taps = [];
  r.st.taps = taps; r.st.expected = expected;
  const pad = $('.tap-pad', root), fb = $('[data-fb]', root);
  pad.hidden = false; pad.textContent = 'Get ready'; pad.classList.add('armed');
  fb.textContent = 'Listen to the count-in, then tap each note.';
  const key = 'rhgo-' + renderSeq + '-' + i;
  r.st.tapOn = true;
  Player.play(key, (ts, sess) => {
    const nClicks = Math.round((countIn + total) / unitBeat);
    for (let b = 0; b < nClicks; b++) {
      const t = tStart + b * unitBeat * spb, beatInBar = ((b * unitBeat) - pickup + 1000 * beatsPerBar) % beatsPerBar;
      Piano.click(t, b * unitBeat < countIn ? beatInBar === 0 || b === 0 : Math.abs(beatInBar) < 0.01);
      if (b * unitBeat < countIn) Player.uiAt(sess, t, () => { pad.textContent = String(Math.round((countIn - b * unitBeat) / unitBeat)); });
    }
    Player.uiAt(sess, t0, () => { pad.textContent = 'Tap'; });
    return (tStart - ts) + (countIn + total) * spb + 0.6;
  }, { onStop: () => finishRhythm(i) });
}
function rhythmTap(i) {
  const r = reg[i]; if (!r.st.tapOn) return;
  const c = Piano.ctx; if (!c) return;
  const offset = (Store.setting('tapOffset', 0) || 0) / 1000;
  r.st.taps.push(c.currentTime - Piano.latency() - offset);
  const pad = $(`[data-b-root="${i}"] .tap-pad`); if (pad) { pad.classList.remove('hit'); void pad.offsetWidth; pad.classList.add('hit'); }
}
function finishRhythm(i) {
  const r = reg[i]; if (!r || !r.st.tapOn) return;
  r.st.tapOn = false;
  const root = $(`[data-b-root="${i}"]`); if (!root) return;
  const spb = 60 / r.st.bpm, win = Math.min(0.32, spb * 0.45);
  const taps = r.st.taps.slice(), exp = r.st.expected;
  const used = new Set();
  exp.forEach(e => {
    let best = -1, bd = Infinity;
    taps.forEach((t, k) => { if (used.has(k)) return; const dd = Math.abs(t - e.t); if (dd < bd) { bd = dd; best = k; } });
    if (best >= 0 && bd <= win) { used.add(best); e.hit = taps[best] - e.t; }
  });
  const extra = taps.length - used.size;
  let pts = 0, offs = [];
  exp.forEach(e => {
    if (!e.ev.el) return;
    if (e.hit === null) { e.ev.el.classList.add('bad'); return; }
    offs.push(e.hit);
    const a = Math.abs(e.hit);
    if (a <= 0.075) { pts += 1; e.ev.el.classList.add('ok'); }
    else if (a <= 0.15) { pts += 0.6; e.ev.el.classList.add(e.hit < 0 ? 'early' : 'late'); }
    else { pts += 0.25; e.ev.el.classList.add(e.hit < 0 ? 'early' : 'late'); }
  });
  const score = Math.max(0, Math.round((pts - extra * 0.5) / Math.max(1, exp.length) * 100));
  const mean = offs.length ? offs.reduce((a, b) => a + b, 0) / offs.length * 1000 : 0;
  let msg = `${score}% · ${exp.filter(e => e.hit !== null).length} of ${exp.length} notes hit${extra ? `, ${extra} extra tap${extra > 1 ? 's' : ''}` : ''}.`;
  if (offs.length > 3 && Math.abs(mean) > 45) msg += ` You tend to tap ${mean < 0 ? 'early' : 'late'} by about ${Math.round(Math.abs(mean))} ms.`;
  const better = Store.setRhythm(r.st.ex.id, score);
  if (better && score >= 60) msg += ' New best.';
  r.st.fb = msg;
  const fb = $('[data-fb]', root); if (fb) fb.textContent = msg;
  const pad = $('.tap-pad', root); if (pad) { pad.hidden = true; pad.classList.remove('armed'); }
  Store.addPractice(0.5);
}

/* ============================================================
   Screens
   ============================================================ */
function screenOnboarding(fromSettings) {
  return `${fromSettings ? topbar('Starting level') : ''}<main><div class="onb">
    ${fromSettings ? '' : '<div class="eyebrow">Piano: Read &amp; Play</div>'}
    <h1>${fromSettings ? 'Change your starting point' : 'Where are you starting?'}</h1>
    <p class="lead">Learn to read music and play the piano together, from your first note to picking up a music book and playing. Pick the level that fits; earlier lessons stay open for review.</p>
    <div class="level-pick">${LEVELS.map(l => `<button data-act="pick-level" data-level="${l.id}"><h3>${l.name} <small>${esc(l.tag)}</small></h3><p>${esc(l.blurb)}</p><p><b>Choose this if:</b> ${esc(l.youCan)}</p></button>`).join('')}</div>
  </div></main>`;
}

function lessonStatus(l, next) {
  if (Store.isDone(l.id)) return 'done';
  if (next && next.id === l.id) return 'next';
  if (l.levelIndex < startIdx()) return 'skipped';
  return '';
}
function screenLearn() {
  const next = nextLesson();
  const doneCount = ALL_LESSONS.filter(l => Store.isDone(l.id)).length;
  if (!ui.learnLevel) ui.learnLevel = next ? next.level : LEVELS[startIdx()].id;
  const lv = LEVELS[LEVEL_IDX[ui.learnLevel]];
  const acc = accuracyAll();
  const hero = next ? `<section class="hero">
      <div class="hero-staff" aria-hidden="true"></div>
      <div class="eyebrow">Up next · ${next.track === 'play' ? 'Playing' : 'Reading'} · ${esc(next.unit)}</div>
      <h1>${esc(next.title)}</h1><p>${esc(next.goal)}</p>
      <button class="btn primary" data-act="open-lesson" data-id="${next.id}">${Store.state.lastLesson && Store.state.lastLesson.id === next.id ? 'Continue' : 'Start lesson'} ${ICON.arrowR}</button></section>`
    : `<section class="hero"><div class="eyebrow">Course complete</div><h1>Every lesson done</h1><p>Keep your reading sharp in Practise and Pieces.</p></section>`;
  const levels = LEVELS.map(l => {
    const ls = ALL_LESSONS.filter(x => x.level === l.id), d = ls.filter(x => Store.isDone(x.id)).length;
    const lp = ls.filter(x => x.track === 'play'), dp = lp.filter(x => Store.isDone(x.id)).length;
    return `<button class="level-row" data-act="level-view" data-level="${l.id}" aria-pressed="${l.id === ui.learnLevel}"><h3>${l.name}${!isPremium() && !FREE_RULES.levels.includes(l.id) ? ` <span class="lock-tag">${ICON.lock}Premium</span>` : ''}</h3><span class="count">${d} / ${ls.length}</span><span class="split">Reading ${d - dp}/${ls.length - lp.length} · Playing ${dp}/${lp.length}</span><div class="bar"><i style="width:${ls.length ? d / ls.length * 100 : 0}%"></i></div></button>`;
  }).join('');
  const units = lv.units.map(u => `<section class="unit"><h3>${esc(u.title)}</h3><div class="lesson-list">${u.lessons.map((l, k) => {
    const st = lessonStatus(l, next);
    return `<button class="lesson-row" data-act="open-lesson" data-id="${l.id}"><span class="status ${st}">${st === 'done' ? ICON.check : k + 1}</span><span class="t">${esc(l.title)}${st === 'skipped' ? ' <span class="muted small">· review</span>' : ''}</span><span class="m">${lessonLocked(l) ? `<span class="lock-tag">${ICON.lock}Premium</span>` : `<span class="trk ${l.track === 'play' ? 'trk-play' : 'trk-read'}">${l.track === 'play' ? 'Playing' : 'Reading'}</span>`}${l.mins} min</span></button>`;
  }).join('')}</div></section>`).join('');
  mount(() => maybeTour('welcome'));
  return `${topbar('Read & Play', helpBtn('welcome') + settingsBtn())}<main>${hero}
    <div class="stats three"><div class="stat"><b>${streak()}</b><span>day streak</span></div><div class="stat"><b>${doneCount}</b><span>of ${ALL_LESSONS.length} lessons</span></div><div class="stat"><b>${acc === null ? '–' : acc + '%'}</b><span>reading accuracy</span></div></div>
    <div class="section-head"><h2>Levels</h2><span class="muted small">Starting at ${esc(LEVELS[startIdx()].name)}</span></div>
    <div class="levels">${levels}</div>
    <div class="section-head"><h2>${esc(lv.name)}</h2></div><p class="muted" style="margin-top:-10px">${esc(lv.blurb)}</p>
    ${units}</main>`;
}

function screenLesson(id) {
  const l = LESSON_BY_ID[id]; if (!l) return screenLearn();
  const idx = ALL_LESSONS.indexOf(l), prev = ALL_LESSONS[idx - 1], next = ALL_LESSONS[idx + 1];
  const unit = LEVELS[l.levelIndex].units.find(u => u.id === l.unitId), pos = unit.lessons.indexOf(l) + 1;
  const done = Store.isDone(id);
  mount(() => maybeTour('lesson'));
  return `${topbar(unit.title, helpBtn('lesson'))}<main>
    <div class="lesson-head"><div class="eyebrow">${l.track === 'play' ? 'Playing' : 'Reading'} · ${esc(LEVELS[l.levelIndex].name)} · Lesson ${pos} of ${unit.lessons.length} · ${l.mins} min</div><h1>${esc(l.title)}</h1></div>
    <div class="goal"><b>Goal</b><span>${esc(l.goal)}</span></div>
    <div class="blocks">${l.blocks.map(renderBlock).join('')}</div>
    <div class="lesson-foot">
      ${done ? `<div class="done-banner">${ICON.check} Lesson complete<span class="spacer"></span><button class="btn small" data-act="uncomplete" data-id="${id}">Mark as not done</button></div>`
        : `<button class="btn good block" data-act="complete" data-id="${id}">${ICON.check} Mark lesson complete</button>`}
      <div class="row">${prev ? `<button class="btn" data-act="open-lesson" data-id="${prev.id}" data-replace="1">${ICON.arrowL} Previous</button>` : ''}${next ? `<button class="btn" data-act="open-lesson" data-id="${next.id}" data-replace="1">Next ${ICON.arrowR}</button>` : ''}</div>
    </div></main>`;
}

/* ---------- Practise ---------- */
const DRILL_DEFAULT = { clef: 'treble', range: 'staff', accidentals: false, mode: 'keys', length: 20, anyOctave: false };
function drillCfg() { return Object.assign({}, DRILL_DEFAULT, Store.setting('drillCfg', {}), ui.drillCfg || {}); }
function poolFor(cfg) {
  const r = cfg.range === 'staff' ? 'staff' : cfg.range === 'ledger' ? 'ledger' : 'wide';
  if (cfg.clef === 'grand') return { treble: 'treble-' + r, bass: 'bass-' + r };
  return cfg.clef + '-' + r;
}
function screenPractise() {
  const cfg = drillCfg();
  const acc = accuracyAll();
  const chips = (k, opts, cur) => `<div class="chips" role="group">${opts.map(([v, n]) => `<button class="chip" data-act="dcfg" data-k="${k}" data-v="${v}" aria-pressed="${String(cur) === String(v)}">${n}</button>`).join('')}</div>`;
  const speedBest = c => Store.best('speed-' + c);
  mount(() => {
    const host = $('[data-heat]'); if (!host) return;
    const clef = ui.heatClef, [lo, hi] = clef === 'treble' ? [55, 88] : [33, 67];
    const kb = makeKeyboard(host, { from: lo, to: hi, labels: 'c', minKey: 16, sound: true });
    const map = {};
    for (let m = lo; m <= hi; m++) { const s = Store.noteStat(clef, m); if (s && s.n >= 1) map[m] = (s.ok / s.n).toFixed(2); }
    kb.heat(map);
  });
  const weakCount = Object.entries(Store.state.noteStats).filter(([, s]) => s.n >= 3 && s.ok / s.n < 0.85).length;
  mount(() => maybeTour('practise'));
  return `${topbar('Practise', helpBtn('practise') + settingsBtn())}<main>
    <div class="stats three"><div class="stat"><b>${notesRead()}</b><span>notes read</span></div><div class="stat"><b>${acc === null ? '–' : acc + '%'}</b><span>accuracy</span></div><div class="stat"><b>${streak()}</b><span>day streak</span></div></div>
    <section class="card setup">
      <div class="section-head"><h2>Note drill</h2></div>
      <div class="opt"><div class="opt-l">Clef</div>${chips('clef', [['treble', 'Treble'], ['bass', 'Bass'], ['grand', 'Both']], cfg.clef)}</div>
      <div class="opt"><div class="opt-l">Range</div>${chips('range', [['staff', 'On the stave'], ['ledger', '+ Ledger lines'], ['wide', 'Wide']], cfg.range)}</div>
      <div class="opt"><div class="opt-l">Answer with</div>${chips('mode', [['keys', 'Keyboard'], ['letters', 'Letter names']], cfg.mode)}</div>
      <div class="opt"><div class="opt-l">Length</div>${chips('length', [[10, '10 notes'], [20, '20 notes'], [60, '60 seconds']], cfg.length)}</div>
      <label class="check inline"><input type="checkbox" data-change="dcfg-acc" ${cfg.accidentals ? 'checked' : ''}><span>Include sharps and flats</span></label>
      <button class="btn primary block" data-act="drill-go">${ICON.target} Start drill</button>
      <p class="muted small">The drill shows notes you find hard more often.${speedBest('treble') !== null || speedBest('bass') !== null ? ` Best 60-second scores: treble ${speedBest('treble') ?? '–'}, bass ${speedBest('bass') ?? '–'}, both ${speedBest('grand') ?? '–'}.` : ''}</p>
    </section>
    <button class="link-card" data-act="drill-weak" ${weakCount ? '' : 'disabled'}><span><span class="eyebrow">Adaptive</span><b>Weak notes</b><span class="muted">${weakCount ? `${weakCount} notes under 85% accuracy` : 'Do a few drills first; your weakest notes collect here.'}</span></span>${ICON.arrowR}</button>
    <section class="card heat-card"><div class="section-head"><h2>Your note map</h2>${`<div class="seg mini" role="group"><button data-act="heat-clef" data-v="treble" aria-pressed="${ui.heatClef === 'treble'}">Treble</button><button data-act="heat-clef" data-v="bass" aria-pressed="${ui.heatClef === 'bass'}">Bass</button></div>`}</div>
      <p class="muted small">Each key shows your accuracy reading that note in the ${ui.heatClef} clef: green is strong, red needs work.</p>
      <div class="kb-host heat-kb" data-heat></div></section>
    ${techCard()}
    <div class="section-head"><h2>Rhythm reading</h2></div>
    <div class="list">${RHYTHMS.map(r => { const b = Store.state.rhythms[r.id]; return `<button class="list-row" data-act="open-rhythm" data-id="${r.id}"><span class="t">${esc(r.title)}</span><span class="lvl">${b ? b.best + '%' : r.time}</span><span class="d">${esc(r.level[0].toUpperCase() + r.level.slice(1))}</span></button>`; }).join('')}</div>
    <div class="section-head"><h2>More quizzes</h2></div>
    <div class="list">
      <button class="list-row" data-act="open-intervals"><span class="t">Intervals</span><span class="lvl">${Store.best('intervals') ?? '–'}</span><span class="d">Read the distance between two notes</span></button>
      <button class="list-row" data-act="open-keyquiz"><span class="t">Key signatures</span><span class="lvl">${Store.best('keyquiz') ?? '–'}</span><span class="d">Name the key from its sharps or flats</span></button>
    </div>
    ${metronomeCard()}
  </main>`;
}
/* ---------- Help me play: your own music from a photo ---------- */
let scan = null;   // { pages: [{ blob, preview }], title, status, result, warnings, error, ctl, bars, fromFile }
const SCAN_ACCEPT = 'image/*,.pdf,application/pdf,.musicxml,.xml,.mxl,application/vnd.recordare.musicxml+xml,application/vnd.recordare.musicxml,.mid,.midi,audio/midi,audio/x-midi';
function helpMePlayCard() {
  const songs = mySongs();
  return `<section class="card hmp">
    <div class="eyebrow">Help me play</div>
    <h2 class="hmp-h">Learn your own music</h2>
    <p class="muted small">Photograph a page, or upload a PDF, MusicXML or MIDI file, and play along with it.</p>
    <div class="row wrap"><button class="btn primary" data-act="scan-camera">${ICON.camera} Take a photo</button><button class="btn" data-act="scan-pick">${ICON.upload} Upload a file</button></div>
    <input type="file" accept="image/*" capture="environment" data-change="scan-files" id="scan-cam" hidden>
    <input type="file" accept="${SCAN_ACCEPT}" multiple data-change="scan-files" id="scan-pick" hidden>
    ${songs.length ? `<h3 class="hmp-sub">My songs</h3><div class="list">${songs.map(p => { const st = Store.state.pieces[p.id]; return `<button class="list-row" data-act="open-piece" data-id="${p.id}"><span class="t">${esc(p.title)}</span><span class="stars" aria-label="${st ? st.stars : 0} of 3 stars">${starsText(st ? st.stars : 0)}</span><span class="d">${esc(p.by)} · ${p.clef === 'grand' ? 'Both hands' : p.clef === 'bass' ? 'Bass clef' : 'Treble clef'}${p.key && p.key !== 'C' ? ' · ' + esc(keyName(p.key)) : ''}</span></button>`; }).join('')}</div>` : ''}
  </section>`;
}
async function scanAddFiles(files) {
  if (!files || !files.length) return;
  const list = Array.from(files);
  if (!isPremium()) {
    if (list.some(f => ['pdf', 'image'].includes(fileKind(f)))) return paywall('reading');
    if (mySongs().length >= FREE_RULES.songs) return paywall('songs');
  }
  // MusicXML and MIDI: converted directly, no reading needed
  const xml = list.find(f => ['xml', 'mxl', 'midi'].includes(fileKind(f)));
  if (xml) {
    try {
      const kind = fileKind(xml);
      const data = kind === 'midi' ? midiFileToSheet(await xml.arrayBuffer()) : await readMusicXmlFile(xml, kind);
      const { song, warnings } = cleanSheet(data);
      if (kind === 'midi') warnings.unshift('From a MIDI file: the notes are exact, but rhythms and the split between the hands are the app\u2019s best guess. Check them against the music.');
      if (!song.title) song.title = xml.name.replace(/\.(musicxml|xml|mxl|midi?|kar)$/i, '');
      scan = { pages: [], title: '', status: 'review', result: song, warnings, fromFile: xml.name };
      if (route.view === 'scan') render(); else go({ tab: 'pieces', view: 'scan' });
    } catch (e) { toast(e.message && e.message.length < 90 ? e.message : 'That file couldn\u2019t be read'); }
    return;
  }
  if (!scan || scan.status !== 'ready') scan = { pages: [], title: '', status: 'ready' };
  for (const f of list) {
    const kind = fileKind(f);
    try {
      if (kind === 'pdf') {
        toast('Opening the PDF\u2026');
        const { pages, total } = await pdfToPages(f, 12);
        pages.forEach(p => scan.pages.push(p));
        if (!scan.title) scan.title = f.name.replace(/\.pdf$/i, '');
        if (total > pages.length) toast(`Showing the first ${pages.length} of ${total} pages`);
      } else if (kind === 'image') scan.pages.push(await SheetReader.prepare(f));
      else toast('Use a photo, a PDF, a MusicXML file or a MIDI file');
    } catch (e) { toast(kind === 'image' ? 'That picture couldn\u2019t be opened. Try a JPEG or PNG.' : 'That file couldn\u2019t be opened'); }
  }
  if (!scan.pages.length) { scan = null; return; }
  if (route.view === 'scan') render(); else go({ tab: 'pieces', view: 'scan' });
}
function screenScan() {
  if (!scan || (!scan.pages.length && !scan.result)) return screenPieces();
  const thumbs = `<div class="scan-thumbs">${scan.pages.map((pg, i) => `<figure><img src="${pg.preview}" alt="Page ${i + 1}">${scan.status === 'ready' ? `<button class="icon-btn scan-x" data-act="scan-remove" data-i="${i}" aria-label="Remove page ${i + 1}">\u00d7</button>` : ''}</figure>`).join('')}</div>`;
  let body = '';
  if (scan.status === 'ready') {
    mount(async () => {
      const a = await SheetReader.available(), b = $('[data-act="scan-read"]'), el = $('[data-scan-avail]'), lim = $('[data-scan-limit]');
      if (el && !a) { el.hidden = false; if (b) b.disabled = true; }
      if (a && scan.pages.length > a.maxPages && lim) { lim.hidden = false; lim.textContent = `The app can read up to ${a.maxPages} pages at a time. Remove ${scan.pages.length - a.maxPages} with the \u00d7 buttons, then read the rest afterwards.`; if (b) b.disabled = true; return; }
      const need = await SheetReader.pagesToPay(scan.pages.map(p => p.blob)), left = PageAllowance.left();
      if (need > left && lim) { lim.hidden = false; lim.textContent = SheetReader.message({ code: 'limit', need }); if (b) b.disabled = true; }
    });
    body = `${thumbs}
      <label class="field"><span>Title (optional)</span><input type="text" data-input="scan-title" value="${esc(scan.title)}" placeholder="Read from the page if left blank"></label>
      <ul class="blist small"><li>Lay the page flat, in good light, with the whole page in the picture. PDFs work too.</li><li>Have a MusicXML file (from MuseScore, Sibelius or similar)? Upload that instead: it\u2019s read exactly, with no mistakes. MIDI files work too.</li><li>Printed music works best. Handwritten music may not read well.</li><li>Your songs are kept on this device only.</li></ul>
      <div class="tip" data-scan-limit hidden></div>
      <div class="tip" data-scan-avail hidden>Reading photos needs the Claude app (open this page inside Claude) or the app\u2019s own reading service. It isn\u2019t available in this copy.</div>
      <p class="muted small">You have ${PageAllowance.left()} of ${PageAllowance.limit()} pages left this month. Pages you\u2019ve read before, MusicXML and MIDI files don\u2019t count.</p>
      <div class="row wrap"><button class="btn primary" data-act="scan-read">Read the music</button><button class="btn" data-act="scan-pick">Add a page or file</button></div>`;
  } else if (scan.status === 'reading') {
    body = `${thumbs}<div class="scan-busy"><span class="spinner" aria-hidden="true"></span><div><b>Reading the music\u2026</b><div class="muted small" data-scan-progress>${scan.bars ? scan.bars + ' bars read so far' : 'This usually takes about a minute a page.'}</div></div></div>
      <button class="btn" data-act="scan-stop">Stop</button>`;
  } else if (scan.status === 'error') {
    body = `${thumbs}<div class="tip">${esc(scan.error)}</div><div class="row wrap">${scan.limit ? '' : '<button class="btn primary" data-act="scan-retry">Try again</button>'}<button class="btn${scan.limit ? ' primary' : ''}" data-act="scan-camera">Take a new photo</button></div>`;
  } else if (scan.status === 'review') {
    const sg = scan.result;
    mount(() => { const el = $('[data-scan-score]'); if (el) renderScore(el, sg.clef === 'grand' ? { clef: 'grand', key: sg.key, time: sg.time, rh: sg.rh, lh: sg.lh } : { clef: sg.clef, key: sg.key, time: sg.time, music: sg.music }, { label: 'What the app read' }); });
    body = `<p class="small">${scan.fromFile ? `Read from <b>${esc(scan.fromFile)}</b>. Have a listen, then save it to My songs.` : 'Here\u2019s what the app read. Compare it with your page, then save it to My songs. You can fix any notes afterwards.'}</p>
      <div class="scan-compare">${thumbs}<div class="paper"><div class="score" data-scan-score></div></div></div>
      ${scan.warnings.length ? `<details class="scan-warn"><summary>${scan.warnings.length} thing${scan.warnings.length === 1 ? '' : 's'} to check</summary><ul class="blist small">${scan.warnings.map(w => `<li>${esc(w)}</li>`).join('')}</ul></details>` : ''}
      <div class="row wrap"><button class="btn primary" data-act="scan-save">${ICON.check} Save to My songs</button><button class="btn" data-act="scan-listen">${ICON.ear} Listen</button>${scan.fromFile ? '' : '<button class="btn" data-act="scan-again">Read it again</button>'}</div>
      ${scan.fromFile ? '' : `<p class="muted small">Reading it again uses ${scan.pages.length === 1 ? 'a page' : scan.pages.length + ' pages'} of your ${PageAllowance.limit()} a month. You have ${PageAllowance.left()} left.</p>`}
      ${scan.cached ? '<p class="muted small">These pages were read before, so the saved reading was used.</p>' : ''}`;
  }
  return `${topbar('Help me play')}<main class="scan-main">${body}</main>`;
}
async function scanRead(fresh) {
  if (!scan || !scan.pages.length) return;
  const sc = scan;
  sc.status = 'reading'; sc.bars = 0; sc.limit = false; sc.ctl = new AbortController(); render();
  try {
    const data = await SheetReader.read(sc.pages.map(p => p.blob), { signal: sc.ctl.signal, fresh, onProgress: ({ bars, checking }) => { sc.bars = bars; const el = scan === sc && $('[data-scan-progress]'); if (el) el.textContent = checking ? 'Some bars didn\u2019t add up, so they\u2019re being read again\u2026' : bars + ' bars read so far'; } });
    if (scan !== sc) return;
    const { song, warnings } = cleanSheet(data);
    if (sc.title.trim()) song.title = sc.title.trim();
    sc.cached = !!data._cached;
    sc.result = song; sc.warnings = warnings; sc.status = 'review';
  } catch (e) {
    if (scan !== sc) return;
    if (e && (e.code === 'cancelled' || e.name === 'AbortError')) { sc.status = 'ready'; render(); return; }
    if (e && e.code === 'premium') { sc.status = 'ready'; paywall('reading'); return; }
    sc.status = 'error'; sc.limit = !!(e && e.code === 'limit');
    sc.error = e && e.code === 'not_music' ? 'The app couldn\u2019t find piano music in that picture' + (e.message ? ' (' + e.message + ')' : '') + '. Try a flatter, brighter photo of the whole page.' : SheetReader.message(e);
  }
  if (route.view === 'scan') render();
}
function scanSave() {
  const sg = scan && scan.result; if (!sg) return;
  const id = 'song-' + Date.now().toString(36);
  Store.state.songs[id] = Object.assign({}, sg, { created: Date.now(), at: Date.now() });
  Store.save();
  scan = null; pa = null;
  replaceRoute({ tab: 'pieces', view: 'piece', id });
  toast('Saved to My songs');
}
function songActions(p) {
  if (ui.songDelAsk === p.id) return `<div class="row wrap song-actions"><span class="small">Delete \u201c${esc(p.title)}\u201d from My songs?</span><button class="btn small" data-act="song-del-cancel">Keep it</button><button class="btn primary small" data-act="song-del" data-id="${p.id}">Delete</button></div>`;
  return `<div class="row wrap song-actions"><button class="btn small" data-act="song-edit" data-id="${p.id}">Edit notes</button><button class="btn small" data-act="song-del-ask" data-id="${p.id}">Delete</button></div>`;
}
let songDraft = null;
function screenSongEdit(id) {
  const p = getPiece(id); if (!p) return screenPieces();
  if (!songDraft || songDraft.id !== id) songDraft = { id, title: p.title, by: p.by === 'My song' ? '' : p.by, key: p.key || 'C', time: p.time, bpm: p.bpm, clef: p.clef, rh: (p.rh || '').replace(/\s*FIN\s*$/, ''), lh: (p.lh || '').replace(/\s*FIN\s*$/, ''), music: (p.music || '').replace(/\s*FIN\s*$/, '') };
  const d = songDraft;
  mount(() => songPreview());
  const area = (k, label) => `<label class="field"><span>${label}</span><textarea data-input="song-${k}" rows="5" spellcheck="false" autocapitalize="off">${esc(d[k])}</textarea></label>`;
  return `${topbar('Edit notes')}<main>
    <label class="field"><span>Title</span><input type="text" data-input="song-title" value="${esc(d.title)}"></label>
    <div class="row wrap">
      <label class="field"><span>Key</span><select data-input="song-key">${Object.keys(KEY_SIGS).map(k => `<option value="${k}"${k === d.key ? ' selected' : ''}>${esc(keyName(k))}</option>`).join('')}</select></label>
      <label class="field"><span>Time</span><select data-input="song-time">${['4/4', '3/4', '2/4', '6/8', '3/8', '9/8', '12/8', '2/2', 'C'].map(t => `<option${t === d.time ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="field"><span>Tempo</span><input type="number" min="30" max="240" data-input="song-bpm" value="${d.bpm}"></label>
    </div>
    ${d.clef === 'grand' ? area('rh', 'Right hand (upper staff)') + area('lh', 'Left hand (lower staff)') : area('music', 'Notes')}
    <details class="small"><summary>How to write notes</summary><ul class="blist small">
      <li>Bars are separated by |. Notes are a letter, sharp or flat (# or b) and octave: middle C is c4.</li>
      <li>Length after a colon: w semibreve, h minim, q crotchet, 8 quaver, 16 semiquaver. Add . for dotted. A note without a length copies the one before.</li>
      <li>Chords in brackets: (c4 e4 g4):h. Rests: r:q, r:h, r:w. Write the pitch that sounds, so f#4 in G major.</li></ul></details>
    <div class="feedback" data-song-msg aria-live="polite"></div>
    <div class="paper"><div class="score" data-song-preview></div></div>
    <div class="row"><button class="btn primary" data-act="song-save">${ICON.check} Save</button><button class="btn" data-act="back">Cancel</button></div>
  </main>`;
}
function songDraftSpec() {
  const d = songDraft, fin = t => t.trim() + ' FIN';
  return d.clef === 'grand' ? { clef: 'grand', key: d.key, time: d.time, rh: fin(d.rh), lh: fin(d.lh) } : { clef: d.clef, key: d.key, time: d.time, music: fin(d.music) };
}
function songPreview() {
  const el = $('[data-song-preview]'), msg = $('[data-song-msg]'); if (!el || !songDraft) return false;
  try {
    const spec = songDraftSpec();
    ['rh', 'lh', 'music'].forEach(k => { if (spec[k]) parseMusic(spec[k]); });
    if (spec.rh && parseMusic(spec.rh).length !== parseMusic(spec.lh).length) throw new Error('The two hands have a different number of bars.');
    renderScore(el, spec, { label: 'Preview' });
    if (msg) msg.textContent = '';
    return true;
  } catch (e) {
    const m = /^Bad (?:token|pitch) "(.*)"$/.exec(e.message || '');
    if (msg) msg.innerHTML = `<span class="bad">${m ? 'Can\u2019t read \u201c' + esc(m[1]) + '\u201d. Check that note.' : esc(e.message || 'Something in the notes can\u2019t be read.')}</span>`;
    return false;
  }
}
let songPreviewT = 0;

/* ---------- Technique: scales, arpeggios, inversions ---------- */
function techState() { return Object.assign({ type: 'major', key: 'C', hands: 'rh' }, Store.setting('tech', {}), ui.tech || {}); }
function techBest(type, key, hands) { return Store.best(`ex-tech-${type}-${key}-${hands}`); }
function techCard() {
  const t = techState();
  const keys = TECH_KEYS[t.type];
  const chip = (act, v, label, on, extra = '') => `<button class="chip" data-act="${act}" data-v="${esc(v)}" aria-pressed="${on}">${label}${extra}</button>`;
  return `<section class="card setup tech-card">
    <div class="section-head"><h2>Scales and chords</h2></div>
    <p class="muted small" style="margin-top:-6px">Technique practice with the right fingering. Get each one to 100% with both hands.</p>
    <div class="opt"><div class="opt-l">Practise</div><div class="chips" role="group">${TECH_TYPES.map(x => chip('tech-type', x.id, x.short, t.type === x.id)).join('')}</div></div>
    <div class="opt"><div class="opt-l">Key</div><div class="chips" role="group">${keys.map(k => { const b = Math.max(techBest(t.type, k, 'rh') ?? 0, 0), bl = techBest(t.type, k, 'lh') ?? 0, bb = techBest(t.type, k, 'both') ?? 0; const star = bb >= 95 ? ' ★' : (b >= 95 && bl >= 95) ? ' ✓' : ''; return chip('tech-key', k, esc(keyName(/m$/.test(k) || t.type === 'minor' ? k.replace(/m$/, '') + 'm' : k).replace(' major', '').replace(' minor', 'm')), t.key === k, star); }).join('')}</div></div>
    <div class="opt"><div class="opt-l">Hands</div><div class="chips" role="group">${[['rh', 'Right'], ['lh', 'Left'], ['both', 'Together']].map(([v, n]) => chip('tech-hands', v, n, t.hands === v)).join('')}</div></div>
    <button class="btn primary block" data-act="tech-go">${ICON.midi} Start</button>
    <p class="muted small">✓ means both hands separately at 95% or more; ★ means hands together.</p>
  </section>`;
}
function screenTech() {
  const t = techState(), ex = techExercise(t.type, t.key, t.hands);
  const keys = TECH_KEYS[t.type], k = keys.indexOf(t.key), nextKey = keys[(k + 1) % keys.length];
  const block = { t: 'play', id: `tech-${t.type}-${t.key}-${t.hands}`, title: ex.title + (t.hands === 'both' ? ', hands together' : t.hands === 'lh' ? ', left hand' : ', right hand'), spec: ex.spec, bpm: t.type === 'inv' ? 60 : 80 };
  return `${topbar(TECH_TYPES.find(x => x.id === t.type).name)}<main>
    <div class="blocks">${renderBlock(block)}<div class="tip">${esc(ex.tip)}</div></div>
    <div class="row">${['rh', 'lh', 'both'].filter(h => h !== t.hands).map(h => `<button class="btn small" data-act="tech-switch" data-v="${h}">${h === 'rh' ? 'Right hand' : h === 'lh' ? 'Left hand' : 'Hands together'}</button>`).join('')}<span class="spacer"></span><button class="btn small" data-act="tech-next" data-v="${esc(nextKey)}">Next key ${ICON.arrowR}</button></div>
  </main>`;
}
function metronomeCard() {
  return `<section class="card metro"><div class="section-head"><h2>Metronome</h2></div>
    <div class="metro-row"><button class="icon-btn" data-act="metro-step" data-d="-4" aria-label="Slower">−</button><div class="metro-bpm"><b data-metro-bpm>${Metronome.bpm}</b><span>bpm</span></div><button class="icon-btn" data-act="metro-step" data-d="4" aria-label="Faster">+</button>
    <button class="btn primary" data-act="metro-toggle">${Metronome.running ? 'Stop' : 'Start'}</button></div>
    <div class="beats" data-beats>${Array.from({ length: Metronome.beats }, (_, k) => `<i class="${k === 0 ? 'first' : ''}"></i>`).join('')}</div>
    <div class="chips" role="group">${[2, 3, 4, 6].map(n => `<button class="chip" data-act="metro-beats" data-v="${n}" aria-pressed="${Metronome.beats === n}">${n} beats</button>`).join('')}</div></section>`;
}

let liveDrill = null, drillTimer = null;
function screenDrill() {
  const d = liveDrill;
  if (!d) return screenPractise();
  const title = d.cfg.weak ? 'Weak notes' : d.cfg.seconds ? '60 second challenge' : 'Note drill';
  if (d.done) return `${topbar(title)}<main><div class="media drill-block">${drillSummaryHTML(d, 'data-act="drill-again"')}</div>${d.cfg.seconds ? `<p class="muted small">Best: ${Store.best('speed-' + d.cfg.clef) ?? d.ok}</p>` : ''}</main>`;
  mount(() => mountDrill(d, 'screen', advanceScreenDrill, $('.drill-screen')));
  if (d.cfg.seconds) mount(() => {
    clearInterval(drillTimer);
    drillTimer = setInterval(() => {
      const left = Math.ceil(d.cfg.seconds - (Date.now() - d.startedAt) / 1000);
      const el = $('[data-left]'); if (el) el.textContent = Math.max(0, left) + 's';
      if (left <= 0) { clearInterval(drillTimer); endScreenDrill(); }
    }, 250);
  });
  return `${topbar(title)}<main><div class="media drill-block drill-screen">${drillLiveHTML(d, 'screen', d.cfg.seconds ? 0 : d.cfg.n)}</div></main>`;
}
function advanceScreenDrill() {
  const d = liveDrill; if (!d || route.view !== 'drill') return;
  if (!d.cfg.seconds && d.i >= d.cfg.n) return endScreenDrill();
  drillNext(d);
  const root = $('.drill-screen'); if (!root) return;
  if (d.kb) { d.kb.destroy(); }
  root.innerHTML = drillLiveHTML(d, 'screen', d.cfg.seconds ? 0 : d.cfg.n);
  mountDrill(d, 'screen', advanceScreenDrill, root);
}
function endScreenDrill() {
  const d = liveDrill; if (!d || d.done) return;
  d.done = true; clearInterval(drillTimer);
  Store.addPractice((Date.now() - d.startedAt) / 60000);
  if (d.cfg.seconds) { if (Store.setBest('speed-' + d.cfg.clef, d.ok) && d.ok > 0) toast('New best: ' + d.ok); }
  render();
}
function startScreenDrill(extra = {}) {
  const c = drillCfg();
  Piano.ensure();
  const cfg = Object.assign({ clef: c.clef, pool: poolFor(c), mode: c.mode, accidentals: c.accidentals, n: c.length === 60 ? 0 : c.length, seconds: c.length === 60 ? 60 : 0 }, extra);
  liveDrill = newDrill(cfg); drillNext(liveDrill);
  go({ tab: 'practise', view: 'drill' });
}
function startWeakDrill() {
  const weak = Object.entries(Store.state.noteStats).filter(([, s]) => s.n >= 3 && s.ok / s.n < 0.85).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).slice(0, 10);
  if (!weak.length) return toast('No weak notes yet. Do a few drills first.');
  const byClef = {};
  weak.forEach(([k]) => { const [clef, m] = k.split('|'); (byClef[clef] = byClef[clef] || []).push(midiToPitch(+m, '#')); });
  const clefs = Object.keys(byClef);
  startScreenDrill({ weak: true, clef: clefs.length > 1 ? 'grand' : clefs[0], pool: clefs.length > 1 ? byClef : byClef[clefs[0]], accidentals: false, mode: 'keys', n: 15, seconds: 0 });
}

function screenRhythm(id) {
  const ex = RHYTHM_BY_ID[id]; if (!ex) return screenPractise();
  const blk = renderBlock({ t: 'rhythm', id });
  return `${topbar('Rhythm reading')}<main>
    <div class="lesson-head"><div class="eyebrow">${esc(ex.level)} · ${ex.time}</div><h1>${esc(ex.title)}</h1></div>
    ${blk}
    <div class="tip">Tap anywhere on the big pad, or press the space bar on a keyboard. If your scores say you are always late or early, adjust Tap timing in Settings.</div>
  </main>`;
}
let intState = null;
function screenIntervals() {
  if (!intState) intState = { clef: 'treble', max: 8 };
  const blk = renderBlock({ t: 'intervals', clef: intState.clef, max: intState.max, screen: true });
  return `${topbar('Intervals')}<main>
    <div class="seg" role="group"><button data-act="int-clef" data-v="treble" aria-pressed="${intState.clef === 'treble'}">Treble</button><button data-act="int-clef" data-v="bass" aria-pressed="${intState.clef === 'bass'}">Bass</button></div>
    ${blk}
    <div class="tip">2nds and 3rds are the ones to know instantly. Line to space is a 2nd; line to the next line is a 3rd.</div></main>`;
}
let kq = null;
function newKeyQ() {
  const keys = MAJOR_KEYS.filter(k => k !== 'Cb' && k !== 'C#');
  const ans = keys[Math.floor(Math.random() * keys.length)];
  const opts = new Set([ans]);
  while (opts.size < 4) opts.add(keys[Math.floor(Math.random() * keys.length)]);
  return { ans, opts: [...opts].sort(() => Math.random() - 0.5) };
}
function screenKeyQuiz() {
  if (!kq) kq = { n: 0, ok: 0, streak: 0, q: newKeyQ(), fb: '' };
  mount(() => { const el = $('[data-kq]'); if (el) renderScore(el, { clef: 'grand', key: kq.q.ans, noTime: true, rh: 'x:w', lh: 'x:w' }, { width: Math.min(220, el.clientWidth) }); });
  return `${topbar('Key signatures')}<main>
    <div class="media"><div class="media-head"><div class="mt">Which major key is this?</div><span class="pill">Streak ${kq.streak}</span><span class="pill">${kq.ok} / ${kq.n}</span></div>
    <div class="paper drill-paper"><div class="score" data-kq></div></div>
    <div class="feedback" data-fb aria-live="polite">${esc(kq.fb)}</div>
    <div class="letters four">${kq.q.opts.map(k => `<button class="letter wide" data-act="kq-answer" data-v="${k}">${esc(keyName(k).replace(' major', ''))}</button>`).join('')}</div></div>
    <div class="tip">Sharps: the key is a semitone above the last sharp. Flats: the key is the second-to-last flat. One flat is F major.</div></main>`;
}

/* ---------- Pieces ---------- */
function screenPieces() {
  mount(() => maybeTour('pieces'));
  return `${topbar('Pieces', helpBtn('pieces') + settingsBtn())}<main>
    ${helpMePlayCard()}
    <div class="chips genre-chips" role="group" aria-label="Filter by style">${[null, ...PIECE_GENRES].map(g => `<button class="chip" data-act="piece-genre" data-v="${g ? esc(g) : ''}" aria-pressed="${(ui.pieceGenre || null) === g}">${g ? esc(g) : 'All styles'}</button>`).join('')}</div>
    ${PIECE_LEVELS.map(lv => { const list = PIECES.filter(p => p.level === lv.n && (!ui.pieceGenre || p.genre === ui.pieceGenre)); return list.length ? `<section class="unit"><h3>Level ${lv.n} · ${esc(lv.name)}</h3><p class="muted small" style="margin:-4px 0 4px">${esc(lv.desc)}</p><div class="list">${list.map(p => {
      const st = Store.state.pieces[p.id];
      return `<button class="list-row" data-act="open-piece" data-id="${p.id}"><span class="t">${esc(p.title)}</span>${pieceLocked(p) ? `<span class="lock-tag">${ICON.lock}Premium</span>` : `<span class="stars" aria-label="${st ? st.stars : 0} of 3 stars">${starsText(st ? st.stars : 0)}</span>`}<span class="d">${esc(p.genre)}${p.by !== 'Study' ? ' · ' + esc(p.by) : ''} · ${p.clef === 'grand' ? (handsTogether(p) ? 'Hands together' : 'One hand at a time') : p.clef === 'bass' ? 'Bass clef' : 'Treble clef'}${p.key && p.key !== 'C' ? ' · ' + esc(keyName(p.key)) : ''}</span></button>`;
    }).join('')}</div></section>` : ''; }).join('')}
  </main>`;
}

/* does any note in the right hand start at the same moment as one in the left? */
const _ht = {};
function handsTogether(p) {
  if (p.clef !== 'grand') return false;
  if (p.id in _ht) return _ht[p.id];
  const onsets = txt => { const out = new Set(); let t = 0; parseMusic(txt).forEach(b => b.items.forEach(it => { if (!it.rest && !it.tiedIn) out.add(Math.round(t * 1000)); t += it.beats; })); return out; };
  const r = onsets(p.rh), l = onsets(p.lh);
  return (_ht[p.id] = [...r].filter(x => l.has(x)).length >= 3);
}
let pa = null; // play-along state
function paNew(p) {
  const nBars = parseMusic(p.rh || p.music).length;
  return { id: p.id, hands: p.clef === 'grand' ? 'both' : 'single', hint: false, bpm: p.bpm, idx: 0, errors: 0, started: 0, done: false,
    mode: 'wait', from: 1, to: nBars, nBars, loop: false, click: true, loops: 0, backing: Store.setting('paBacking', false) };
}
function paReset() { if (Player.key === 'pa' || Player.key === 'pa-perf') Player.stop(); Object.assign(pa, { idx: 0, errors: 0, started: 0, done: false, loops: 0, perf: null }); }
function paWhole() { return pa.from === 1 && pa.to === pa.nBars; }
function screenPiece(id) {
  const p = getPiece(id); if (!p) return screenPieces();
  if (!pa || pa.id !== id) pa = paNew(p);
  const spec = p.clef === 'grand' ? { clef: 'grand', key: p.key, time: p.time, rh: p.rh, lh: p.lh } : { clef: p.clef, key: p.key, time: p.time, music: p.music };
  mount(() => mountPiece(p, spec));
  const best = Store.state.pieces[p.id], perfBest = Store.best('perf-' + p.id), full = !!ui.paFull, kbOn = paKbOn();
  const kb = `<div class="piece-kb"${kbOn ? '' : ' hidden'}><div class="kb-host" data-pa-kb></div></div>`;
  if (full) {
    const perform = pa.mode === 'perform', playing = Player.key === (perform ? 'pa-perf' : 'pa');
    return `<main class="piece-main is-full" aria-label="${esc(p.title)}, full screen">
    <div class="fs-music">
      <div class="paper piece-paper"><div class="score" data-piece></div></div>
      <div class="feedback fs-fb" data-fb aria-live="polite"></div>
      <div class="fs-ctl" role="toolbar" aria-label="Music controls">
        <button class="fs-btn" data-act="${perform ? 'pa-perform' : 'pa-listen'}" aria-label="${playing ? 'Stop' : perform ? 'Start playing in time' : 'Play'}">${playing ? ICON.stop : ICON.play}</button>
        <button class="fs-btn" data-act="pa-restart" aria-label="Restart">${ICON.restart}</button>
        <button class="fs-btn" data-act="pa-kb" aria-pressed="${kbOn}" aria-label="${kbOn ? 'Hide' : 'Show'} piano">${ICON.midi}</button>
        <button class="fs-btn" data-act="pa-full" aria-label="Exit full screen">${ICON.shrink}</button>
      </div>
    </div>
    ${kb}
  </main>`;
  }
  mount(() => maybeTour('piece'));
  const meta = [p.mine ? 'My song' : esc(p.genre) + (p.level ? ' · Level ' + p.level : ''), p.by && p.by !== 'Study' && p.by !== 'My song' ? esc(p.by) : '', p.time + (p.swing ? ' swing' : ''), p.key && p.key !== 'C' ? esc(keyName(p.key)) : '', best ? starsText(best.stars) : '', perfBest !== null ? 'in time ' + perfBest + '%' : ''].filter(Boolean).join(' · ');
  return `${topbar(p.title, helpBtn('piece'))}<main class="piece-main">
    <div class="piece-sub muted small">${meta}</div>
    ${paBar(p)}
    ${paSummary(p)}
    <div class="paper piece-paper"><div class="score" data-piece></div></div>
    <div class="feedback" data-fb aria-live="polite"></div>
    ${aboutCard(p)}
    ${kb}
    ${ui.paSheet ? paSheet(p) : ''}
  </main>`;
}
/* the one row of controls above the music */
function paBar(p) {
  const perform = pa.mode === 'perform', listening = Player.key === 'pa', performing = Player.key === 'pa-perf';
  const main = perform
    ? `<button class="btn primary pa-go" data-act="pa-perform" aria-label="${performing ? 'Stop' : 'Start playing in time'}">${performing ? ICON.stop + ' Stop' : ICON.play + ' Start'}</button>`
    : `<button class="btn pa-go" data-act="pa-listen" aria-label="${listening ? 'Stop' : 'Listen'}">${listening ? ICON.stop + '<span class="lbl"> Stop</span>' : ICON.ear + '<span class="lbl"> Listen</span>'}</button>`;
  return `<div class="pa-bar" role="toolbar" aria-label="Practice controls">
    ${main}
    <div class="seg mini pa-modes" role="group" aria-label="Practice mode"><button data-act="pa-mode" data-v="wait" aria-pressed="${!perform}">Wait</button><button data-act="pa-mode" data-v="perform" aria-pressed="${perform}">In time</button></div>
    <span class="spacer"></span>
    <button class="icon-btn" data-act="pa-restart" aria-label="Restart">${ICON.restart}</button>
    <button class="icon-btn${paChanged(p).length ? ' has-dot' : ''}" data-act="pa-sheet" aria-label="Practice options">${ICON.settings}</button>
    <button class="icon-btn" data-act="pa-full" aria-label="Full screen">${ICON.expand}</button>
  </div>`;
}
/* what's been changed from the usual, so it's never a mystery why the piece sounds different */
function paChanged(p) {
  const out = [];
  if (pa.hands === 'rh' || pa.hands === 'lh') out.push((pa.hands === 'rh' ? 'Right hand' : 'Left hand') + (pa.backing ? ' + other hand' : ' only'));
  if (pa.bpm !== p.bpm) out.push(Math.round(pa.bpm / p.bpm * 100) + '% speed');
  if (!paWhole()) out.push(`Bars ${pa.from}–${pa.to}${pa.loop ? ' ↻' : ''}`);
  else if (pa.loop) out.push('Loop ↻');
  if (pa.hint) out.push('Keys shown');
  if (Midi.status === 'ready') out.push('MIDI');
  if (Mic.status === 'on') out.push('Microphone');
  return out;
}
function paSummary(p) {
  const ch = paChanged(p);
  return ch.length ? `<button class="pa-summary" data-act="pa-sheet" aria-label="Practice options: ${esc(ch.join(', '))}">${ch.map(c => `<span>${esc(c)}</span>`).join('')}</button>` : '';
}
/* everything else lives in a sheet that slides up */
function paSheet(p) {
  const opts = sel => Array.from({ length: pa.nBars }, (_, k) => `<option value="${k + 1}"${k + 1 === sel ? ' selected' : ''}>${k + 1}</option>`).join('');
  const pct = Math.round(pa.bpm / p.bpm * 100), solo = pa.hands === 'rh' || pa.hands === 'lh';
  const row = (label, body, note) => `<div class="sheet-row"><div class="sheet-l">${label}</div><div class="sheet-c">${body}</div>${note ? `<div class="muted small sheet-note">${note}</div>` : ''}</div>`;
  const tog = (act, on, label) => `<button class="toggle" data-act="${act}" aria-pressed="${on}">${label}</button>`;
  return `<div class="sheet-veil" data-act="pa-sheet-close"></div>
  <section class="sheet" role="dialog" aria-modal="true" aria-label="Practice options">
    <div class="sheet-head"><h2>Practice options</h2><button class="icon-btn" data-act="pa-sheet-close" aria-label="Close">${ICON.close}</button></div>
    ${p.clef === 'grand' ? row('Hands', `<div class="seg mini" role="group"><button data-act="pa-hands" data-v="both" aria-pressed="${pa.hands === 'both'}">Both</button><button data-act="pa-hands" data-v="rh" aria-pressed="${pa.hands === 'rh'}">Right</button><button data-act="pa-hands" data-v="lh" aria-pressed="${pa.hands === 'lh'}">Left</button></div>${solo ? tog('pa-backing', pa.backing, `Hear ${pa.hands === 'rh' ? 'left' : 'right'} hand too`) : ''}`,
      solo ? (pa.backing ? 'The app plays the other hand as you go.' : 'Only your hand is played. Listen plays just that part.') : '') : ''}
    ${row('Speed', `<div class="tempo" role="group" aria-label="Tempo"><button data-act="pa-tempo" data-d="-4" aria-label="Slower">−</button><span data-pa-bpm>${pa.bpm} bpm${pct !== 100 ? ' · ' + pct + '%' : ''}</span><button data-act="pa-tempo" data-d="4" aria-label="Faster">+</button></div>${pa.bpm !== p.bpm ? `<button class="btn small" data-act="pa-tempo-reset">Normal speed</button>` : ''}`)}
    ${row('Bars', `<select data-change="pa-from" aria-label="First bar">${opts(pa.from)}</select><span class="muted small">to</span><select data-change="pa-to" aria-label="Last bar">${opts(pa.to)}</select><label class="check inline"><input type="checkbox" data-change="pa-loop"${pa.loop ? ' checked' : ''}><span>Loop</span></label>${paWhole() ? '' : '<button class="btn small" data-act="pa-whole">Whole piece</button>'}`)}
    ${row('Help', `${tog('pa-hint', pa.hint, 'Show the keys to press')}${tog('pa-kb', paKbOn(), 'On-screen piano')}${pa.mode === 'perform' ? `<label class="check inline"><input type="checkbox" data-change="pa-click"${pa.click ? ' checked' : ''}><span>Metronome</span></label>` : ''}`)}
    ${row('Your piano', `${midiChip()}${micChip()}`, 'A MIDI keyboard is the most accurate. The microphone works with an acoustic piano.')}
    ${p.mine ? row('This song', songActions(p)) : ''}
  </section>`;
}
/* About this piece: key, notes outside it, chords, hand shapes, patterns */
const OUTKEY_STYLE = { fillStyle: '#E0601F', strokeStyle: '#E0601F' };
function aboutCard(p) {
  let a; try { a = analysePiece(p); } catch (e) { a = null; }
  if (!a) return '';
  const k = a.key, hl = Store.setting('outKey', true);
  const tonic = keyName(k.key).replace(/ (major|minor)$/, '');
  const scaleNotes = (k.minorMode ? scaleFrom(k.key, 4, MINOR_STEPS) : majorScale(k.key, 4)).slice(0, 7).map(x => pitchLabel(x, false));
  const n = k.sigN, sigLetters = n > 0 ? SHARP_ORDER.slice(0, n) : FLAT_ORDER.slice(0, -n);
  const rule = n ? ` Every ${sigLetters.map(l => l.toUpperCase()).join(', ')} is played as ${sigLetters.map(l => l.toUpperCase() + (n > 0 ? '\u266f' : '\u266d')).join(', ')} unless a sign in front of it says otherwise.` : '';
  const keyText = k.minorMode
    ? `This piece is in ${keyName(k.key)}. Its key signature has ${sigText(n)}, the same as ${keyName(k.major)}, its relative major.${k.reasons.length ? ' It\u2019s the minor key because ' + k.reasons.join(', and ') + '.' : ''}${rule}`
    : `This piece is in ${keyName(k.key)}. Its key signature has ${sigText(n)}.${rule}`;
  const outside = a.outside.length
    ? `<ul class="about-list">${a.outside.slice(0, 5).map(o => `<li><span class="odd-note">${esc(o.label)}</span> <span class="muted small">${plural(o.count, 'time')}, ${barList(o.bars)}</span><br>${esc(o.why)}</li>`).join('')}</ul>
       <label class="check inline"><input type="checkbox" data-change="about-outkey"${hl ? ' checked' : ''}><span>Pick these out in the music</span></label>`
    : '<p class="small">Every note belongs to the key: no surprises.</p>';
  const ch = a.chords;
  const chords = ch.used.length ? `<div class="chord-chips">${ch.used.slice(0, 10).map(c => `<span class="chord-chip"><b>${esc(c.name)}</b><small>${esc(c.roman)} \u00b7 ${plural(c.bars, 'bar')}</small></span>`).join('')}</div>
      <p class="small"><span class="muted">How it starts:</span> <span class="prog">| ${ch.byBar.slice(0, 8).map(esc).join(' | ')} |</span></p>
      <p class="muted small">The Roman numerals count up the scale from ${esc(tonic)} (I or i). Capitals are major chords, small letters minor.</p>` : '<p class="small">Mostly single notes, so there aren\u2019t clear chords to name.</p>';
  const shapeHand = (hand, list) => list.length ? `<div class="eyebrow">${hand === 'rh' ? 'Right hand' : 'Left hand'}</div>${list.map(g => `<div class="shape-row">${miniKeys(g.example, g.fingers, hand)}<div><b>${esc(g.title)}</b> <span class="muted small">\u00d7${g.count}</span>${g.fingers ? `<div class="small">Fingers ${g.fingers.join('-')}${g.names.length ? ' \u00b7 ' + esc(g.names.join(', ')) : ''}</div>` : g.names.length ? `<div class="small">${esc(g.names.join(', '))}</div>` : ''}${g.text ? `<div class="muted small">${esc(g.text)}</div>` : ''}</div></div>`).join('')}` : '';
  const shapes = shapeHand('rh', a.shapes.rh) + shapeHand('lh', a.shapes.lh);
  const pats = a.patterns.length ? `<ul class="about-list">${a.patterns.map(x => `<li><b>${esc(x.title)}.</b> ${esc(x.text)}</li>`).join('')}</ul>` : '';
  const first = a.practise.length ? `<div class="row wrap">${a.practise.map(x => `<button class="btn small" data-act="about-loop" data-from="${x.from + 1}" data-to="${x.to + 1}">Loop bars ${x.from + 1}\u2013${x.to + 1}</button>`).join('')}</div>` : '';
  const sub = [keyName(k.key), ch.used.length ? 'chords' : '', (a.shapes.rh.length + a.shapes.lh.length) ? 'fingering' : '', a.patterns.length ? 'tips' : ''].filter(Boolean).join(' \u00b7 ');
  return `<details class="card about-piece"><summary><span>About this piece<small>${esc(sub)}</small></span></summary>
    ${p.about ? `<section><p class="small">${esc(p.about)}</p></section>` : ''}
    <section><h3>The key</h3><p class="small">${esc(keyText)}</p><p class="small"><span class="muted">Notes of the key:</span> ${scaleNotes.map(esc).join(' ')}</p>
      <button class="btn small" data-act="open-key" data-id="${k.key}">${esc(keyName(k.key))} in the library</button></section>
    <section><h3>Notes outside the key</h3>${outside}</section>
    <section><h3>Chords</h3>${chords}</section>
    ${shapes ? `<section><h3>Hand shapes and fingering</h3>${shapes}</section>` : ''}
    ${pats ? `<section><h3>Patterns to spot</h3>${pats}</section>` : ''}
    ${first ? `<section><h3>Start with the busiest bars</h3><p class="small">These bars have the most going on. Learn them slowly first, and the rest will feel easier.</p>${first}</section>` : ''}
  </details>`;
}
/* the beat where a bar starts, and where the chosen section starts and ends */
function paBarStart(b) {
  const evs = pa.rendered.events, inBar = evs.filter(e => e.bar === b);
  if (inBar.length) return Math.min(...inBar.map(e => e.start));
  return Math.max(0, ...evs.map(e => e.start + e.beats));
}
function paSectionBeats() { return [paBarStart(pa.from - 1), paBarStart(pa.to)]; }
function mountPiece(p, spec) {
  const el = $('[data-piece]'); if (!el) return;
  const full = !!ui.paFull;
  const odd = Store.setting('outKey', true) ? outsideKeyTest(p) : null;
  pa.rendered = renderScore(el, spec, { label: p.title, scale: full ? paFitScale() : 1, noteStyle: odd ? x => odd(x) ? OUTKEY_STYLE : null : null });
  pa.line = null;
  const solo = pa.hands === 'rh' || pa.hands === 'lh';
  const evs = pa.rendered.events;
  const inSect = ev => ev.bar >= pa.from - 1 && ev.bar <= pa.to - 1;
  pa.steps = playSteps(evs, null).filter(st => inSect(st.events[0])).map(st => {
    const mine = solo ? st.events.filter(e => e.hand === pa.hands) : st.events;
    const auto = solo ? st.events.filter(e => e.hand !== pa.hands) : [];
    return { start: st.start, events: st.events, mine, auto, midis: mine.flatMap(e => e.midis) };
  });
  pa.token = (pa.token || 0) + 1;
  if (pa.mode === 'wait') pa.steps.slice(0, pa.idx).forEach(st => st.events.forEach(ev => ev.el && ev.el.classList.add('ok')));
  const all = evs.filter(e => !e.rest).flatMap(e => e.midis);
  let lo = Math.min(...all) - 2, hi = Math.max(...all) + 2;
  while (lo % 12 !== 0 && lo % 12 !== 5) lo--; while (hi % 12 !== 4 && hi % 12 !== 11) hi++;
  pa.kb = makeKeyboard($('[data-pa-kb]'), { from: lo, to: hi, minKey: 24, onPress: m => paPress(m) });
  pa.pressed = new Set();
  paDim();
  if (pa.mode === 'wait') paShowStep();
  else {
    const st = pa.steps[0]; if (st) paScrollToLine(st);
    if (!Player.key) paFeedback(`<span class="muted">Press Start${ui.paFull ? ' (the play button)' : ''} when you’re ready. You’ll hear one bar of clicks first.</span>`);
  }
}
function paDim() {
  const solo = pa.hands === 'rh' || pa.hands === 'lh';
  pa.rendered.events.forEach(ev => {
    if (!ev.el) return;
    const out = ev.bar < pa.from - 1 || ev.bar > pa.to - 1;
    ev.el.classList.toggle('dim', out || (solo && ev.hand !== pa.hands));
  });
}
function paFeedback(html) { const fb = $('[data-fb]'); if (fb) fb.innerHTML = html; }
function paShowStep() {
  if (!pa.rendered) return;
  clearMarks(pa.rendered.events, 'hi');
  pa.kb && pa.kb.clear('target');
  const st = pa.steps[pa.idx];
  if (!st) return;
  st.events.forEach(ev => ev.el && ev.el.classList.add('hi'));
  paScrollToLine(st);
  if (!st.midis.length) return paAutoStep(st);
  if (pa.hint) st.midis.forEach(m => pa.kb.mark(m, 'target'));
  paFollow(st);
}
/* when the music moves to a new line, bring that line to the top so you can read ahead */
function paScrollToLine(st) {
  const ev = st.events[0], paper = $('.piece-paper'), r = pa.rendered;
  if (!ev || !paper || !r.lineTops || ev.line === undefined || ev.line === pa.line) return;
  const first = pa.line === null;
  pa.line = ev.line;
  const svgTop = r.svg.getBoundingClientRect().top - paper.getBoundingClientRect().top + paper.scrollTop;
  const top = Math.max(0, svgTop + r.lineTops[ev.line] - 6);
  if (first && ev.line === 0) { paper.scrollTop = 0; return; }
  try { paper.scrollTo({ top, behavior: first ? 'auto' : 'smooth' }); } catch (e) { paper.scrollTop = top; }
}
/* full screen: size the music to the screen, keeping at least a system and a half in view */
function paFitScale() { const w = window.innerWidth, h = window.innerHeight; return Math.max(0.7, Math.min(Math.max(w / 900, 0.85), h / 320, 1.6)); }
function paKbOn() { return ui.paKb !== null ? ui.paKb : !(ui.paFull && Midi.status === 'ready'); }
function paSetFull(on) {
  ui.paFull = on; ui.paKb = null;
  const d = document, root = d.documentElement;
  try {
    if (on && root.requestFullscreen && !d.fullscreenElement) root.requestFullscreen().catch(() => {});
    else if (!on && d.fullscreenElement && d.exitFullscreen) d.exitFullscreen().catch(() => {});
  } catch (e) {}
  render();
}
function midiChip() {
  if (Midi.status === 'ready') return `<button class="chip midi-chip on" data-act="midi-info" title="${esc(Midi.inputs.join(', '))}">${ICON.midi}<span>${esc(Midi.inputs[0])}</span></button>`;
  if (Midi.status === 'waiting') return `<button class="chip midi-chip" data-act="midi-info">${ICON.midi}<span>No keyboard found</span></button>`;
  return `<button class="btn small" data-act="midi-connect">${ICON.midi} MIDI keyboard</button>`;
}
function paPress(m) {
  if (!pa || !pa.steps) return;
  if (pa.mode === 'perform') { if (pa.perf && pa.perf.running) perfPress(m); return; }
  if (pa.done) return;
  const st = pa.steps[pa.idx]; if (!st) return;
  if (!pa.started) pa.started = Date.now();
  if (st.midis.includes(m)) {
    pa.pressed.add(m);
    pa.kb.flash(m, 'ok', 300);
    paFollow(st);
    if (st.midis.every(x => pa.pressed.has(x))) {
      st.mine.forEach(ev => { ev.el && ev.el.classList.add(ev.missed ? 'late' : 'ok'); });
      paPlayAuto(st);
      paNext();
    }
  } else {
    if (st.auto.some(e => e.midis.includes(m)) || otherHandNotes().includes(m)) return; // playing the app's hand along is fine
    pa.errors++;
    st.mine.forEach(ev => ev.missed = true);
    pa.kb.flash(m, 'bad', 450);
    paFeedback(`<span class="bad">Wrong key</span> <span class="muted">Look again: ${st.events.map(e => e.pitches.map(label).join(' + ')).join(', ')} is ${st.midis.length > 1 ? 'a chord' : 'the next note'}${st.mine.length > 1 ? ', both hands at once' : ''}.</span>`);
    setTimeout(() => { const f = $('[data-fb]'); if (f && /Wrong key/.test(f.textContent)) f.textContent = ''; }, 1600);
  }
}
/* keep the next key you need on screen: wide chords may not fit on a phone */
function paFollow(st) {
  const left = st.midis.filter(x => !pa.pressed.has(x)).sort((a, b) => a - b);
  if (!left.length || !pa.kb) return;
  pa.kb.ensureVisible(left[left.length - 1]);
  pa.kb.ensureVisible(left[0]);
}
function paNext() {
  pa.idx++; pa.pressed = new Set();
  if (pa.idx >= pa.steps.length) {
    if (pa.loop) {
      pa.loops++;
      setTimeout(() => {
        if (!pa || pa.mode !== 'wait' || !$('[data-piece]')) return;
        pa.idx = 0; pa.line = null;
        pa.steps.forEach(st => st.events.forEach(ev => { ev.missed = false; ev.el && ev.el.classList.remove('ok', 'late', 'bad'); }));
        paFeedback(`<span class="good">Loop ${pa.loops} done</span> <span class="muted">${pa.errors} wrong key${pa.errors === 1 ? '' : 's'} so far. Go again.</span>`);
        paShowStep();
      }, 500);
      return;
    }
    return paFinish();
  }
  paShowStep();
}
/* the hand you're not practising: the app plays it for you */
function paPlayAuto(st) {
  if (!pa.backing) return;   // practising one hand on its own: the other hand stays silent
  const c = st.auto.length && Piano.ensure(); if (!c) return;
  const sec = 60 / pa.bpm, t = c.currentTime + 0.01;
  st.auto.forEach(ev => {
    const dur = Math.min(4, Math.max(0.2, soundingBeats(pa.rendered.events, ev) * sec * 0.96));
    ev.midis.forEach(m => Piano.note(m, t, { gain: 0.6, dur }));
    ev.el && ev.el.classList.add('ok');
  });
}
/* a step with nothing for you to play: wait for the beat, play it, move on */
function paAutoStep(st) {
  if (!pa.started) {
    const other = pa.hands === 'lh' ? 'right' : 'left';
    paFeedback(`<span class="muted">The ${other} hand starts on its own.</span> <button class="btn small primary" data-act="pa-go">Start</button>`);
    return;
  }
  const tok = pa.token, prev = pa.steps[pa.idx - 1];
  const sec = 60 / pa.bpm;
  const wait = prev ? Math.min(1.2, Math.max(0.15, (st.start - prev.start) * sec)) : 0.4;
  setTimeout(() => {
    if (!pa || pa.token !== tok || pa.done || pa.steps[pa.idx] !== st || !$('[data-piece]')) return;
    paPlayAuto(st);
    paNext();
  }, wait * 1000);
}
function paFinish() {
  pa.done = true;
  const n = pa.steps.filter(s => s.midis.length).length || 1, acc = Math.max(0, Math.round((n - pa.errors) / n * 100));
  const stars = acc >= 98 ? 3 : acc >= 85 ? 2 : 1;
  Store.addPractice((Date.now() - (pa.started || Date.now())) / 60000);
  pa.kb && pa.kb.clear('target');
  if (!paWhole()) { paFeedback(`<span class="good">Bars ${pa.from}–${pa.to} done</span> <span class="muted">${acc}% right first time. Turn on Loop to repeat them, or choose Whole piece for stars.</span>`); return; }
  Store.setPiece(pa.id, stars, acc);
  paFeedback(`<span class="good">${starsText(stars)} Finished</span> <span class="muted">${acc}% accuracy · ${pa.errors} wrong key${pa.errors === 1 ? '' : 's'}. ${stars < 3 ? 'Tap Restart to go again for three stars.' : 'Now try Play in time.'}</span>`);
}
function paListen() {
  if (!pa || !pa.rendered) return;
  if (Player.key === 'pa') { Player.stop(); return; }
  if (!Piano.ensure()) return;
  const p = getPiece(pa.id), [from, to] = paSectionBeats();
  const solo = (pa.hands === 'rh' || pa.hands === 'lh') && !pa.backing;
  Player.play('pa', scoreBuilder(pa.rendered, () => pa.bpm, { swing: !!p.swing, from, to, hands: solo ? [pa.hands] : null, onNote: (ev, on) => { ev.midis.forEach(m => pa.kb && pa.kb.mark(m, 'lit', on)); if (on) paScrollToLine({ events: [ev] }); } }),
    { loop: pa.loop, onStop: () => { clearMarks(pa.rendered.events, 'hi'); pa.kb && pa.kb.clear('lit'); pa.line = null; paListenBtn(false); if (pa.mode === 'wait') paShowStep(); } });
  paListenBtn(true);
}
function paListenBtn(playing) {
  $$('[data-act="pa-listen"]').forEach(b => {
    if (b.classList.contains('fs-btn')) { b.innerHTML = playing ? ICON.stop : ICON.play; b.setAttribute('aria-label', playing ? 'Stop' : 'Play'); }
    else b.innerHTML = `${playing ? ICON.stop : ICON.ear}<span class="lbl"> ${playing ? 'Stop' : 'Listen'}</span>`;
  });
}
function paPerfBtn(playing) {
  $$('[data-act="pa-perform"]').forEach(b => {
    if (b.classList.contains('fs-btn')) { b.innerHTML = playing ? ICON.stop : ICON.play; b.setAttribute('aria-label', playing ? 'Stop' : 'Start playing in time'); }
    else b.innerHTML = playing ? `${ICON.stop} Stop` : `${ICON.play} Start`;
  });
}

/* ---------- Play in time: the music moves on its own and your timing is scored ---------- */
function paPerform() {
  if (Player.key === 'pa-perf') { Player.stop(); return; }
  const c = Piano.ensure(); if (!c || !pa || !pa.rendered) return;
  const p = getPiece(pa.id), spb = 60 / pa.bpm, tb = timeBeats(p.time);
  const sw = b => p.swing ? swingBeat(b) : b;
  const [b0, b1] = paSectionBeats();
  clearMarks(pa.rendered.events); paDim(); pa.kb.clear('target'); pa.line = null;
  const lat = (Store.setting('tapOffset', 0) || 0) / 1000;
  const perf = pa.perf = { running: true, recs: [], extra: 0, lat, micWait: Mic.status === 'on' ? 0.3 : 0, win: Math.min(0.3, spb * 0.5), good: Math.min(0.1, spb * 0.22), started: Date.now() };
  const countBeats = Math.max(2, Math.round(tb));
  Player.play('pa-perf', (t0, sess) => {
    for (let k = 0; k < countBeats; k++) {
      Piano.click(t0 + k * spb, k === 0);
      perfAt(sess, t0 + k * spb, () => paFeedback(`<span class="count-in">${k + 1}</span> <span class="muted">${k === countBeats - 1 ? 'Go…' : 'Count-in'}</span>`));
    }
    const T = t0 + countBeats * spb;
    if (pa.click) for (let b = Math.ceil(b0 - 1e-6); b < b1 - 1e-6; b++) Piano.click(T + (b - b0) * spb, Math.abs((b % tb)) < 1e-6);
    pa.steps.forEach(st => {
      const t = T + (sw(st.start) - sw(b0)) * spb;
      const rec = { st, t, need: new Set(st.midis), hit: new Map(), judged: false };
      perf.recs.push(rec);
      if (pa.backing) st.auto.forEach(ev => {
        const d = Math.max(0.15, (sw(st.start + soundingBeats(pa.rendered.events, ev)) - sw(st.start)) * spb * 0.96);
        ev.midis.forEach(m => Piano.note(m, t, { gain: 0.6, dur: Math.min(4, d) }));
      });
      perfAt(sess, t, () => {   // show it when it is heard, not when it is scheduled
        if (st === pa.steps[0]) paFeedback('');
        st.events.forEach(ev => ev.el && ev.el.classList.add('hi'));
        paScrollToLine(st);
        if (pa.hint) st.midis.forEach(m => pa.kb.mark(m, 'target'));
        if (st.midis.length) { pa.kb.ensureVisible(Math.max(...st.midis)); pa.kb.ensureVisible(Math.min(...st.midis)); }
      });
      perfAt(sess, t + lat + perf.win + 0.02 + perf.micWait, () => perfJudge(rec));
    });
    perf.end = T + (sw(b1) - sw(b0)) * spb;
    return perf.end - t0 + perf.win + lat + perf.micWait + Piano.latency();
  }, { onStop: () => perfEnd() });
  paPerfBtn(true);
}
/* run fn when audio-clock time t is actually heard */
/* events follow the audio clock itself (checked every few ms), so they stay in step even if the clock drifts */
let perfQueue = [], perfTimer = 0;
function perfAt(sess, t, fn) {
  perfQueue.push({ t, fn, sess }); perfQueue.sort((a, b) => a.t - b.t);
  if (!perfTimer) perfTimer = setInterval(() => {
    const now = Piano.heardNow();
    while (perfQueue.length && (perfQueue[0].t <= now || Player.key !== 'pa-perf')) { const e = perfQueue.shift(); if (Player.key === 'pa-perf') e.fn(); }
    if (!perfQueue.length) { clearInterval(perfTimer); perfTimer = 0; }
  }, 8);
}
function perfPress(m) {
  const perf = pa.perf, c = Piano.ctx; if (!c) return;
  const t = (noteInputTime !== null ? noteInputTime : Piano.heardNow()) - perf.lat;
  let best = null, bd = Infinity;
  perf.recs.forEach(rec => {
    if (rec.judged || !rec.need.has(m) || rec.hit.has(m)) return;
    const d = t - rec.t;
    if (Math.abs(d) <= perf.win && Math.abs(d) < Math.abs(bd)) { best = rec; bd = d; }
  });
  if (best) { best.hit.set(m, bd); pa.kb.flash(m, Math.abs(bd) <= perf.good ? 'ok' : 'lit', 250); return; }
  const near = perf.recs.some(rec => Math.abs(t - rec.t) <= perf.win && rec.st.auto.some(e => e.midis.includes(m)));
  if (near) return; // joining in with the app's hand is fine
  perf.extra++; pa.kb.flash(m, 'bad', 300);
}
function perfJudge(rec) {
  if (rec.judged) return;
  rec.judged = true;
  rec.st.events.forEach(ev => ev.el && ev.el.classList.remove('hi'));
  rec.st.midis.forEach(m => pa.kb.mark(m, 'target', false));
  if (!rec.need.size) return;
  const ds = [...rec.hit.values()], all = ds.length === rec.need.size;
  const avg = ds.length ? ds.reduce((a, b) => a + b, 0) / ds.length : 0;
  const cls = !all ? 'bad' : Math.abs(avg) <= pa.perf.good ? 'ok' : avg < 0 ? 'early' : 'late';
  rec.st.mine.forEach(ev => ev.el && ev.el.classList.add(cls));
}
function perfEnd() {
  const perf = pa && pa.perf; if (!perf || !perf.running) return;
  perf.running = false;
  paPerfBtn(false);
  pa.kb && pa.kb.clear('target');
  const c = Piano.ctx, completed = c && Piano.heardNow() >= perf.end - 0.1;
  if (!completed) { clearMarks(pa.rendered.events, 'hi'); paFeedback('<span class="muted">Stopped. Press Start to try again.</span>'); return; }
  perf.recs.forEach(perfJudge);
  const total = perf.recs.reduce((a, r) => a + r.need.size, 0) || 1;
  const hits = perf.recs.flatMap(r => [...r.hit.values()]);
  const onTime = hits.filter(d => Math.abs(d) <= perf.good).length;
  const notePct = Math.round(hits.length / total * 100), timePct = Math.round(onTime / total * 100);
  const mean = hits.length ? hits.reduce((a, b) => a + b, 0) / hits.length : 0;
  const score = Math.max(0, Math.min(100, Math.round(0.55 * notePct + 0.45 * timePct - perf.extra / total * 25)));
  Store.addPractice((Date.now() - perf.started) / 60000);
  const whole = paWhole(), isBest = whole && Store.setBest('perf-' + pa.id, score);
  const tend = Math.abs(mean) < 0.025 ? 'Your timing is centred well.' : `You tend to play ${mean < 0 ? 'early (rushing)' : 'late (dragging)'} by about ${Math.round(Math.abs(mean) * 1000)} ms.`;
  paFeedback(`<span class="good">${score}%${isBest ? ' · new best' : ''}</span> <span class="muted">Notes ${notePct}% · on time ${timePct}%${perf.extra ? ` · ${perf.extra} extra note${perf.extra === 1 ? '' : 's'}` : ''}. ${tend}${pa.bpm < getPiece(pa.id).bpm ? ' Speed up a little when you score over 90%.' : ''}</span>`);
  if (pa.loop) setTimeout(() => { if (pa && pa.mode === 'perform' && $('[data-piece]') && !Player.key) paPerform(); }, 2500);
}

/* ---------- Library ---------- */
function libSeg() {
  const t = ui.libTab;
  return `<div class="seg four" role="group" aria-label="Library section">${[['notes', 'Notes'], ['symbols', 'Symbols'], ['keys', 'Keys'], ['rhythms', 'Rhythms']].map(([v, n]) => `<button data-act="lib-tab" data-v="${v}" aria-pressed="${t === v}">${n}</button>`).join('')}</div>`;
}
let finder = { midi: 60, spell: '#' };
function screenLibrary() {
  const t = ui.libTab;
  let body = '';
  if (t === 'notes') {
    mount(mountFinder);
    body = `<p class="muted">Tap any key to see where it is written. Notes around middle C can be written in either clef.</p>
      <div class="paper finder-paper"><div class="score" data-finder></div></div>
      <div class="finder-info" data-finder-info></div>
      <div class="row"><div class="seg mini" role="group"><button data-act="finder-spell" data-v="#" aria-pressed="${finder.spell === '#'}">Sharps</button><button data-act="finder-spell" data-v="b" aria-pressed="${finder.spell === 'b'}">Flats</button></div></div>
      <div class="kb-host" data-finder-kb></div>
      <div class="tbl-wrap"><table><thead><tr><th>Clef</th><th>Lines (bottom up)</th><th>Spaces</th></tr></thead><tbody>
        <tr><td><b>Treble</b></td><td>E G B D F<br><span class="muted small">Every Green Bus Drives Fast</span></td><td>F A C E</td></tr>
        <tr><td><b>Bass</b></td><td>G B D F A<br><span class="muted small">Good Boys Deserve Football Always</span></td><td>A C E G<br><span class="muted small">All Cows Eat Grass</span></td></tr></tbody></table></div>`;
  } else if (t === 'symbols') {
    const q = ui.symQuery.trim().toLowerCase();
    const cat = ui.symCat;
    let list = SYMBOLS;
    if (q) list = list.filter(s => (s.name + ' ' + s.aka + ' ' + s.meaning + ' ' + s.cat).toLowerCase().includes(q));
    else if (cat === 'fav') list = list.filter(s => Store.fav('sym', s.id));
    else if (cat) list = list.filter(s => s.cat === cat);
    mount(() => mountSymbolArt($('.sym-grid')));
    body = `<input type="search" id="sym-search" placeholder="Search ${SYMBOLS.length} symbols and terms" value="${esc(ui.symQuery)}" data-input="sym-search" aria-label="Search symbols">
      <div class="chips" role="group">${[['', 'All'], ['fav', '★ Saved']].concat(SYMBOL_CATS.map(c => [c, c])).map(([v, n]) => `<button class="chip" data-act="sym-cat" data-v="${esc(v)}" aria-pressed="${!q && (cat || '') === v}">${esc(n)}</button>`).join('')}</div>
      ${list.length ? `<div class="sym-grid">${list.map(s => `<button class="sym-card" data-act="open-symbol" data-id="${s.id}">${symbolThumb(s, 56)}<span class="sym-name">${esc(s.name)}</span>${s.aka ? `<span class="sym-aka">${esc(s.aka)}</span>` : ''}</button>`).join('')}</div>` : `<div class="empty">${cat === 'fav' ? 'Tap the star on a symbol to save it here.' : 'Nothing matches that search.'}</div>`}`;
  } else if (t === 'keys') {
    body = `${circleSVG()}<p class="muted small center">Sharps clockwise, flats anticlockwise. Tap a key.</p>
      <div class="list">${MAJOR_KEYS.map(k => `<button class="list-row" data-act="open-key" data-id="${k}"><span class="t">${esc(keyName(k))}</span><span class="lvl">${KEY_SIGS[k] === 0 ? 'none' : Math.abs(KEY_SIGS[k]) + (KEY_SIGS[k] > 0 ? ' ♯' : ' ♭')}</span><span class="d">Relative minor: ${esc(keyName(RELATIVE_MINOR[k]))}</span></button>`).join('')}</div>`;
  } else {
    mount(() => NOTE_VALUES.forEach((v, k) => {
      const a = $(`[data-nv="${k}"]`), r = $(`[data-nr="${k}"]`);
      if (a) renderScore(a, { clef: 'perc', noTime: true, music: v.music }, { width: 84, compact: true, scale: 0.7, noClef: true });
      if (r && v.rest) renderScore(r, { clef: 'perc', noTime: true, music: v.rest }, { width: 84, compact: true, scale: 0.7, noClef: true });
    }));
    body = `<div class="tbl-wrap nv"><table><thead><tr><th>Note</th><th>Rest</th><th>Name</th><th>Beats</th></tr></thead><tbody>${NOTE_VALUES.map((v, k) => `<tr><td><div class="nv-art" data-nv="${k}"></div></td><td><div class="nv-art" data-nr="${k}"></div></td><td><b>${esc(v.uk)}</b><br><span class="muted small">${esc(v.us)}</span></td><td>${esc(v.beats)}</td></tr>`).join('')}</tbody></table></div>
      <div class="section-head"><h2>Practise rhythms</h2></div>
      <div class="list">${RHYTHMS.map(r => `<button class="list-row" data-act="open-rhythm" data-id="${r.id}"><span class="t">${esc(r.title)}</span><span class="lvl">${r.time}</span></button>`).join('')}</div>`;
  }
  mount(() => maybeTour('library'));
  return `${topbar('Library', helpBtn('library') + settingsBtn())}<main>${libSeg()}${body}</main>`;
}
function circleSVG() {
  const order = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
  const minors = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];
  const cx = 150, cy = 150;
  const nice = k => k.replace('#', '♯').replace(/^([A-G])b/, '$1♭').replace('m', 'm');
  let s = `<svg class="circle" viewBox="0 0 300 300" role="img" aria-label="Circle of fifths">
    <circle cx="${cx}" cy="${cy}" r="138" class="c-ring"/><circle cx="${cx}" cy="${cy}" r="92" class="c-ring2"/><circle cx="${cx}" cy="${cy}" r="52" class="c-hub"/>`;
  order.forEach((k, i) => {
    const a = (i * 30 - 90) * Math.PI / 180, x = cx + Math.cos(a) * 116, y = cy + Math.sin(a) * 116;
    const xm = cx + Math.cos(a) * 72, ym = cy + Math.sin(a) * 72;
    const n = KEY_SIGS[k];
    s += `<a href="#" data-act="open-key" data-id="${k}" aria-label="${esc(keyName(k))}"><circle cx="${x}" cy="${y}" r="20" class="c-key"/><text x="${x}" y="${y + 6}" class="c-maj" text-anchor="middle">${nice(k)}</text></a>`;
    s += `<text x="${xm}" y="${ym + 4}" class="c-min" text-anchor="middle">${nice(minors[i])}</text>`;
    const lx = cx + Math.cos(a) * 146, ly = cy + Math.sin(a) * 146;
    if (n) s += `<text x="${lx}" y="${ly + 3}" class="c-count" text-anchor="middle">${Math.abs(n)}${n > 0 ? '♯' : '♭'}</text>`;
  });
  return s + `<text x="${cx}" y="${cy - 4}" class="c-hubt" text-anchor="middle">Circle of</text><text x="${cx}" y="${cy + 12}" class="c-hubt" text-anchor="middle">fifths</text></svg>`;
}
function mountFinder() {
  const host = $('[data-finder-kb]'); if (!host) return;
  const kb = makeKeyboard(host, { from: 33, to: 96, minKey: 24, labels: 'c', onPress: m => { finder.midi = m; drawFinder(kb); } });
  setTimeout(() => kb.showMidi(finder.midi), 30);
  drawFinder(kb);
}
function drawFinder(kb) {
  const m = finder.midi, p = midiToPitch(m, finder.spell);
  kb.clear('sel'); kb.mark(m, 'sel');
  const inTreble = m >= 57, inBass = m <= 64;
  const el = $('[data-finder]');
  renderScore(el, { clef: 'grand', noTime: true, rh: inTreble ? p + ':w' : 'x:w', lh: inBass ? p + ':w' : 'x:w' }, { width: Math.min(300, el.clientWidth || 300) });
  const info = $('[data-finder-info]');
  info.innerHTML = `<b>${esc(label(p))}</b><span>${esc(describePosition(p))}</span>`;
}
function describePosition(p) {
  const x = parsePitch(p), out = [];
  const pos = (clef) => {
    const bottom = clef === 'treble' ? { l: 'e', o: 4 } : { l: 'g', o: 2 };
    const steps = (x.oct * 7 + LETTERS.indexOf(x.letter)) - (bottom.o * 7 + LETTERS.indexOf(bottom.l));
    const name = clef === 'treble' ? 'treble' : 'bass';
    if (steps >= 0 && steps <= 8) return steps % 2 === 0 ? `line ${steps / 2 + 1} of the ${name} stave` : `space ${(steps + 1) / 2} of the ${name} stave`;
    if (steps < 0) { const n = Math.ceil(-steps / 2); return steps % 2 === 0 ? `${n} ledger line${n > 1 ? 's' : ''} below the ${name} stave` : (n === 1 ? `just below the ${name} stave` : `below ${n - 1} ledger line${n > 2 ? 's' : ''} under the ${name} stave`); }
    const k = steps - 8, n = Math.ceil(k / 2);
    return k % 2 === 0 ? `${n} ledger line${n > 1 ? 's' : ''} above the ${name} stave` : (n === 1 ? `just above the ${name} stave` : `above ${n - 1} ledger line${n > 2 ? 's' : ''} over the ${name} stave`);
  };
  if (x.midi >= 57) out.push('Treble: ' + pos('treble'));
  if (x.midi <= 64) out.push('Bass: ' + pos('bass'));
  if (x.midi === 60) out.unshift('Middle C');
  return out.join(' · ');
}
function screenSymbol(id) {
  const s = SYMBOL_BY_ID[id]; if (!s) return screenLibrary();
  const blk = s.ex ? renderBlock({ t: 'score', title: 'Example', spec: s.ex, bpm: 80 }) : '';
  mount(() => mountSymbolArt($('.sym-hero')));
  return `${topbar(s.name)}<main>
    <div class="row sym-hero">${symbolThumb(s, 96)}<div style="flex:1;min-width:0"><div class="eyebrow">${esc(s.cat)}</div><h1 class="display">${esc(s.name)}</h1>${s.aka ? `<div class="muted">${esc(s.aka)}</div>` : ''}</div>
      <button class="star" data-act="fav" data-kind="sym" data-id="${s.id}" aria-pressed="${Store.fav('sym', s.id)}" aria-label="Save symbol">${Store.fav('sym', s.id) ? ICON.starOn : ICON.star}</button></div>
    <p class="lead">${esc(s.meaning)}</p>${blk}</main>`;
}
function screenKey(k) {
  if (!(k in KEY_SIGS)) return screenLibrary();
  const minor = /m$/.test(k), n = KEY_SIGS[k];
  const major = minor ? Object.keys(RELATIVE_MINOR).find(x => RELATIVE_MINOR[x] === k) : k;
  const accs = n > 0 ? SHARP_ORDER.slice(0, n).map(l => l.toUpperCase() + '♯') : FLAT_ORDER.slice(0, -n).map(l => l.toUpperCase() + '♭');
  const lowOct = /^[AB]/.test(k) ? 2 : 3;
  const scaleSpec = (steps, title) => {
    const rh = minor ? scaleFrom(k, 4, steps) : majorScale(k, 4), lh = minor ? scaleFrom(k, lowOct, steps) : majorScale(k, lowOct);
    const bar = arr => arr.slice(0, 4).map(p => p + ':q').join(' ') + ' | ' + arr.slice(4).map(p => p + ':q').join(' ') + ' FIN';
    return renderBlock({ t: 'score', title, spec: { clef: 'grand', key: k, time: '4/4', rh: bar(rh), lh: bar(lh) }, bpm: 84 });
  };
  const names = steps => (minor ? scaleFrom(k, 4, steps) : majorScale(k, 4)).map(label).map(s => s.replace(/\d/, '')).join(' ');
  if (minor) {
    const lead = scaleFrom(k, 4, HARMONIC_MINOR_STEPS)[6];
    return `${topbar(keyName(k))}<main>
    <div><div class="eyebrow">Key signature</div><h1 class="display">${esc(keyName(k))}</h1></div>
    <dl class="kv"><dt>${n >= 0 ? 'Sharps' : 'Flats'}</dt><dd>${accs.length ? accs.join(' ') : 'None'}</dd><dt>Relative major</dt><dd><button class="linkish" data-act="open-key" data-id="${major}">${esc(keyName(major))}</button></dd><dt>Natural minor</dt><dd>${names(MINOR_STEPS)}</dd><dt>Harmonic minor</dt><dd>${names(HARMONIC_MINOR_STEPS)}</dd></dl>
    ${scaleSpec(MINOR_STEPS, 'Natural minor, hands together')}
    ${scaleSpec(HARMONIC_MINOR_STEPS, 'Harmonic minor, hands together')}
    <div class="tip">${esc(keyName(k))} shares its key signature with ${esc(keyName(major))}. In the music you’ll often see ${esc(label(lead).replace(/\d/, ''))} written with an accidental: that’s the raised 7th (the leading note), which pulls back up to ${esc(keyName(k).replace(' minor', ''))}. If a piece ends on ${esc(keyName(k).replace(' minor', ''))} and has lots of ${esc(label(lead).replace(/\d/, ''))}, it’s in ${esc(keyName(k))} rather than ${esc(keyName(major))}.</div></main>`;
  }
  return `${topbar(keyName(k))}<main>
    <div><div class="eyebrow">Key signature</div><h1 class="display">${esc(keyName(k))}</h1></div>
    <dl class="kv"><dt>${n >= 0 ? 'Sharps' : 'Flats'}</dt><dd>${accs.length ? accs.join(' ') : 'None'}</dd><dt>Relative minor</dt><dd><button class="linkish" data-act="open-key" data-id="${RELATIVE_MINOR[k]}">${esc(keyName(RELATIVE_MINOR[k]))}</button></dd><dt>Scale</dt><dd>${names()}</dd></dl>
    ${scaleSpec(null, 'Scale, hands together')}
    <div class="tip">${n > 0 ? `The last sharp is ${accs[accs.length - 1]}; a semitone above it is ${keyName(k).replace(' major', '')}.` : n < 0 ? (n === -1 ? 'One flat is F major: worth simply remembering.' : `The second-to-last flat is ${accs[accs.length - 2]}, which names the key.`) : 'No sharps or flats: only white keys.'}</div></main>`;
}

/* ---------- Premium ---------- */
function isPremium() {
  if (Premium.mode === 'store') return Premium.active;
  if (Premium.mode === 'unconfigured') return true;          // an app build without store keys: everything open for testing
  return Store.setting('demoPremium', false) || !Store.setting('previewFree', false);
}
const lessonLocked = l => !isPremium() && !FREE_RULES.levels.includes(l.level);
const pieceLocked = p => !isPremium() && !p.mine && p.level > FREE_RULES.pieceLevels;
function paywall(reason) {
  if (route.view === 'premium') return;
  ui.payReason = reason; ui.payPick = null;
  go({ tab: route.tab, view: 'premium' });
  Premium.loadOffering().then(() => { if (route.view === 'premium') render(); });
}
// a stand-in for the store in the browser preview, so the upgrade screen can be seen and tried
const DEMO_OFFERING = { availablePackages: [
  { identifier: '$rc_annual', packageType: 'ANNUAL', product: { priceString: '£39.99', pricePerMonthString: '£3.33', introPrice: { periodNumberOfUnits: 7, periodUnit: 'DAY', price: 0 } } },
  { identifier: '$rc_monthly', packageType: 'MONTHLY', product: { priceString: '£4.99', introPrice: null } }
] };
const PAY_REASONS = {
  lessons: 'The Intermediate and Advanced courses are part of Premium.',
  pieces: 'This piece is part of Premium.',
  reading: 'Reading sheet music from photos and PDFs is part of Premium.',
  songs: `The free version keeps ${FREE_RULES.songs === 1 ? 'one song' : FREE_RULES.songs + ' songs'} in My songs. Premium keeps as many as you like.`
};
function packageLabel(p) {
  const t = p.packageType;
  return t === 'ANNUAL' ? 'Yearly' : t === 'MONTHLY' ? 'Monthly' : t === 'SIX_MONTH' ? 'Every 6 months' : t === 'THREE_MONTH' ? 'Every 3 months' : t === 'WEEKLY' ? 'Weekly' : t === 'LIFETIME' ? 'Lifetime' : (p.product && p.product.title) || 'Premium';
}
function trialText(p) {
  const i = p.product && p.product.introPrice;
  if (!i || i.price !== 0) return '';
  const unit = { DAY: 'day', WEEK: 'week', MONTH: 'month', YEAR: 'year' }[i.periodUnit] || 'day';
  return `${i.periodNumberOfUnits}-${unit} free trial`;
}
function screenPremium() {
  const live = Premium.mode === 'store', offering = live ? Premium.offering : DEMO_OFFERING;
  const pkgs = offering ? offering.availablePackages : [];
  const pick = pkgs.find(p => p.identifier === ui.payPick) || pkgs.find(p => p.packageType === 'ANNUAL') || pkgs[0];
  if (pick) ui.payPick = pick.identifier;
  const songsLine = 'Help me play: read your own sheet music from photos and PDFs, ' + ((window.READ_PLAY_CONFIG && window.READ_PLAY_CONFIG.monthlyPages) || 20) + ' pages a month';
  const perks = ['The full course: all ' + ALL_LESSONS.length + ' lessons, from first notes to advanced pieces', 'Every piece to play along with, in every style', songsLine, 'Unlimited songs from MusicXML and MIDI files'];
  const cfg = window.READ_PLAY_CONFIG || {};
  const trial = pick ? trialText(pick) : '';
  const opts = pkgs.map(p => {
    const yearly = p.packageType === 'ANNUAL', save = yearly && p.product.pricePerMonthString ? `${p.product.pricePerMonthString} a month` : '';
    return `<button class="pay-opt" data-act="premium-pick" data-id="${esc(p.identifier)}" aria-pressed="${p === pick}"><span class="pay-radio" aria-hidden="true"></span><span class="pay-t"><b>${esc(packageLabel(p))}</b>${trialText(p) ? `<small>${esc(trialText(p))}</small>` : ''}</span><span class="pay-p"><b>${esc(p.product.priceString)}</b>${save ? `<small>${esc(save)}</small>` : ''}</span></button>`;
  }).join('');
  const store = /android/i.test(navigator.userAgent) ? 'Google Play account' : 'Apple ID';
  return `${topbar('Premium')}<main class="pay-main">
    <section class="pay-hero"><div class="eyebrow">Read &amp; Play Premium</div><h1 class="display">Everything, for as long as you’re learning</h1>
      ${ui.payReason && PAY_REASONS[ui.payReason] ? `<p class="muted">${esc(PAY_REASONS[ui.payReason])}</p>` : ''}</section>
    <ul class="pay-perks">${perks.map(x => `<li>${ICON.check}<span>${esc(x)}</span></li>`).join('')}</ul>
    ${isPremium() && (live || Store.setting('demoPremium', false)) ? `<div class="tip">You have Premium. Thank you for supporting Read &amp; Play.</div>` : pkgs.length ? `<div class="pay-opts" role="group" aria-label="Choose a plan">${opts}</div>
      <button class="btn primary block pay-go" data-act="premium-buy"${ui.payBusy ? ' disabled' : ''}>${ui.payBusy ? 'One moment…' : trial ? 'Start ' + esc(trial) : 'Continue'}</button>
      <p class="muted small pay-fine">${trial ? `Free for the trial, then ${esc(pick.product.priceString)} ${pick.packageType === 'ANNUAL' ? 'a year' : pick.packageType === 'MONTHLY' ? 'a month' : ''}. ` : ''}Payment is taken from your ${store}. The subscription renews automatically unless you cancel at least 24 hours before the end of the current period, which you can do any time in your ${store} settings.</p>`
      : `<div class="tip">${live ? 'Plans couldn’t be loaded. Check your connection and try again.' : 'Plans appear here in the App Store and Google Play apps.'}</div>`}
    ${live ? '' : '<p class="muted small center">This is a preview of the upgrade screen. Prices shown are examples and nothing is charged.</p>'}
    <div class="row wrap pay-links"><button class="btn small ghost" data-act="premium-restore">Restore purchases</button>${cfg.termsUrl ? `<a class="btn small ghost" href="${esc(cfg.termsUrl)}" target="_blank" rel="noopener">Terms of use</a>` : ''}${cfg.privacyUrl ? `<a class="btn small ghost" href="${esc(cfg.privacyUrl)}" target="_blank" rel="noopener">Privacy policy</a>` : ''}</div>
  </main>`;
}
async function premiumBuy() {
  const live = Premium.mode === 'store', pkgs = (live ? (Premium.offering || {}).availablePackages : DEMO_OFFERING.availablePackages) || [];
  const pkg = pkgs.find(p => p.identifier === ui.payPick); if (!pkg) return;
  if (!live) { Store.setSetting('demoPremium', true); toast('Preview: Premium switched on. Nothing was charged.'); back(); return; }
  ui.payBusy = true; render();
  try {
    const r = await Premium.buy(pkg);
    ui.payBusy = false;
    if (r === 'done') { toast('Welcome to Premium'); back(); return; }
    if (r === 'pending') toast('Your purchase is waiting for approval');
  } catch (e) { ui.payBusy = false; toast(e.message); }
  render();
}
function premiumCard() {
  const m = Premium.mode;
  if (m === 'store') {
    const until = Premium.expires ? new Date(Premium.expires).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    return `<section class="card stack"><div class="eyebrow">Premium</div>
      <p class="small" style="margin:0">${Premium.active ? (until ? (Premium.willRenew === false ? `Premium until ${until}. It won’t renew.` : `Premium. Renews on ${until}.`) : 'Premium, for life.') : 'You’re using the free version.'}</p>
      <div class="row wrap">${Premium.active ? '<button class="btn small" data-act="premium-manage">Manage subscription</button>' : '<button class="btn primary small" data-act="premium">See Premium</button>'}<button class="btn small" data-act="premium-restore">Restore purchases</button></div></section>`;
  }
  if (m === 'unconfigured') return `<section class="card stack"><div class="eyebrow">Premium</div><p class="muted small" style="margin:0">Store keys aren’t set in this build, so everything is unlocked. Add the RevenueCat keys to src/config.app.js.</p></section>`;
  const free = !isPremium();
  return `<section class="card stack"><div class="eyebrow">Premium</div>
    <p class="small" style="margin:0">${free ? 'Showing the free version: Premium lessons, pieces and photo reading are locked.' : 'Everything is unlocked in this preview. In the App Store and Google Play apps, the Intermediate and Advanced courses, pieces above level ' + FREE_RULES.pieceLevels + ' and photo reading are Premium.'}</p>
    <div class="row wrap"><button class="toggle" data-act="premium-preview-free" aria-pressed="${free}">Try the free version</button><button class="btn small" data-act="premium">See the upgrade screen</button></div></section>`;
}

/* ---------- Settings ---------- */
const LOOKS = [
  { id: 'grand', name: 'Concert Grand', desc: 'Black lacquer, ivory and gold', sw: ['#0F0E0D', '#F4EEDF', '#C9A23F'] },
  { id: 'minimal', name: 'Minimal', desc: 'Soft white, charcoal type', sw: ['#F4F2EE', '#3A3835', '#E2DED6'] }
];
function applyLook() {
  const id = Store.setting('look', 'grand');
  const lk = LOOKS.find(x => x.id === id) || LOOKS[0];
  document.documentElement.dataset.look = lk.id;
  let m = document.querySelector('meta[name="theme-color"]');
  if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
  m.content = lk.sw[0];
  if (NativeStatusBar) NativeStatusBar.setStyle({ style: lk.id === 'minimal' ? 'LIGHT' : 'DARK' }).catch(() => {});
}
function screenSettings() {
  const look = Store.setting('look', 'grand'), labels = Store.setting('kbLabels', 'c'), off = Store.setting('tapOffset', 0);
  return `${topbar('Settings')}<main>
    <section class="card stack"><div class="eyebrow">Look</div>
      <div class="look-picks">${LOOKS.map(l => `<button class="look-pick" data-act="set-look" data-v="${l.id}" aria-pressed="${look === l.id}"><span class="sw" aria-hidden="true"><i style="background:${l.sw[0]}"></i><span><i style="background:${l.sw[1]}"></i><i style="background:${l.sw[2]}"></i></span></span><b>${l.name}</b><small>${l.desc}</small></button>`).join('')}</div></section>
    <section class="card stack"><div class="eyebrow">Key labels</div>
      <div class="chips">${[['none', 'None'], ['c', 'C only'], ['all', 'All white keys']].map(([v, n]) => `<button class="chip" data-act="set-labels" data-v="${v}" aria-pressed="${labels === v}">${n}</button>`).join('')}</div>
      <p class="muted small">Drills never show full labels, so you are always reading from the page.</p></section>
    <section class="card stack"><div class="eyebrow">Tap timing</div>
      <div class="row"><input type="range" id="tap-offset" min="-150" max="150" step="5" value="${off}" data-input="tap-offset" aria-label="Tap timing adjustment"><b class="tabular" data-off>${off > 0 ? '+' : ''}${off} ms</b></div>
      <p class="muted small">If rhythm scores say you are always late, move this to the right; always early, to the left. Bluetooth headphones usually need +150.</p></section>
    <section class="card stack" id="midi"><div class="eyebrow">MIDI keyboard</div>
      <p class="small" data-midi-status>${midiStatusText()}</p>
      <div class="row">${Midi.status === 'ready' || Midi.status === 'waiting' ? `<button class="btn small" data-act="midi-disconnect">Disconnect</button>` : `<button class="btn primary small" data-act="midi-connect"${Midi.supported ? '' : ' disabled'}>${ICON.midi} Connect</button>`}${Midi.canPairBluetooth ? `<button class="btn small" data-act="midi-bluetooth">Pair a Bluetooth keyboard</button>` : ''}<span class="muted small" data-midi-last></span></div>
      <label class="check inline"><input type="checkbox" data-change="midi-sound"${Store.setting('midiSound', true) ? ' checked' : ''}><span>Play the app's piano sound when you play</span></label>
      <p class="muted small">Turn the sound off if your keyboard has its own speakers. When connected, everything you play counts: pieces, note drills and rhythm tapping.</p>
      <p class="muted small">${IS_NATIVE ? 'USB is the most reliable (on an iPhone or iPad you need Apple\u2019s USB camera adapter). For a Bluetooth keyboard, switch on its Bluetooth, tap Pair a Bluetooth keyboard and choose it from the list.' : 'USB is the most reliable. A Bluetooth keyboard has to be paired before you press Connect: on a Mac, in Audio MIDI Setup (Window, Show MIDI Studio, then the Bluetooth button); on Android, with a Bluetooth MIDI app. MIDI works in Chrome and Edge on a computer and Chrome on Android. Safari, iPhone and iPad browsers can\u2019t use MIDI keyboards, but the Read & Play app can.'}</p></section>
    <section class="card stack" id="mic"><div class="eyebrow">Microphone</div>
      <p class="small">${micStatusText()}</p>
      <div class="row">${micChip()}${Mic.status === 'on' ? `<div class="mic-meter" aria-hidden="true"><i data-mic-meter></i></div><span class="muted small" data-mic-heard></span>` : ''}</div>
      <div class="opt"><div class="opt-l">Sensitivity</div><div class="chips" role="group">${[['low', 'Less'], ['normal', 'Normal'], ['high', 'More']].map(([v, n]) => `<button class="chip" data-act="mic-sens" data-v="${v}" aria-pressed="${Store.setting('micSens', 'normal') === v}">${n}</button>`).join('')}</div></div>
      <label class="check inline"><input type="checkbox" data-change="mic-phones"${Store.setting('micPhones', false) ? ' checked' : ''}><span>I\'m using headphones</span></label>
      <p class="muted small">The app listens for the notes it\'s expecting, so it can follow single notes, chords and both hands. Put your phone or tablet near the piano in a quiet room. Choose Less if it hears notes you didn\'t play, or More if it misses quiet ones.</p>
      <p class="muted small">Without headphones, the app ignores the moments when it is making a sound itself (the other hand, the metronome). With headphones on, tick the box so it never ignores you. A MIDI keyboard is still the most accurate for timing.</p></section>
    <section class="card stack"><div class="eyebrow">Feature tours</div>
      <p class="muted small" style="margin:0">A quick guided look at each part of the app. You can also tap ? at the top of any screen.</p>
      <div class="list">${Object.entries(TOURS).map(([id, t]) => `<button class="list-row" data-act="tour" data-id="${id}" data-from-settings="1"><span class="t">${esc(t.name)}</span><span class="lvl">${tourSeen(id) ? 'Seen' : 'New'}</span><span class="d">${esc(t.blurb)}</span></button>`).join('')}</div>
      <button class="toggle" data-act="tours-auto" aria-pressed="${Store.setting('toursAuto', true)}">Show each tour the first time I open that part</button></section>
    <section class="card stack"><div class="eyebrow">Starting level</div>
      <div class="row"><b>${esc(LEVELS[startIdx()].name)}</b><span class="spacer"></span><button class="btn small" data-act="change-level">Change</button></div></section>
    ${premiumCard()}
    <section class="card stack"><div class="eyebrow">Your progress</div>
      <p class="small">Progress is saved on this device${Store.ok ? '' : ' <b>(storage is blocked here, so it will be lost when you close the page)</b>'}. To move it to another device, copy it here and paste it into the app there.</p>
      <div class="row"><button class="btn small" data-act="export">Copy progress</button><button class="btn small" data-act="import-open">Paste progress</button></div>
      <textarea id="export-box" readonly aria-label="Progress data" hidden>${esc(JSON.stringify(Store.state))}</textarea>
      ${ui.importOpen ? `<label for="import-box" class="muted small">Paste progress copied from another device. It is merged with this device; the latest change to each item wins.</label><textarea id="import-box"></textarea><div class="row"><button class="btn primary small" data-act="import">Merge progress</button></div>` : ''}</section>
    <section class="card stack"><div class="eyebrow">Reset</div>
      ${ui.resetAsk ? `<p class="small">This deletes all lessons, scores and note statistics on this device.</p><div class="row"><button class="btn small" data-act="reset-cancel">Keep my progress</button><button class="btn primary small" data-act="reset-confirm">Delete everything</button></div>`
        : `<div class="row"><span class="muted small">Start again from scratch.</span><span class="spacer"></span><button class="btn small" data-act="reset-ask">Reset progress</button></div>`}</section>
    <p class="muted small">Piano recordings from the tonejs-instruments collection (MIT licence). Notation drawn with VexFlow (MIT licence).</p>
  </main>`;
}

/* ============================================================
   Events
   ============================================================ */
/* ============================================================
   Feature tours: a short guided look at each part of the app.
   Shown the first time someone reaches that part, and any time
   from the ? button or Settings.
   ============================================================ */
const DEMO_PIECE = 'p-ode-hands';
const TOURS = {
  welcome: { name: 'Welcome tour', blurb: 'What’s in the app and where to find it', route: { tab: 'learn', view: 'home' }, steps: [
    { title: 'Welcome to Read & Play', text: 'Everything you need to read music and play the piano, in one place. Here’s a quick look round: it takes about a minute.' },
    { sel: '.nav [data-tab="learn"]', title: 'Learn', text: 'The course: short lessons that teach reading and playing side by side, from your first note to full pieces.' },
    { sel: '.hero', title: 'Up next', text: 'Your next lesson is always waiting here. Tap it to pick up where you left off.' },
    { sel: '.nav [data-tab="practise"]', title: 'Practise', text: 'Quick drills that make reading automatic: notes, rhythms, intervals, key signatures, scales and chords. The app gives you more of the notes you find hard.' },
    { sel: '.nav [data-tab="pieces"]', title: 'Pieces', text: 'Nearly 80 pieces in lots of styles to play along with, and Help me play for your own sheet music.' },
    { sel: '.nav [data-tab="library"]', title: 'Library', text: 'Look things up: where every note sits, what each symbol means, every key and rhythm.' },
    { sel: '.topbar [data-act="open-settings"]', title: 'Settings', text: 'Change the look, connect a MIDI keyboard or the microphone, and replay any tour.' },
    { sel: '.topbar [data-act="tour"]', title: 'Help on every screen', text: 'Tap ? on any screen for a quick tour of that part of the app.' }
  ] },
  piece: { name: 'Playing along', blurb: 'The play-along screen and its practice tools', route: { tab: 'pieces', view: 'piece', id: DEMO_PIECE }, steps: [
    { sel: '.piece-paper', title: 'The music', text: 'The next note to play is highlighted. Play it on the piano below or on your own keyboard, and the music moves on.' },
    { sel: '.pa-go', title: 'Listen', text: 'Hear the piece first. Each note lights up as it plays.' },
    { sel: '.pa-modes', title: 'Wait or In time', text: 'Wait: the music waits for the right key, so you can take your time. In time: the music moves on by itself after a count-in, and your timing is scored.' },
    { sel: '[data-act="pa-sheet"]', title: 'Practice options', text: 'This is where to slow down, practise one hand, loop a few bars and connect your piano.' },
    { sel: '.sheet', title: 'Inside the options', text: 'Practise one hand at a time (you hear only that hand), change the speed, choose bars to loop, show the keys to press, and connect a MIDI keyboard or the microphone.', enter: () => { if (!ui.paSheet) { ui.paSheet = true; render(); } }, leave: () => { if (ui.paSheet) { ui.paSheet = false; render(); } } },
    { sel: '[data-act="pa-full"]', title: 'Full screen', text: 'Just the music, as large as possible, so you can read ahead.' },
    { sel: '.piece-kb', title: 'The piano', text: 'Tap the keys to play. With a real piano, a MIDI keyboard is the most accurate; the microphone works with an acoustic piano.' },
    { sel: '.about-piece', title: 'About this piece', text: 'The key, any notes outside it, the chords, hand shapes with fingering, and the bars worth practising first.' }
  ] },
  pieces: { name: 'Pieces and Help me play', blurb: 'Choosing pieces, and learning your own music', route: { tab: 'pieces', view: 'home' }, steps: [
    { sel: '.hmp', title: 'Help me play', text: 'Learn your own music. Photograph a page or upload a file, and the app reads it, plays it to you and sets it up just like the pieces here. Your songs are kept on your device.' },
    { sel: '[data-act="scan-camera"]', title: 'Take a photo', text: 'Lay the page flat in good light with the whole page in view. You can check what the app read against your page before you save it.' },
    { sel: '[data-act="scan-pick"]', title: 'Upload a file', text: 'PDFs and photos are read for you. MusicXML (from MuseScore, Sibelius and similar) and MIDI files are read instantly and don’t use your monthly pages.' },
    { sel: '.genre-chips', title: 'Styles', text: 'Filter by style: pop, rock, blues, jazz, film and games, folk and classical.' },
    { sel: '.unit .list-row', title: 'Pieces by level', text: 'Pieces go from one hand in one position up to full pieces. Stars show how well you’ve played each one.' }
  ] },
  practise: { name: 'Practise', blurb: 'Drills, quizzes and technique', route: { tab: 'practise', view: 'home' }, steps: [
    { sel: '.card.setup', title: 'Note drill', text: 'Name notes as fast as you can, on the keyboard or by letter. Pick the clef and how far off the stave to go.' },
    { sel: '[data-act="drill-weak"]', title: 'Weak notes', text: 'The app keeps track of the notes you find hard and drills just those.' },
    { sel: '.heat-card', title: 'Your note map', text: 'How well you read each note: green is strong, red needs work.' },
    { sel: '.tech-card', title: 'Scales and chords', text: 'Technique with the right fingering, one hand then both.' },
    { sel: '[data-act="open-rhythm"]', title: 'Rhythm and quizzes', text: 'Tap rhythms in time, read intervals and name key signatures. A metronome is at the bottom.' }
  ] },
  library: { name: 'Library', blurb: 'Notes, symbols, keys and rhythms to look up', route: { tab: 'library', view: 'home' }, steps: [
    { sel: '.seg.four', title: 'Four reference sections', text: 'Notes, symbols, keys and rhythms: everything to look up while you’re reading.' },
    { sel: '[data-finder-kb]', title: 'Note finder', text: 'Tap any key to see where that note is written in each clef.' }
  ] },
  lesson: { name: 'Lessons', blurb: 'How a lesson works', route: () => { const l = nextLesson() || ALL_LESSONS[0]; return { tab: 'learn', view: 'lesson', id: l.id }; }, steps: [
    { sel: '.lesson-head', title: 'Reading or Playing', text: 'Lessons alternate between reading music and playing skills, so the two grow together.' },
    { sel: '.goal', title: 'The goal', text: 'What you’ll be able to do by the end. Most lessons take five to ten minutes.' },
    { sel: '.blocks .play, .blocks button', title: 'Try it', text: 'Examples play when you tap them, and exercises check what you play on the keyboard.' },
    { sel: '.lesson-foot', title: 'Finish', text: 'Mark the lesson complete when you’re happy, then go on to the next.' }
  ] }
};
let tour = null;   // { id, i }
const tourSeen = id => !!Store.setting('tour-' + id, false);
function maybeTour(id) {
  if (tour || tourSeen(id) || !Store.setting('toursAuto', true) || !Store.state.profile) return;
  setTimeout(() => { if (!tour && !tourSeen(id) && !$('.sheet')) tourStart(id); }, 700);
}
function tourStart(id, fromSettings) {
  const t = TOURS[id]; if (!t) return;
  if (fromSettings && t.route) {
    const r = typeof t.route === 'function' ? t.route() : t.route;
    if (r.view === 'home') tabTo(r.tab); else { stack.length = 0; route = { tab: r.tab, view: 'home' }; go(r); }
  }

  tour = { id, i: 0 };
  setTimeout(tourShow, fromSettings ? 500 : 0);
}
const tourVisible = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
function tourTarget(step) { return step.sel ? [...document.querySelectorAll(step.sel)].find(tourVisible) || null : null; }
function tourShow() {
  if (!tour) return;
  const t = TOURS[tour.id], step = t.steps[tour.i];
  if (step.enter) step.enter();
  let el = tourTarget(step);
  if (step.sel && !el) {   // not on screen right now: skip it
    if (step.leave) step.leave();
    if (tour.i < t.steps.length - 1) { tour.i++; return tourShow(); }
    return tourEnd();
  }
  if (el && !el.closest('.nav, .topbar, .sheet')) {
    const r = el.getBoundingClientRect();
    if (r.top < 70 || r.bottom > innerHeight - 220) el.scrollIntoView({ block: r.height > innerHeight * 0.5 ? 'start' : 'center', behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  }
  let box = document.querySelector('.tour');
  if (!box) {
    document.body.insertAdjacentHTML('beforeend', '<div class="tour" role="dialog" aria-modal="true" aria-live="polite"><div class="tour-block"></div><div class="tour-hole"></div><div class="tour-card"></div></div>');
    box = document.querySelector('.tour');
  }
  const n = t.steps.length, last = tour.i === n - 1;
  box.querySelector('.tour-card').innerHTML = `<div class="tour-step">${tour.i + 1} of ${n}</div><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p>
    <div class="tour-btns"><button class="btn small ghost" data-tour="skip">${last ? 'Close' : 'Skip tour'}</button><span class="spacer"></span>${tour.i ? '<button class="btn small" data-tour="back">Back</button>' : ''}<button class="btn small primary" data-tour="next">${last ? 'Done' : 'Next'}</button></div>`;
  box.setAttribute('aria-label', step.title);
  tourPlace();
  box.querySelector('[data-tour="next"]').focus({ preventScroll: true });
}
function tourPlace() {
  const box = document.querySelector('.tour'); if (!box || !tour) return;
  const step = TOURS[tour.id].steps[tour.i], el = tourTarget(step), hole = box.querySelector('.tour-hole'), card = box.querySelector('.tour-card');
  const vw = innerWidth, vh = innerHeight, cw = Math.min(360, vw - 24);
  card.style.width = cw + 'px';
  const ch = card.offsetHeight;
  if (!el) {
    hole.style.cssText = `left:${vw / 2}px;top:${vh / 2}px;width:0;height:0;`;
    card.style.left = (vw - cw) / 2 + 'px'; card.style.top = Math.max(16, (vh - ch) / 2) + 'px';
    return;
  }
  const r = el.getBoundingClientRect(), pad = 6;
  const top = Math.max(4, r.top - pad), bottom = Math.min(vh - 4, r.bottom + pad);
  hole.style.cssText = `left:${Math.max(4, r.left - pad)}px;top:${top}px;width:${Math.min(vw - 8, r.width + pad * 2)}px;height:${bottom - top}px;`;
  let y = bottom + 12 + ch < vh - 8 ? bottom + 12 : top - 12 - ch > 8 ? top - 12 - ch : vh - ch - 12;
  let x = Math.min(vw - cw - 12, Math.max(12, r.left + r.width / 2 - cw / 2));
  card.style.left = x + 'px'; card.style.top = Math.max(8, y) + 'px';
}
function tourMove(d) {
  if (!tour) return;
  const t = TOURS[tour.id], step = t.steps[tour.i];
  if (step.leave) step.leave();
  const i = tour.i + d;
  if (i >= t.steps.length) return tourEnd();
  tour.i = Math.max(0, i); tourShow();
}
function tourEnd() {
  if (!tour) return;
  const step = TOURS[tour.id].steps[tour.i];
  if (step && step.leave) step.leave();
  Store.setSetting('tour-' + tour.id, true);
  tour = null;
  const box = document.querySelector('.tour'); if (box) box.remove();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-tour]'); if (!b) return;
  const a = b.dataset.tour;
  if (a === 'next') tourMove(1); else if (a === 'back') tourMove(-1); else tourEnd();
});
window.addEventListener('resize', () => tourPlace());
window.addEventListener('scroll', () => tourPlace(), { passive: true });

const actions = {
  tab: el => tabTo(el.dataset.tab),
  back: () => back(),
  'premium': el => paywall(el.dataset.reason || ''),
  'premium-pick': el => { ui.payPick = el.dataset.id; render(); },
  'premium-buy': () => premiumBuy(),
  'premium-restore': async () => {
    if (Premium.mode !== 'store') { toast('Restoring works in the App Store and Google Play apps'); return; }
    try { toast((await Premium.restore()) ? 'Premium restored' : 'No Premium subscription found on this account'); } catch (e) { toast('Couldn\u2019t restore just now. Try again in a moment.'); }
    render();
  },
  'premium-manage': () => { const ios = window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'ios'; window.open(ios ? 'https://apps.apple.com/account/subscriptions' : 'https://play.google.com/store/account/subscriptions', '_blank'); },
  'premium-preview-free': el => { const on = !Store.setting('previewFree', false); Store.setSetting('previewFree', on); Store.setSetting('demoPremium', false); render(); toast(on ? 'Showing the free version' : 'Everything unlocked again'); },
  'open-settings': () => go({ tab: route.tab, view: 'settings' }),
  'change-level': () => go({ tab: route.tab, view: 'level' }),
  'pick-level': el => { Store.setProfile(el.dataset.level); ui.learnLevel = el.dataset.level; Store.state.lastLesson = null; Store.save(); stack.length = 0; route = { tab: 'learn', view: 'home' }; render(); window.scrollTo(0, 0); toast('Starting at ' + LEVELS[LEVEL_IDX[el.dataset.level]].name); },
  'level-view': el => { ui.learnLevel = el.dataset.level; render(); },
  'open-lesson': el => { const ls = LESSON_BY_ID[el.dataset.id]; if (ls && lessonLocked(ls)) return paywall('lessons'); Store.setLast(el.dataset.id); if (el.dataset.replace) replaceRoute({ tab: 'learn', view: 'lesson', id: el.dataset.id }); else go({ tab: 'learn', view: 'lesson', id: el.dataset.id }); },
  complete: el => {
    const id = el.dataset.id; Store.setLesson(id, 'done'); toast('Lesson complete');
    const nxt = ALL_LESSONS[ALL_LESSONS.findIndex(l => l.id === id) + 1];
    if (nxt) { Store.setLast(nxt.id); replaceRoute({ tab: 'learn', view: 'lesson', id: nxt.id }); } else render();
  },
  uncomplete: el => { Store.setLesson(el.dataset.id, 'todo'); render(); },
  'score-play': el => playScoreBlock(+el.dataset.b),
  'score-tempo': el => { const i = +el.dataset.b, r = reg[i]; r.st.bpm = Math.max(30, Math.min(200, r.st.bpm + +el.dataset.d)); const s = $(`[data-tempo="${i}"]`); if (s) s.textContent = r.st.bpm + ' bpm'; if (Player.key === 'score-' + renderSeq + '-' + i) { Player.stop(); playScoreBlock(i); } },
  'keys-play': el => {
    const i = +el.dataset.b, b = reg[i].b, kb = reg[i].st.kb; const marks = b.mark || (b.fingers && Object.keys(b.fingers)); if (!Piano.ensure() || !marks) return;
    const ms = marks.map(midiOf).sort((x, y) => x - y);
    Player.play('keys-' + i, (t0, sess) => { ms.forEach((m, k) => { const t = t0 + k * 0.35; Piano.note(m, t, { dur: 0.5 }); Player.uiAt(sess, t, () => kb && kb.mark(m, 'lit', true)); Player.uiAt(sess, t + 0.34, () => kb && kb.mark(m, 'lit', false)); }); return ms.length * 0.35 + 0.3; }, { onStop: () => kb && kb.clear('lit') });
  },
  'drill-start': el => startBlockDrill(+el.dataset.b),
  'ex-listen': el => exListen(+el.dataset.b),
  'ex-hint': el => { const i = +el.dataset.b, st = reg[i].st; st.hint = !st.hint; el.setAttribute('aria-pressed', st.hint); st.kb && st.kb.clear('target'); if (!st.done) exShow(i); },
  'ex-again': el => exReset(+el.dataset.b),
  'drill-letter': el => {
    const pc = +el.dataset.pc;
    const blockRoot = el.closest('[data-b-root]');
    if (blockRoot && blockRoot.closest('.drill-screen') === null && route.view !== 'drill') { const i = +blockRoot.dataset.bRoot; const d = reg[i] && reg[i].st.d; if (d && d.handle) d.handle(pc + 60); }
    else if (liveDrill && liveDrill.handle) liveDrill.handle(pc + 60);
  },
  'drill-go': () => startScreenDrill(),
  'drill-again': () => { if (!liveDrill) return; const cfg = liveDrill.cfg; liveDrill = newDrill(cfg); drillNext(liveDrill); render(); },
  'drill-weak': () => startWeakDrill(),
  dcfg: el => { const k = el.dataset.k; let v = el.dataset.v; if (k === 'length') v = +v; const c = Object.assign(drillCfg(), { [k]: v }); Store.setSetting('drillCfg', c); render(); },
  'heat-clef': el => { ui.heatClef = el.dataset.v; render(); },
  'open-rhythm': el => go({ tab: 'practise', view: 'rhythm', id: el.dataset.id }),
  'rh-tempo': el => { const i = +el.dataset.b, r = reg[i]; r.st.bpm = Math.max(40, Math.min(160, r.st.bpm + +el.dataset.d)); const s = $(`[data-tempo="${i}"]`); if (s) s.textContent = r.st.bpm + ' bpm'; },
  'rh-listen': el => rhythmListen(+el.dataset.b),
  'rh-go': el => rhythmGo(+el.dataset.b),
  'scan-camera': () => { if (!isPremium()) return paywall('reading'); const i = $('#scan-cam'); if (i) i.click(); else go({ tab: 'pieces', view: 'home' }); },
  'scan-pick': () => { const i = $('#scan-pick'); if (i) i.click(); else { const t = document.createElement('input'); t.type = 'file'; t.accept = SCAN_ACCEPT; t.multiple = true; t.onchange = () => scanAddFiles(t.files); t.click(); } },
  'scan-remove': el => { scan.pages.splice(+el.dataset.i, 1); if (!scan.pages.length) { scan = null; back(); } else render(); },
  'scan-read': () => scanRead(false),
  'scan-retry': () => scanRead(true),
  'scan-again': () => scanRead(true),
  'scan-stop': () => { if (scan && scan.ctl) scan.ctl.abort(); },
  'scan-save': () => scanSave(),
  'scan-listen': () => {
    const el = $('[data-scan-score]'), sg = scan && scan.result; if (!el || !sg) return;
    if (Player.key === 'scan') { Player.stop(); return; }
    const r = renderScore(el, sg.clef === 'grand' ? { clef: 'grand', key: sg.key, time: sg.time, rh: sg.rh, lh: sg.lh } : { clef: sg.clef, key: sg.key, time: sg.time, music: sg.music }, { label: 'What the app read' });
    if (Piano.ensure()) Player.play('scan', scoreBuilder(r, () => sg.bpm));
  },
  'song-edit': el => { songDraft = null; go({ tab: 'pieces', view: 'song-edit', id: el.dataset.id }); },
  'song-del-ask': el => { ui.songDelAsk = el.dataset.id; render(); },
  'song-del-cancel': () => { ui.songDelAsk = null; render(); },
  'song-del': el => { const id = el.dataset.id; Store.state.songs[id] = { deleted: true, at: Date.now() }; Store.save(); ui.songDelAsk = null; pa = null; tabTo('pieces'); toast('Deleted'); },
  'song-save': () => {
    if (!songPreview()) { toast('Fix the notes first'); return; }
    const d = songDraft, spec = songDraftSpec(), rec = Store.state.songs[d.id] || {};
    Store.state.songs[d.id] = Object.assign({}, rec, { title: d.title.trim() || null, by: d.by || rec.by || null, key: d.key, time: d.time, bpm: Math.max(30, Math.min(240, +d.bpm || 80)), clef: d.clef, at: Date.now() },
      d.clef === 'grand' ? { rh: spec.rh, lh: spec.lh, music: undefined } : { music: spec.music, rh: undefined, lh: undefined });
    Store.save(); songDraft = null; pa = null; back(); toast('Saved');
  },
  'tech-type': el => { const ty = el.dataset.v; ui.tech = Object.assign(techState(), { type: ty, key: TECH_KEYS[ty][0] }); Store.setSetting('tech', ui.tech); render(); },
  'tech-key': el => { ui.tech = Object.assign(techState(), { key: el.dataset.v }); Store.setSetting('tech', ui.tech); render(); },
  'tech-hands': el => { ui.tech = Object.assign(techState(), { hands: el.dataset.v }); Store.setSetting('tech', ui.tech); render(); },
  'tech-go': () => go({ tab: 'practise', view: 'tech' }),
  'tech-switch': el => { ui.tech = Object.assign(techState(), { hands: el.dataset.v }); Store.setSetting('tech', ui.tech); render(); },
  'tech-next': el => { ui.tech = Object.assign(techState(), { key: el.dataset.v }); Store.setSetting('tech', ui.tech); render(); },
  'open-intervals': () => { intState = null; go({ tab: 'practise', view: 'intervals' }); },
  'int-clef': el => { intState.clef = el.dataset.v; render(); },
  'int-play': el => { const r = reg[+el.dataset.b]; if (!Piano.ensure()) return; Player.play('int', t0 => { Piano.note(midiOf(r.st.q.a), t0, { dur: 0.8 }); Piano.note(midiOf(r.st.q.b), t0 + 0.8, { dur: 1 }); return 2; }); },
  'int-answer': el => {
    const i = +el.dataset.b, r = reg[i], v = +el.dataset.v; if (r.st.lock) return;
    const ok = v === r.st.q.size;
    r.st.n++; if (ok) r.st.ok++;
    r.st.fb = ok ? `Yes, ${r.st.q.size === 8 ? 'an' : 'a'} ${INTERVAL_NAMES[r.st.q.size]}.` : `That was ${r.st.q.size === 8 ? 'an' : 'a'} ${INTERVAL_NAMES[r.st.q.size]}: ${label(r.st.q.a)} to ${label(r.st.q.b)}.`;
    r.st.streak = ok ? (r.st.streak || 0) + 1 : 0;
    if (r.b.screen && r.st.streak) Store.setBest('intervals', r.st.streak);
    Piano.ensure(); Piano.note(midiOf(r.st.q.a), undefined, { dur: 0.6 }); setTimeout(() => Piano.note(midiOf(r.st.q.b), undefined, { dur: 0.8 }), 450);
    r.st.lock = true; el.classList.add(ok ? 'ok' : 'bad');
    const fb = $(`[data-b-root="${i}"] [data-fb]`); if (fb) fb.innerHTML = `<span class="${ok ? 'good' : 'bad'}">${esc(r.st.fb)}</span>`;
    setTimeout(() => { r.st.lock = false; r.st.q = newIntervalQ(r.b.clef || 'treble', r.b.max || 8); const root = $(`[data-b-root="${i}"]`); if (root) { root.innerHTML = intervalInner(i); mountInterval(i); } }, ok ? 900 : 1900);
  },
  'open-keyquiz': () => { kq = null; go({ tab: 'practise', view: 'keyquiz' }); },
  'kq-answer': el => {
    if (kq.lock) return;
    const ok = el.dataset.v === kq.q.ans;
    kq.n++; if (ok) { kq.ok++; kq.streak++; Store.setBest('keyquiz', kq.streak); } else kq.streak = 0;
    kq.fb = ok ? `Yes: ${keyName(kq.q.ans)}.` : `It was ${keyName(kq.q.ans)}.`;
    el.classList.add(ok ? 'ok' : 'bad'); kq.lock = true;
    const fb = $('[data-fb]'); if (fb) fb.innerHTML = `<span class="${ok ? 'good' : 'bad'}">${esc(kq.fb)}</span>`;
    setTimeout(() => { kq.lock = false; kq.q = newKeyQ(); kq.fb = ''; render(); }, ok ? 800 : 1700);
  },
  'open-piece': el => { const pc = getPiece(el.dataset.id); if (pc && pieceLocked(pc)) return paywall('pieces'); pa = null; go({ tab: 'pieces', view: 'piece', id: el.dataset.id }); },
  'pa-listen': () => paListen(),
  'pa-full': () => paSetFull(!ui.paFull),
  'piece-genre': el => { ui.pieceGenre = el.dataset.v || null; render(); },
  'pa-kb': () => { ui.paKb = !paKbOn(); render(); },
  'midi-connect': async () => {
    if (!Midi.supported) { toast('This browser can\'t use MIDI keyboards. Try Chrome or Edge.'); return; }
    Piano.ensure(); Store.setSetting('midiOn', true);
    const ok = await Midi.connect();
    toast(ok ? (Midi.inputs.length ? 'Connected: ' + Midi.inputs[0] : 'No keyboard found yet. Plug it in or pair it.') : 'The browser blocked MIDI here.');
  },
  'mic-toggle': () => micToggle(),
  'mic-sens': el => { Store.setSetting('micSens', el.dataset.v); Mic.setOptions({ sensitivity: el.dataset.v }); render(); },
  'midi-bluetooth': async () => {
    toast(/android/i.test(navigator.userAgent) ? 'Looking for Bluetooth keyboards\u2026' : 'Choose your keyboard in the list');
    const r = await Midi.pairBluetooth();
    Store.setSetting('midiOn', true);
    toast(r.ok ? (Midi.inputs.length ? 'Connected: ' + Midi.inputs.join(', ') : 'No keyboard connected. Check its Bluetooth is on.') : 'Bluetooth pairing didn\u2019t work' + (r.error ? ': ' + r.error : ''));
  },
  'midi-disconnect': () => { Store.setSetting('midiOn', false); Midi.disconnect(); },
  'midi-info': () => { if (route.view !== 'settings') go({ tab: route.tab, view: 'settings' }); },
  'pa-go': () => { if (!pa || pa.started) return; Piano.ensure(); pa.started = Date.now(); const fb = $('[data-fb]'); if (fb) fb.textContent = ''; paShowStep(); },
  'pa-restart': () => { if (!pa) return; paReset(); render(); },
  'pa-hint': el => { pa.hint = !pa.hint; el.setAttribute('aria-pressed', pa.hint); if (pa.mode === 'wait') paShowStep(); },
  'tour': el => tourStart(el.dataset.id, el.dataset.fromSettings === '1'),
  'tours-auto': el => { const on = !Store.setting('toursAuto', true); Store.setSetting('toursAuto', on); el.setAttribute('aria-pressed', on); },
  'pa-sheet': () => { ui.paSheet = true; render(); const f = $('.sheet button, .sheet select'); if (f) f.focus({ preventScroll: true }); },
  'pa-sheet-close': () => { ui.paSheet = false; render(); },
  'pa-tempo-reset': () => { const p = getPiece(pa.id); pa.bpm = p.bpm; if (Player.key === 'pa') Player.stop(); render(); },
  'pa-hands': el => { pa.hands = el.dataset.v; paReset(); render(); },
  'pa-backing': () => { pa.backing = !pa.backing; Store.setSetting('paBacking', pa.backing); paReset(); render(); },
  'pa-mode': el => { pa.mode = el.dataset.v; paReset(); render(); },
  'pa-tempo': el => { const p = getPiece(pa.id); pa.bpm = Math.max(30, Math.min(220, pa.bpm + +el.dataset.d)); const pct = Math.round(pa.bpm / p.bpm * 100); const s = $('[data-pa-bpm]'); if (s) s.textContent = pa.bpm + ' bpm' + (pct !== 100 ? ' · ' + pct + '%' : ''); if (Player.key === 'pa') { Player.stop(); paListen(); } },
  'pa-perform': () => paPerform(),
  'pa-whole': () => { pa.from = 1; pa.to = pa.nBars; paReset(); render(); },
  'lib-tab': el => { ui.libTab = el.dataset.v; render(); },
  'finder-spell': el => { finder.spell = el.dataset.v; render(); },
  'sym-cat': el => { ui.symCat = el.dataset.v || null; ui.symQuery = ''; render(); },
  'open-symbol': el => go({ tab: 'library', view: 'symbol', id: el.dataset.id }),
  'about-loop': el => { if (!pa) return; pa.from = +el.dataset.from; pa.to = +el.dataset.to; pa.loop = true; paReset(); render(); const m = $('[data-piece]'); if (m) m.scrollIntoView({ behavior: 'smooth', block: 'start' }); toast(`Looping bars ${pa.from}\u2013${pa.to}`); },
  'open-key': el => go({ tab: 'library', view: 'key', id: el.dataset.id }),
  fav: el => { Store.toggleFav(el.dataset.kind, el.dataset.id); const on = Store.fav(el.dataset.kind, el.dataset.id); el.setAttribute('aria-pressed', on); el.innerHTML = on ? ICON.starOn : ICON.star; toast(on ? 'Saved' : 'Removed from saved'); },
  'metro-toggle': () => { if (Metronome.running) Metronome.stop(); else Metronome.start(); },
  'metro-step': el => { Metronome.bpm = Metronome.bpm + +el.dataset.d; const b = $('[data-metro-bpm]'); if (b) b.textContent = Metronome.bpm; if (Metronome.running) { Metronome.stop(); Metronome.start(); } },
  'metro-beats': el => { Metronome.beats = +el.dataset.v; render(); },
  'set-look': el => { Store.setSetting('look', el.dataset.v); applyLook(); render(); },
  'set-labels': el => { Store.setSetting('kbLabels', el.dataset.v); render(); },
  export: () => {
    const box = $('#export-box'), text = box.value;
    const fallback = () => { box.hidden = false; box.focus(); box.select(); toast('Select all and copy the text'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast('Progress copied'), fallback); else fallback();
  },
  'import-open': () => { ui.importOpen = true; render(); const b = $('#import-box'); if (b) b.focus(); },
  import: () => {
    try {
      const data = JSON.parse($('#import-box').value.trim());
      if (!data || data.schema !== 1 || typeof data.lessons !== 'object') throw new Error('bad');
      Store.state = mergeStates(Store.state, data); Store.save(); ui.importOpen = false; render(); toast('Progress merged');
    } catch (e) { toast('That text is not progress from this app. Copy it again and paste all of it.'); }
  },
  'reset-ask': () => { ui.resetAsk = true; render(); },
  'reset-cancel': () => { ui.resetAsk = false; render(); },
  'reset-confirm': () => { const id = Store.state.deviceId, look = Store.setting('look', 'grand'); Store.state = defaultState(); Store.state.deviceId = id; Store.setSetting('look', look); ui.resetAsk = false; ui.learnLevel = null; stack.length = 0; route = { tab: 'learn', view: 'home' }; render(); toast('Progress reset'); }
};

document.addEventListener('pointerdown', e => {
  // taps and answers respond on press, not release, for timing
  const el = e.target.closest('[data-act="rh-tap"]');
  if (el) { e.preventDefault(); rhythmTap(+el.dataset.b); }
});
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el || el.dataset.act === 'rh-tap') return;
  if (el.disabled) return;
  const fn = actions[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el); }
});
/* ---------- MIDI keyboard input ---------- */
function midiStatusText() {
  switch (Midi.status) {
    case 'unsupported': return 'This browser can\'t use MIDI keyboards.';
    case 'asking': return 'Asking the browser for permission…';
    case 'waiting': return 'Connected, but no keyboard found. Plug it in or pair it and it will appear here.';
    case 'ready': return 'Connected: ' + esc(Midi.inputs.join(', ')) + '. Play a key to test it.';
    case 'blocked': return 'The browser blocked MIDI here. If this page is shown inside another site, open it in its own Chrome or Edge tab.';
    default: return 'Not connected.';
  }
}
function midiTarget() {
  if (route.view === 'piece' && pa && pa.kb && pa.kb.connected) return pa.kb;
  let best = null, bd = Infinity; const mid = window.innerHeight / 2;
  kbs.forEach(k => {
    if (!k.connected || !k.hasHandler) return;
    const r = k.el.getBoundingClientRect(); if (!r.height || r.bottom < 0 || r.top > window.innerHeight) return;
    const d = Math.abs((r.top + r.bottom) / 2 - mid); if (d < bd) { bd = d; best = k; }
  });
  return best;
}
const midiVoices = new Map(), midiSustained = new Set();
let midiPedal = false;
function midiStopVoice(m) { const v = midiVoices.get(m); if (v && Piano.ctx) v.stopAt(Piano.ctx.currentTime); midiVoices.delete(m); }
/* a note from a MIDI keyboard or the microphone. time: when it was heard (audio clock), if known */
let noteInputTime = null;
const noteName = m => NOTE_NAMES[m % 12] + (Math.floor(m / 12) - 1);
function inputNote(m, time, fromMic) {
  const last = $('[data-midi-last]'); if (last && !fromMic) last.textContent = 'You played ' + noteName(m);
  const live = reg.findIndex(r => r && r.st && r.st.tapOn);
  if (live >= 0) { if (!fromMic) rhythmTap(live); return; }   // the microphone taps on the onset instead
  const kb = midiTarget(); if (!kb) return;
  noteInputTime = time === undefined ? null : time;
  try { kb.press(m); } finally { noteInputTime = null; }
  if (fromMic) setTimeout(() => kb.release(m), 180);
}
Midi.setHandler({
  on(m, vel) {
    if (Store.setting('midiSound', true)) {
      midiStopVoice(m); midiSustained.delete(m);
      const v = Piano.note(m, undefined, { gain: 0.3 + 0.7 * vel / 127 }); if (v) midiVoices.set(m, v);
    }
    inputNote(m);
  },
  off(m) {
    if (midiPedal) midiSustained.add(m); else midiStopVoice(m);
    kbs.forEach(k => k.release(m));
  },
  pedal(down) {
    midiPedal = down;
    if (!down) { midiSustained.forEach(midiStopVoice); midiSustained.clear(); }
  }
});
/* ---------- Microphone input ---------- */
function micStatusText() {
  switch (Mic.status) {
    case 'unsupported': return 'This browser can\'t use the microphone.';
    case 'asking': return 'Asking the browser for permission…';
    case 'on': return 'Listening. Play a note to test it.';
    case 'blocked': return 'The microphone is blocked. Allow it in your browser\'s settings for this page. If the app is shown inside another site, open the downloaded file in Chrome, Safari or Edge instead.';
    default: return 'Off. Turn it on to play along on an acoustic piano, or any keyboard without MIDI.';
  }
}
function micChip(small) {
  const on = Mic.status === 'on';
  return small ? `<button class="toggle mic-mini" data-act="mic-toggle" aria-pressed="${on}" aria-label="${on ? 'Stop listening' : 'Listen with the microphone'}">${ICON.mic}</button>`
    : `<button class="${on ? 'chip midi-chip on' : 'btn small'}" data-act="mic-toggle" aria-pressed="${on}">${ICON.mic}<span>${on ? 'Listening' : 'Microphone'}</span></button>`;
}
function micToggle() {
  if (Mic.status === 'on') { Mic.stop(); Store.setSetting('micOn', false); return; }
  if (!Mic.supported) { toast('This browser can\'t use the microphone.'); return; }
  Store.setSetting('micOn', true);
  Mic.setOptions({ sensitivity: Store.setting('micSens', 'normal'), headphones: Store.setting('micPhones', false) });
  Mic.start().then(ok => toast(ok ? 'Listening: play your piano' : 'The microphone is blocked here'));
}
/* the notes the app is waiting for right now, so the microphone knows what to listen for */
function expectedNotes() {
  if (route.view === 'piece' && pa && pa.steps) {
    if (pa.mode === 'perform') {
      if (!pa.perf || !pa.perf.running) return [];
      const now = Piano.heardNow();
      return [...new Set(pa.perf.recs.filter(r => !r.judged && Math.abs(now - r.t) < pa.perf.win + 0.35).flatMap(r => [...r.need].filter(m => !r.hit.has(m))))];
    }
    const st = pa.steps[pa.idx]; return st ? st.midis.filter(m => !pa.pressed.has(m)) : [];
  }
  const kb = midiTarget(); if (!kb) return [];
  const r = reg.find(x => x && x.st && x.st.kb === kb && x.st.steps);
  if (r && !r.st.done) { const s = r.st.steps[r.st.idx]; return s ? s.midis.filter(m => !r.st.pressed.has(m)) : []; }
  return [];
}
/* notes you might also be playing that the app isn't checking: the other hand when you practise one */
function otherHandNotes() {
  if (route.view !== 'piece' || !pa || !pa.steps) return [];
  if (pa.mode === 'perform') { if (!pa.perf) return []; const now = Piano.heardNow(); return pa.perf.recs.filter(r => Math.abs(now - r.t) < 0.6).flatMap(r => r.st.auto.flatMap(e => e.midis)); }
  return [pa.idx - 1, pa.idx, pa.idx + 1].flatMap(k => pa.steps[k] ? pa.steps[k].auto.flatMap(e => e.midis) : []);
}
Mic.setExpect(expectedNotes, otherHandNotes);
Mic.setHandler({
  note(m, t) { inputNote(m, t - Piano.latency(), true); const h = $('[data-mic-heard]'); if (h) h.textContent = 'Heard ' + noteName(m); },
  onset() { const live = reg.findIndex(r => r && r.st && r.st.tapOn); if (live >= 0) rhythmTap(live); },
  level(db) { const el = $('[data-mic-meter]'); if (el) el.style.width = Math.max(0, Math.min(100, (db + 70) * 1.6)) + '%'; }
});
Mic.onChange(() => {
  if (route.view === 'settings' || route.view === 'piece') render();
  else $$('[data-act="mic-toggle"]').forEach(b => b.setAttribute('aria-pressed', Mic.status === 'on'));
});
document.addEventListener('pointerdown', function micAutoStart() {
  document.removeEventListener('pointerdown', micAutoStart, true);
  if (Store.setting('micOn', false) && Mic.supported && Mic.status === 'off') { Mic.setOptions({ sensitivity: Store.setting('micSens', 'normal'), headphones: Store.setting('micPhones', false) }); Mic.start(); }
}, true);
Midi.onChange(() => {
  const s = $('[data-midi-status]'); if (s) s.innerHTML = midiStatusText();
  if (route.view === 'settings' || route.view === 'piece') render();
});
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && ui.paFull) { ui.paFull = false; ui.paKb = null; render(); } });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && tour) { tourEnd(); return; }
  if (e.key === 'Escape' && ui.paSheet) { ui.paSheet = false; render(); return; }
  if (e.key === 'Escape' && ui.paFull) { paSetFull(false); return; }
  if (e.code === 'Space') {
    const live = reg.findIndex(r => r && r.st && r.st.tapOn);
    if (live >= 0) { e.preventDefault(); rhythmTap(live); }
  }
});
document.addEventListener('change', e => {
  const el = e.target, c = el.dataset.change; if (!c) return;
  if (c === 'check') Store.setCheck(el.dataset.key, +el.dataset.k, el.checked);
  else if (c === 'midi-sound') Store.setSetting('midiSound', el.checked);
  else if (c === 'scan-files') { const f = Array.from(el.files || []); el.value = ''; scanAddFiles(f); }
  else if (c === 'mic-phones') { Store.setSetting('micPhones', el.checked); Mic.setOptions({ headphones: el.checked }); }
  else if (c === 'pa-from' || c === 'pa-to') { const v = +el.value; if (c === 'pa-from') { pa.from = v; if (pa.to < v) pa.to = v; } else { pa.to = v; if (pa.from > v) pa.from = v; } paReset(); render(); }
  else if (c === 'pa-loop') { pa.loop = el.checked; }
  else if (c === 'about-outkey') { Store.setSetting('outKey', el.checked); render(); }
  else if (c === 'pa-click') { pa.click = el.checked; }
  else if (c === 'dcfg-acc') { Store.setSetting('drillCfg', Object.assign(drillCfg(), { accidentals: el.checked })); }
});
document.addEventListener('input', e => {
  const el = e.target, k = el.dataset.input; if (!k) return;
  if (k === 'sym-search') { ui.symQuery = el.value; const pos = el.selectionStart; render(); const s = $('#sym-search'); if (s) { s.focus(); try { s.setSelectionRange(pos, pos); } catch (err) {} } }
  else if (k === 'scan-title') { if (scan) scan.title = el.value; }
  else if (k.startsWith('song-') && songDraft) { songDraft[k.slice(5)] = el.value; clearTimeout(songPreviewT); songPreviewT = setTimeout(songPreview, 350); }
  else if (k === 'tap-offset') { const v = +el.value; Store.setSetting('tapOffset', v); const b = $('[data-off]'); if (b) b.textContent = (v > 0 ? '+' : '') + v + ' ms'; }
});
Metronome.onBeat(({ beat, running, stoppedAfter }) => {
  $$('[data-beats] i').forEach((d, k) => d.classList.toggle('on', running && k === beat));
  if (beat === -1) { const b = $('[data-act="metro-toggle"]'); if (b) b.textContent = running ? 'Stop' : 'Start'; if (!running && stoppedAfter) Store.addPractice(stoppedAfter / 60); }
});
function onScroll() { const tb = $('.topbar'); if (tb) tb.classList.toggle('scrolled', window.scrollY > 4); }
window.addEventListener('scroll', onScroll, { passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) { Player.stop(); if (Metronome.running) Metronome.stop(); } });
// re-draw music when the width changes (rotation, window resize)
let lastW = window.innerWidth, rz;
window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (Math.abs(window.innerWidth - lastW) > 40) { lastW = window.innerWidth; if (!(liveDrill && route.view === 'drill')) render(); } }, 250); });

/* ---------------- Boot ---------------- */
(async function boot() {
  await loadNativeCopy();
  Store.init();
  Premium.onChange(() => { if (['premium', 'settings', 'home'].includes(route.view)) render(); });
  Premium.init();
  applyLook();
  Piano.load();
  const h = location.hash.slice(1);
  if (['learn', 'practise', 'pieces', 'library'].includes(h)) route = { tab: h, view: 'home' };
  render();
  if (Store.setting('midiOn', false) && Midi.supported) Midi.connect();
  if (NativeApp && NativeApp.addListener) {
    NativeApp.addListener('backButton', () => { if (stack.length) back(); else if (NativeApp.exitApp) NativeApp.exitApp(); });
    NativeApp.addListener('pause', () => { Player.stop(); if (Metronome.running) Metronome.stop(); });
  }
})();
window.ReadMusic = { Store, mergeStates };
})();
