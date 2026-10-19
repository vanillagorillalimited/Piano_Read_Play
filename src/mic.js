/* ============================================================
   Microphone note detection, for acoustic pianos and keyboards
   without MIDI.

   How it works:
   1. Onsets: a sudden rise in loudness means a key was struck.
   2. Expected notes: the app knows which notes should come next, so
      after each onset it checks whether each of those notes (and its
      harmonics) got louder. This handles chords and both hands.
   3. Anything else: if none of the expected notes appeared, it finds
      the strongest new pitch, so a wrong note can still be named.
   Sounds the app makes itself (its own piano, metronome clicks) are
   ignored unless you tell it you're using headphones.
   ============================================================ */

/* ---------- small real FFT (radix 2) ---------- */
function makeFFT(N) {
  const levels = Math.log2(N) | 0, rev = new Uint32Array(N), cos = new Float32Array(N / 2), sin = new Float32Array(N / 2);
  for (let i = 0; i < N; i++) { let r = 0; for (let b = 0; b < levels; b++) r = (r << 1) | ((i >>> b) & 1); rev[i] = r; }
  for (let i = 0; i < N / 2; i++) { cos[i] = Math.cos(2 * Math.PI * i / N); sin[i] = Math.sin(2 * Math.PI * i / N); }
  const win = new Float32Array(N); for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1));
  const re = new Float32Array(N), im = new Float32Array(N);
  return function magnitudes(input, out) {
    const off = input.length - N;
    for (let i = 0; i < N; i++) { re[rev[i]] = input[off + i] * win[i]; im[rev[i]] = 0; }
    for (let size = 2; size <= N; size <<= 1) {
      const half = size >>> 1, step = N / size;
      for (let i = 0; i < N; i += size) for (let j = 0, k = 0; j < half; j++, k += step) {
        const a = i + j, b = a + half, tr = re[b] * cos[k] + im[b] * sin[k], ti = im[b] * cos[k] - re[b] * sin[k];
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
      }
    }
    for (let i = 0; i < N / 2; i++) out[i] = Math.hypot(re[i], im[i]);
    return out;
  };
}

