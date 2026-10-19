/* ============================================================
   Audio: recorded piano sampler, metronome clicks and a single
   playback session (Player) shared by every play button.
   ============================================================ */
const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

const Piano = (() => {
  let ctx = null, master, comp, verb, samples = [], ready = false, clickBus;
  const readyFns = [];

  function decode(c, ab) {
    return new Promise((res, rej) => { const p = c.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); });
  }
  // Decode once at start-up with an offline context (no tap needed)
  async function load() {
    if (typeof PIANO_SAMPLES === 'undefined') return;
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OAC) return;
    let dec; try { dec = new OAC(1, 1, 44100); } catch (e) { return; }
    for (const [m, b64] of Object.entries(PIANO_SAMPLES)) {
      try {
        const bin = atob(b64), bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const buf = await decode(dec, bytes.buffer);
        const d = buf.getChannelData(0);
        let peak = 0; for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
        if (peak) for (let i = 0; i < d.length; i++) d[i] *= 0.9 / peak;
        let on = 0; while (on < d.length && Math.abs(d[on]) < 0.03) on++;
        samples.push({ midi: +m, buf, onset: Math.max(0, on / buf.sampleRate - 0.003) });
      } catch (e) { /* skip */ }
    }
    samples.sort((a, b) => a.midi - b.midi);
    ready = samples.length > 0;
    readyFns.forEach(f => f());
  }

  function impulse(seconds) {
    const len = Math.floor(ctx.sampleRate * seconds), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    return b;
  }
  function ensure() {
    try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (e) {}
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3;
      master = ctx.createGain(); master.gain.value = 0.9;
      master.connect(comp); comp.connect(ctx.destination);
      const conv = ctx.createConvolver(); conv.buffer = impulse(2.2);
      const wet = ctx.createGain(); wet.gain.value = 0.14; conv.connect(wet); wet.connect(comp); verb = conv;
      master.connect(verb);
      clickBus = ctx.createGain(); clickBus.gain.value = 0.5; clickBus.connect(comp);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  const active = new Set();
  // Synth fallback used until the recordings are decoded
  function synthVoice(midi, time, gain) {
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(gain * 0.5, time + 0.01); g.gain.exponentialRampToValueAtTime(0.001, time + 2.5);
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(); o1.type = 'triangle'; o2.type = 'sine';
    o1.frequency.value = f; o2.frequency.value = f * 2;
    const g2 = ctx.createGain(); g2.gain.value = 0.3; o2.connect(g2); g2.connect(g); o1.connect(g); g.connect(master);
    o1.start(time); o2.start(time); o1.stop(time + 2.6); o2.stop(time + 2.6);
    const v = { g, stopAt: t => { try { g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0.0001, t, 0.06); o1.stop(t + 0.4); o2.stop(t + 0.4); } catch (e) {} } };
    active.add(v); o1.onended = () => active.delete(v);
    return v;
  }
  function note(midi, time, opts = {}) {
    const c = ensure(); if (!c) return null;
    time = time === undefined ? c.currentTime + 0.01 : time;
    const gain = (opts.gain || 0.8) * (0.92 + Math.random() * 0.08);
    if (!ready) return synthVoice(midi, time, gain);
    let s = samples[0];
    for (const x of samples) if (Math.abs(x.midi - midi) < Math.abs(s.midi - midi)) s = x;
    const src = c.createBufferSource(); src.buffer = s.buf;
    src.playbackRate.value = Math.pow(2, (midi - s.midi) / 12);
    const g = c.createGain(); g.gain.setValueAtTime(gain, time);
    src.connect(g); g.connect(master);
    src.start(time, s.onset);
    const v = { g, stopAt: t => { try { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value || gain, t); g.gain.setTargetAtTime(0.0001, t, 0.09); src.stop(t + 0.6); } catch (e) {} } };
    active.add(v); src.onended = () => { active.delete(v); try { g.disconnect(); } catch (e) {} };
    if (opts.dur) v.stopAt(time + opts.dur);
    return v;
  }
  function click(time, accent) {
    const c = ensure(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'square'; o.frequency.value = accent ? 1760 : 1200;
    f.type = 'bandpass'; f.frequency.value = accent ? 2300 : 1700; f.Q.value = 2;
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(accent ? 0.9 : 0.55, time + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    o.connect(f); f.connect(g); g.connect(clickBus); o.start(time); o.stop(time + 0.06);
  }
  function wood(time, accent) { // a woodblock sound for rhythm examples
    const c = ensure(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(accent ? 1250 : 1050, time); o.frequency.exponentialRampToValueAtTime(700, time + 0.06);
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(0.9, time + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
    o.connect(g); g.connect(clickBus); o.start(time); o.stop(time + 0.1);
  }
  function stopAll() { if (!ctx) return; const t = ctx.currentTime; active.forEach(v => v.stopAt(t)); }
  return {
    load, ensure, note, click, wood, stopAll, onReady(fn) { readyFns.push(fn); },
    get ctx() { return ctx; }, get ready() { return ready; },
    // the extra time between scheduling a sound and the user hearing it
    latency() { return ctx ? (ctx.outputLatency || 0) + (ctx.baseLatency || 0) : 0; },
    // the audio-clock time of the sound reaching the speakers right now
    heardNow() {
      if (!ctx) return 0;
      const rough = ctx.currentTime - (ctx.outputLatency || 0) - (ctx.baseLatency || 0);
      try {
        const ts = ctx.getOutputTimestamp && ctx.getOutputTimestamp();
        if (ts && ts.performanceTime > 0 && ts.contextTime > 0) {
          const fine = ts.contextTime + (performance.now() - ts.performanceTime) / 1000;
          if (Math.abs(fine - rough) < 0.06) return fine;   // some browsers report stale timestamps; fall back if it disagrees
        }
      } catch (e) {}
      return rough;
    }
  };
})();

/* One playback session at a time */
const Player = (() => {
  let session = null;
  const listeners = new Set();
  function uiAt(sess, time, fn) {
    const ms = Math.max(0, (time - Piano.ctx.currentTime) * 1000);
    sess.timers.push(setTimeout(() => { if (session === sess) fn(); }, ms));
  }
  function stop() {
    if (!session) return;
    const s = session; session = null;
    clearInterval(s.loopTimer); s.timers.forEach(clearTimeout);
    Piano.stopAll();
    if (s.onStop) s.onStop();
    listeners.forEach(l => l(null));
  }
  function play(key, build, { loop = false, onStop } = {}) {
    const c = Piano.ensure(); if (!c) return null;
    stop();
    const sess = { key, timers: [], onStop };
    session = sess; listeners.forEach(l => l(key));
    let t = c.currentTime + 0.1;
    t += build(t, sess);
    if (loop) sess.loopTimer = setInterval(() => { if (session !== sess) return; while (t < c.currentTime + 0.4) t += build(t, sess); }, 60);
    else uiAt(sess, t + 0.4, stop);
    return sess;
  }
  return { play, stop, uiAt, get key() { return session ? session.key : null; }, onChange(fn) { listeners.add(fn); } };
})();

/* Metronome for practice */
const Metronome = (() => {
  let bpm = 72, beats = 4, running = false, timer = null, next = 0, beat = 0, started = 0;
  const listeners = new Set();
  function tick() {
    const c = Piano.ctx;
    while (next < c.currentTime + 0.12) {
      const b = beat; Piano.click(next, b === 0);
      const ms = Math.max(0, (next - c.currentTime) * 1000);
      setTimeout(() => { if (running) listeners.forEach(l => l({ beat: b, running })); }, ms);
      next += 60 / bpm; beat = (beat + 1) % beats;
    }
  }
  return {
    start(o = {}) { const c = Piano.ensure(); if (!c) return; if (o.bpm) bpm = o.bpm; if (o.beats) beats = o.beats; running = true; beat = 0; next = c.currentTime + 0.06; started = Date.now(); clearInterval(timer); timer = setInterval(tick, 25); tick(); listeners.forEach(l => l({ beat: -1, running })); },
    stop() { if (!running) return; running = false; clearInterval(timer); listeners.forEach(l => l({ beat: -1, running, stoppedAfter: (Date.now() - started) / 1000 })); },
    get running() { return running; }, get bpm() { return bpm; }, set bpm(v) { bpm = Math.max(30, Math.min(240, v)); }, get beats() { return beats; }, set beats(v) { beats = v; },
    onBeat(fn) { listeners.add(fn); }
  };
})();
