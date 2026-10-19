/* ============================================================
   On-screen piano keyboard. Keys are pressed on pointerdown (no
   delay) and the range moves with the arrow buttons, so a swipe
   never plays a note by accident.
   ============================================================ */
const IS_BLACK = [false, true, false, true, false, false, true, false, true, false, true, false];
function isBlack(m) { return IS_BLACK[((m % 12) + 12) % 12]; }

function createKeyboard(host, opts = {}) {
  const o = Object.assign({ from: 48, to: 72, labels: 'c', minKey: 26, sound: true, onPress: null, view: null }, opts);
  host.innerHTML = '';
  host.classList.add('kb-wrap');
  const whites = [];
  for (let m = o.from; m <= o.to; m++) if (!isBlack(m)) whites.push(m);
  const prev = document.createElement('button'), next = document.createElement('button');
  prev.className = next.className = 'kb-nav';
  prev.setAttribute('aria-label', 'Lower notes'); next.setAttribute('aria-label', 'Higher notes');
  prev.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  next.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  const viewport = document.createElement('div'); viewport.className = 'kb-view';
  const strip = document.createElement('div'); strip.className = 'kb';
  viewport.appendChild(strip);
  host.append(prev, viewport, next);

  const keyEls = new Map();
  whites.forEach((m, i) => {
    const k = document.createElement('div');
    k.className = 'k w'; k.dataset.midi = m;
    k.setAttribute('role', 'button'); k.setAttribute('aria-label', midiLabel(m));
    k.style.left = `calc(var(--kw) * ${i})`;
    k.innerHTML = `<span class="kl">${labelFor(m)}</span>`;
    strip.appendChild(k); keyEls.set(m, k);
  });
  for (let m = o.from; m <= o.to; m++) {
    if (!isBlack(m)) continue;
    const wi = whites.indexOf(m - 1);
    if (wi < 0) continue;
    const k = document.createElement('div');
    k.className = 'k b'; k.dataset.midi = m;
    k.setAttribute('role', 'button'); k.setAttribute('aria-label', midiLabel(m));
    k.style.left = `calc(var(--kw) * ${wi + 1} - var(--kw) * 0.31)`;
    k.innerHTML = `<span class="kl">${o.labels === 'all' ? labelFor(m) : ''}</span>`;
    strip.appendChild(k); keyEls.set(m, k);
  }
  function labelFor(m) {
    if (o.labels === 'none') return '';
    const n = NOTE_NAMES[m % 12];
    if (o.labels === 'c') return m % 12 === 0 ? 'C' + (Math.floor(m / 12) - 1) : '';
    return isBlack(m) ? n.replace('♯', '♯') : n + (m % 12 === 0 ? Math.floor(m / 12) - 1 : '');
  }
  function midiLabel(m) { return NOTE_NAMES[m % 12] + (Math.floor(m / 12) - 1); }

  let offset = 0, kw = 30, visible = whites.length;
  function layout() {
    prev.hidden = next.hidden = true;
    let w = viewport.clientWidth || host.clientWidth || 320;
    if (w / whites.length >= o.minKey) { kw = w / whites.length; visible = whites.length; }
    else {
      prev.hidden = next.hidden = false;
      w = viewport.clientWidth || w - 72;
      visible = Math.max(5, Math.floor(w / o.minKey));
      kw = w / visible;
    }
    host.classList.toggle('kb-scrolls', visible < whites.length);
    host.style.setProperty('--kw', kw + 'px');
    strip.style.width = kw * whites.length + 'px';
    setOffset(offset);
  }
  function setOffset(i) {
    offset = Math.max(0, Math.min(whites.length - visible, i));
    strip.style.transform = `translateX(${-offset * kw}px)`;
    prev.disabled = offset <= 0; next.disabled = offset >= whites.length - visible;
  }
  function showMidi(m, align = 'center') {
    let wi = whites.indexOf(isBlack(m) ? m - 1 : m);
    if (wi < 0) return;
    if (align === 'start') setOffset(wi);
    else setOffset(Math.round(wi - visible / 2 + 0.5));
  }
  function ensureVisible(m) {
    const wi = whites.indexOf(isBlack(m) ? m - 1 : m);
    if (wi < offset || wi >= offset + visible) showMidi(m);
  }
  prev.addEventListener('click', () => setOffset(offset - 7));
  next.addEventListener('click', () => setOffset(offset + 7));

  const down = new Map();
  strip.addEventListener('pointerdown', e => {
    const k = e.target.closest('.k'); if (!k) return;
    e.preventDefault();
    const m = +k.dataset.midi;
    k.classList.add('down');
    try { strip.setPointerCapture(e.pointerId); } catch (err) {}
    down.set(e.pointerId, k);
    if (o.sound) Piano.note(m, undefined, { gain: 0.85, dur: 1.4 });
    if (o.onPress) o.onPress(m, k);
  });
  const up = e => { const k = down.get(e.pointerId); if (k) { k.classList.remove('down'); down.delete(e.pointerId); } };
  strip.addEventListener('pointerup', up); strip.addEventListener('pointercancel', up); strip.addEventListener('lostpointercapture', up);
  strip.addEventListener('contextmenu', e => e.preventDefault());

  const ro = window.ResizeObserver ? new ResizeObserver(() => layout()) : null;
  if (ro) ro.observe(host);
  requestAnimationFrame(layout);
  if (o.view) requestAnimationFrame(() => showMidi(o.view));

  return {
    el: host,
    mark(m, cls, on = true) { const k = keyEls.get(m); if (k) k.classList.toggle(cls, on); },
    flash(m, cls, ms = 450) { const k = keyEls.get(m); if (!k) return; k.classList.remove(cls); void k.offsetWidth; k.classList.add(cls); setTimeout(() => k.classList.remove(cls), ms); },
    clear(cls) { keyEls.forEach(k => cls ? k.classList.remove(cls) : k.classList.remove('target', 'ok', 'bad', 'lit', 'sel')); },
    heat(map) { keyEls.forEach((k, m) => { const v = map[m]; k.style.removeProperty('--heat'); k.classList.toggle('heat', v !== undefined); if (v !== undefined) k.style.setProperty('--heat', v); }); },
    showMidi, ensureVisible, layout,
    setSound(v) { o.sound = v; },
    label(m, txt) { const k = keyEls.get(m); if (!k) return; const l = k.querySelector('.kl'); if (l) l.textContent = txt; k.classList.toggle('fing', !!txt); },
    /* a key played on a connected MIDI keyboard */
    press(m) { const k = keyEls.get(m); if (k) k.classList.add('down'); if (o.onPress) o.onPress(m, k); },
    release(m) { const k = keyEls.get(m); if (k) k.classList.remove('down'); },
    get connected() { return host.isConnected; },
    get hasHandler() { return !!o.onPress; },
    destroy() { if (ro) ro.disconnect(); }
  };
}