/* ---------- the detector: pure, so it can be tested with recorded audio ---------- */
function createNoteDetector(sampleRate, opts = {}) {
  const N = 4096, NS = 1024, fft = makeFFT(N), fftS = makeFFT(NS), binHz = sampleRate / N, binS = sampleRate / NS;
  const SENS = { low: 3, normal: 0, high: -3 };
  const st = { floor: -75, spec: [], bands: [], lastOnset: -9, pending: null, sens: SENS[opts.sensitivity || 'normal'] || 0, prevFlux: 0 };
  const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);
  const W = [1, 0.85, 0.7, 0.6, 0.5, 0.4];
  const db = x => 20 * Math.log10(x + 1e-9);
  // onset bands: 20 log-spaced bands from 100 Hz to 6 kHz on the short FFT
  const BANDS = []; for (let i = 0; i < 20; i++) { const lo = 100 * Math.pow(60, i / 20), hi = 100 * Math.pow(60, (i + 1) / 20); BANDS.push([Math.max(1, Math.floor(lo / binS)), Math.max(Math.floor(lo / binS) + 1, Math.ceil(hi / binS))]); }
  // strength of a partial near frequency f, scaled down the further the real peak is from f
  function partial(mag, f) {
    const k0 = f / binHz; if (k0 >= mag.length - 2) return 0;
    const r = Math.max(1, Math.round(k0 * 0.03));
    let best = -1, bm = 0;
    for (let k = Math.max(1, Math.floor(k0 - r)); k <= Math.ceil(k0 + r); k++) if (mag[k] > bm) { bm = mag[k]; best = k; }
    if (best < 1 || mag[best - 1] > bm || mag[best + 1] > bm) return 0;   // not a real peak
    const a = Math.log(mag[best - 1] + 1e-12), b = Math.log(bm + 1e-12), c = Math.log(mag[best + 1] + 1e-12);
    const den = a - 2 * b + c, p = den ? 0.5 * (a - c) / den : 0;
    const cents = 1200 * Math.log2(((best + p) * binHz) / f);
    return bm * Math.exp(-(cents / 35) * (cents / 35));
  }
  function harm(mag, m, fl) {
    const f0 = midiHz(m), a = [];
    let s = 0, count = 0;
    for (let h = 1; h <= 6; h++) {
      const f = f0 * h * Math.sqrt(1 + 0.0002 * h * h);   // piano strings: upper partials run a little sharp
      const v = f < 7000 ? partial(mag, f) : 0;
      a.push(v); s += W[h - 1] * v;
      if (h <= 4 && db(v) > fl + 14) count++;
    }
    return { s: db(s), count, odd: db(a[0] + a[2] + a[4]), a };
  }
  function stats(mag) {
    const lo = Math.floor(60 / binHz), hi = Math.floor(5000 / binHz), v = [];
    let mx = 0;
    for (let k = lo; k < hi; k++) { if (mag[k] > mx) mx = mag[k]; if (k % 3 === 0) v.push(mag[k]); }
    v.sort((x, y) => x - y);
    return { fl: db(v[Math.floor(v.length / 2)]), max: db(mx) };
  }
  let expectSet = null, otherSet = null, onsetRises = null;
  const bandRise = f => { if (!onsetRises) return 0; const i = BANDS.findIndex(([lo, hi]) => f >= lo * binS && f < hi * binS); return i < 0 ? 0 : Math.max(onsetRises[i], onsetRises[i - 1] || 0, onsetRises[i + 1] || 0); };
  function present(mag, pre, S, m) {
    const now = harm(mag, m, S.fl), before = harm(pre, m, S.fl);
    if (now.s < S.max - 26 - st.sens || now.s < S.fl + 16 + st.sens) return false;
    if (now.count < 2 && m < 84) return false;
    if (now.s - before.s < 3 + st.sens / 2) {
      // the same note struck again while it was still ringing: accept it if its own bands jumped at the onset
      const rise = Math.max(bandRise(midiHz(m)), bandRise(midiHz(m) * 2));
      if (!(rise >= 6 + st.sens && now.s > S.max - 12 && now.count >= 3 && now.s - before.s > -0.5)) return false;
    }
    if (m < 84 && Math.max(db(now.a[0]), db(now.a[2])) < Math.max(S.fl + 14, S.max - 32)) return false;   // needs its fundamental or 3rd partial
    // a lower note can fake this one through its overtones (an octave or a twelfth below): reject if that explains it
    const related = [...(expectSet || []), ...(otherSet || [])].some(e => [12, 19, 24, 28, 31, 36].includes(m - e));   // e.g. octaves in the left hand
    if (!related) for (const low of [m - 12, m - 19]) {
      if (low < 21 || (expectSet && expectSet.has(low))) continue;
      const l = harm(mag, low, S.fl), lp = harm(pre, low, S.fl);
      if (db(l.a[0]) > S.fl + 16 && db(l.a[0]) - db(lp.a[0]) > 5 && l.count >= 3) return false;
    }
    for (const n of [m - 1, m + 1]) {
      const nb = harm(mag, n, S.fl), nbPre = harm(pre, n, S.fl);
      if (nb.s > now.s + 2 && nb.s - nbPre.s > 3) return false;
    }
    return true;
  }
  function estimate(mag, pre, S) {
    let best = null;
    for (let m = 33; m <= 98; m++) {
      const now = harm(mag, m, S.fl);
      if (now.s < S.max - 20 - st.sens || now.count < 2) continue;
      const before = harm(pre, m, S.fl);
      if (now.s - before.s < 5) continue;
      if (!best || now.s > best.s) best = { m, s: now.s };
    }
    if (!best) return null;
    // only name a note when it clearly stands out: unsure guesses would count as wrong notes
    let second = -200;
    for (let m = 33; m <= 98; m++) { const d = Math.abs(m - best.m); if (d === 0 || d === 12 || d === 19 || d === 24) continue; const h = harm(mag, m, S.fl); if (h.count >= 2 && h.s > second) second = h.s; }
    if (best.s - second < 4) return null;
    // octave check: if the note an octave down has strong odd partials too, it's the real one
    // its 3rd partial (a twelfth up) is not an overtone of the higher note, so it tells them apart
    const lower = best.m - 12;
    if (lower >= 28) {
      const l = harm(mag, lower, S.fl), lp = harm(pre, lower, S.fl), b = harm(mag, best.m, S.fl);
      if (db(l.a[2]) > S.fl + 16 && db(l.a[2]) - db(lp.a[2]) > 5 && db(l.a[0]) > db(b.a[0]) - 8) best = { m: lower, s: l.s };
    }
    return best.m;
  }
  function rms(buf, n) { let s = 0; for (let i = buf.length - n; i < buf.length; i++) s += buf[i] * buf[i]; return db(Math.sqrt(s / n)); }

  /* call regularly (every ~16 ms) with the latest samples (at least N) and the time they end at.
     expected(): midi notes the app is waiting for.  ignoreAt(t): 'notes' or true if the app itself made a sound then.
     Returns { level, onset: t | null, notes: [{ midi, time }] } */
  function process(samples, t, expected, ignoreAt, others) {
    const out = { level: -100, onset: null, notes: [] };
    const e = rms(samples, 1024); out.level = e;
    if (st.start === undefined) { st.start = t; st.floor = e; }
    st.floor += (e - st.floor) * (e < st.floor ? 0.3 : 0.002);
    const warm = t - st.start > 0.25;   // let the noise floor settle first
    // onset: rise in band energies on a short window
    const ms = fftS(samples, new Float32Array(NS / 2));
    const bands = BANDS.map(([lo, hi]) => { let s = 0; for (let k = lo; k < hi; k++) s += ms[k] * ms[k]; return 10 * Math.log10(s / (hi - lo) + 1e-12); });
    st.bands.push(bands); if (st.bands.length > 3) st.bands.shift();
    const prev = st.bands[0];
    const rises = st.bands.length >= 3 ? bands.map((b, i) => Math.max(0, b - prev[i])) : bands.map(() => 0);
    // broad rise across the spectrum, or a strong rise in a few bands (a note struck again over a held chord)
    const top3 = rises.slice().sort((x, y) => y - x).slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const flux = Math.max(rises.reduce((a, b) => a + b, 0) / rises.length, (top3 - 4) / 2.2);
    const mag = fft(samples, new Float32Array(N / 2)), S = stats(mag);
    st.spec.push([t, mag]); while (st.spec.length && t - st.spec[0][0] > 0.4) st.spec.shift();
    if (warm && flux > 2.2 + st.sens * 0.4 && flux >= st.prevFlux && e > st.floor + 10 + st.sens && e > -62 && (t - st.lastOnset > 0.11 || (st.pending && !st.pending.emitted.size && t - st.lastOnset > 0.035))) {
      st.lastOnset = t;
      const onsetT = t - 0.02;
      const preEntry = [...st.spec].reverse().find(sp => onsetT - sp[0] >= 0.012) || st.spec[0];
      st.pending = { t: onsetT, pre: preEntry[1], emitted: new Set(), opened: false, expect: null, rises: rises.slice(), ignore: ignoreAt ? ignoreAt(onsetT) : false };
      out.onset = onsetT;
    }
    st.prevFlux = flux;
    const p = st.pending;
    if (p) {
      const age = t - p.t;
      if (age < 0.06) p.rises = p.rises.map((v, i) => Math.max(v, rises[i]));
      onsetRises = p.rises;
      if (age >= 0.05) {
        if (!p.expect) { p.expect = expected ? expected().slice() : []; p.others = others ? others() : []; }
        expectSet = new Set(p.expect); otherSet = p.others;
        if (p.ignore !== 'notes' && !p.opened) p.expect.forEach(m => {
          if (!p.emitted.has(m) && present(mag, p.pre, S, m)) { p.emitted.add(m); out.notes.push({ midi: m, time: p.t }); }
        });
        if (age >= 0.16 && !p.opened && !p.emitted.size && !p.ignore) {
          p.opened = true;
          const m = estimate(mag, p.pre, S);
          if (m !== null && !(p.others || []).includes(m)) { p.emitted.add(m); out.notes.push({ midi: m, time: p.t }); }
        }
      }
      if (age > 0.3) st.pending = null;
    }
    return out;
  }
  return { process, setSensitivity(s) { st.sens = SENS[s] || 0; }, N, _debug: { harm, stats, fft } };
}

