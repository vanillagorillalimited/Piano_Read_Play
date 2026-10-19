/* ============================================================
   MIDI keyboards (USB or Bluetooth).
   In the App Store and Google Play apps: the app's own native MIDI
   plugin (plugins/readplay-midi), because the phone's built-in web
   view has no Web MIDI. In a browser: the Web MIDI API (Chrome, Edge
   and Opera on desktop, Chrome on Android; not Safari).
   ============================================================ */
const Midi = (() => {
  const C = typeof window !== 'undefined' ? window.Capacitor : null;
  const isNative = !!(C && C.isNativePlatform && C.isNativePlatform());
  let native = null;
  try { native = isNative && C.isPluginAvailable && C.isPluginAvailable('ReadPlayMidi') ? C.registerPlugin('ReadPlayMidi') : null; } catch (e) { native = null; }
  const supported = !!native || (!isNative && typeof navigator !== 'undefined' && typeof navigator.requestMIDIAccess === 'function');
  let nativeSubs = [];
  let access = null, status = supported ? 'off' : 'unsupported', inputs = [], error = '', handler = null, lastNote = 0;
  const listeners = new Set();
  function emit() { listeners.forEach(f => { try { f(); } catch (e) { console.error(e); } }); }
  function onMessage(e) {
    const d = e.data; if (!d || d.length < 2) return;
    const cmd = d[0] & 0xf0;
    if (cmd === 0x90 && d[2] > 0) noteOn(d[1], d[2]);
    else if (cmd === 0x80 || (cmd === 0x90 && d[2] === 0)) noteOff(d[1]);
    else if (cmd === 0xb0 && d[1] === 64 && handler && handler.pedal) handler.pedal(d[2] >= 64);
  }
  function refresh() {
    inputs = [];
    if (!access) return;
    access.inputs.forEach(inp => {
      inp.onmidimessage = onMessage;
      if (inp.state !== 'disconnected') inputs.push(inp.name || 'MIDI keyboard');
    });
    status = inputs.length ? 'ready' : 'waiting';
    emit();
  }
  function nativeInputs(list) { inputs = (list || []).slice(); status = inputs.length ? 'ready' : 'waiting'; emit(); }
  async function connect() {
    if (!supported) { status = 'unsupported'; emit(); return false; }
    status = 'asking'; emit();
    if (native) {
      try {
        if (!nativeSubs.length) {
          nativeSubs.push(await native.addListener('midiMessage', ev => onMessage({ data: ev.data })));
          nativeSubs.push(await native.addListener('devicesChanged', ev => nativeInputs(ev.inputs)));
        }
        const r = await native.start();
        nativeInputs(r && r.inputs);
        return true;
      } catch (e) { status = 'blocked'; error = (e && e.message) || ''; emit(); return false; }
    }
    try {
      access = await navigator.requestMIDIAccess({ sysex: false });
      access.onstatechange = refresh;
      refresh();
      return true;
    } catch (e) {
      access = null; status = 'blocked'; error = (e && (e.name || e.message)) || ''; emit();
      return false;
    }
  }
  // Bluetooth MIDI keyboards have to be paired from inside the app (iOS shows Apple's pairing screen; Android scans for them)
  async function pairBluetooth() {
    if (!native) return { ok: false };
    try { if (status === 'off' || status === 'blocked') await connect(); const r = await native.pairBluetooth(); if (r && r.inputs) nativeInputs(r.inputs); return { ok: true, found: (r && r.connected) || [] }; }
    catch (e) { error = (e && e.message) || ''; return { ok: false, error }; }
  }
  function disconnect() {
    if (native) { native.stop().catch(() => {}); nativeSubs.forEach(h => h && h.remove && h.remove()); nativeSubs = []; inputs = []; status = 'off'; emit(); return; }
    if (access) { access.inputs.forEach(i => { i.onmidimessage = null; }); access.onstatechange = null; }
    access = null; inputs = []; status = supported ? 'off' : 'unsupported'; emit();
  }
  function noteOn(m, v = 100) { lastNote = Date.now(); if (handler) handler.on(m, v); }
  function noteOff(m) { if (handler) handler.off(m); }
  return {
    supported, connect, disconnect, noteOn, noteOff, pairBluetooth, canPairBluetooth: !!native,
    get status() { return status; }, get inputs() { return inputs.slice(); }, get error() { return error; },
    get lastNote() { return lastNote; },
    setHandler(h) { handler = h; },
    onChange(f) { listeners.add(f); return () => listeners.delete(f); }
  };
})();
window.ReadMusicMIDI = { noteOn: (m, v) => Midi.noteOn(m, v || 100), noteOff: m => Midi.noteOff(m), connect: () => Midi.connect() };