/* ---------- live microphone controller ---------- */
const Mic = (() => {
  const supported = typeof navigator !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  let status = supported ? 'off' : 'unsupported', stream = null, src = null, an = null, buf = null, timer = 0, det = null, error = '';
  let handler = null, expectFn = null, otherFn = null, level = -100, lastHeard = null;
  const listeners = new Set(), appSounds = [];
  let opts = { sensitivity: 'normal', headphones: false };
  function emit() { listeners.forEach(f => { try { f(); } catch (e) { console.error(e); } }); }
  // remember sounds the app makes, so the microphone doesn't mistake them for you
  function noteApp(kind, t) { appSounds.push({ kind, t }); while (appSounds.length > 200) appSounds.shift(); }
  { const orig = Piano.note; Piano.note = function (m, t) { const c = Piano.ctx; noteApp('note', typeof t === 'number' ? t : (c ? c.currentTime : 0)); return orig.apply(this, arguments); }; }
  { const orig = Piano.click; Piano.click = function (t) { noteApp('click', t); return orig.apply(this, arguments); }; }
  function ignoreAt(t) {
    if (opts.headphones) return false;
    const lat = Piano.latency();
    let res = false;
    for (const s of appSounds) {
      const heard = s.t + lat;
      if (s.kind === 'note' && t >= heard - 0.03 && t <= heard + 0.15) return 'notes';
      if (s.kind === 'click' && t >= heard - 0.03 && t <= heard + 0.07) res = true;
    }
    return res;
  }
  function tick() {
    if (!an) return;
    an.getFloatTimeDomainData(buf);
    const c = Piano.ctx, t = c.currentTime - 0.02;   // allow ~20 ms for the sound to reach us through the microphone
    const r = det.process(buf, t, expectFn, ignoreAt, otherFn);
    level = r.level;
    if (r.onset !== null && handler && handler.onset) handler.onset(r.onset);
    r.notes.forEach(n => { lastHeard = n.midi; if (handler && handler.note) handler.note(n.midi, n.time); });
    if (handler && handler.level) handler.level(level, lastHeard);
  }
  async function start() {
    if (!supported) { status = 'unsupported'; emit(); return false; }
    const c = Piano.ensure(); if (!c) return false;
    status = 'asking'; emit();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      src = c.createMediaStreamSource(stream);
      an = c.createAnalyser(); an.fftSize = 4096; an.smoothingTimeConstant = 0;
      src.connect(an);
      buf = new Float32Array(an.fftSize);
      det = createNoteDetector(c.sampleRate, { sensitivity: opts.sensitivity });
      clearInterval(timer); timer = setInterval(tick, 16);
      status = 'on'; emit();
      return true;
    } catch (e) {
      error = (e && (e.name || e.message)) || ''; status = 'blocked'; emit();
      return false;
    }
  }
  function stop() {
    clearInterval(timer); timer = 0;
    try { src && src.disconnect(); } catch (e) {}
    if (stream) stream.getTracks().forEach(tr => tr.stop());
    stream = src = an = null; status = supported ? 'off' : 'unsupported'; emit();
  }
  return {
    supported, start, stop,
    get status() { return status; }, get error() { return error; }, get level() { return level; },
    setHandler(h) { handler = h; }, setExpect(fn, others) { expectFn = fn; otherFn = others || null; },
    setOptions(o) { Object.assign(opts, o); if (det && o.sensitivity) det.setSensitivity(o.sensitivity); },
    onChange(f) { listeners.add(f); return () => listeners.delete(f); }
  };
})();
