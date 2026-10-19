/* ============================================================
   Premium: subscriptions through RevenueCat in the App Store and
   Google Play apps. In a browser (and in the Claude preview)
   everything is unlocked, with a switch in Settings to try the
   free version and a demo of the upgrade screen.
   ============================================================ */
// What the free version includes. Change these to move the line between free and Premium.
const FREE_RULES = Object.assign({
  levels: ['beginner'],     // course levels that are free
  pieceLevels: 3,           // pieces up to this level are free
  songs: 1                  // songs a free user can keep from MusicXML or MIDI files (reading photos and PDFs is Premium)
}, (window.READ_PLAY_CONFIG && window.READ_PLAY_CONFIG.free) || {});

const Premium = (() => {
  const C = window.Capacitor;
  const native = !!(C && C.isNativePlatform && C.isNativePlatform());
  let rc = null;
  try { rc = native && C.isPluginAvailable && C.isPluginAvailable('Purchases') ? C.registerPlugin('Purchases') : null; } catch (e) { rc = null; }
  const cfg = () => (window.READ_PLAY_CONFIG && window.READ_PLAY_CONFIG.revenueCat) || {};
  const entitlement = () => cfg().entitlement || 'premium';
  const apiKey = () => native && C.getPlatform ? (C.getPlatform() === 'ios' ? cfg().ios : cfg().android) : '';
  const CACHE = 'rmp-premium:v1';
  let cached = false; try { cached = JSON.parse(localStorage.getItem(CACHE) || '{}').active === true; } catch (e) {}
  const state = { mode: rc && apiKey() ? 'store' : native ? 'unconfigured' : 'web', ready: false, active: cached, userId: null, offering: null, expires: null, willRenew: null, product: null, error: '' };
  const listeners = new Set();
  const emit = () => listeners.forEach(f => { try { f(); } catch (e) { console.error(e); } });

  function apply(info) {
    const e = info && info.entitlements && info.entitlements.active && info.entitlements.active[entitlement()];
    state.active = !!e;
    state.expires = e ? e.expirationDate : null;
    state.willRenew = e ? e.willRenew : null;
    state.product = e ? e.productIdentifier : null;
    try { localStorage.setItem(CACHE, JSON.stringify({ active: state.active, at: Date.now() })); } catch (err) {}
    emit();
  }
  async function refresh() {
    if (state.mode !== 'store') return;
    try { const r = await rc.getCustomerInfo(); apply(r && r.customerInfo); } catch (e) { state.error = e && e.message || ''; }
  }
  async function init() {
    if (state.mode !== 'store') { state.ready = true; emit(); return; }
    try {
      await rc.configure({ apiKey: apiKey() });
      const id = await rc.getAppUserID(); state.userId = id && id.appUserID;
      await refresh();
      loadOffering();
      document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
    } catch (e) { state.error = (e && e.message) || 'Couldn’t reach the App Store'; }
    state.ready = true; emit();
  }
  async function loadOffering() {
    if (state.mode !== 'store') return null;
    try { const o = await rc.getOfferings(); state.offering = (o && o.current) || null; emit(); } catch (e) { state.error = (e && e.message) || ''; }
    return state.offering;
  }
  // returns 'done', 'cancelled' or throws with a message
  async function buy(pkg) {
    if (state.mode !== 'store') throw new Error('Purchases work in the App Store and Google Play apps.');
    try {
      const r = await rc.purchasePackage({ aPackage: pkg });
      apply(r && r.customerInfo);
      return state.active ? 'done' : 'pending';
    } catch (e) {
      if (e && (e.userCancelled || e.code === '1' || e.code === 1 || /cancel/i.test(e.message || ''))) return 'cancelled';
      throw new Error((e && e.message) || 'The purchase didn’t go through.');
    }
  }
  async function restore() {
    if (state.mode !== 'store') return false;
    const r = await rc.restorePurchases(); apply(r && r.customerInfo);
    return state.active;
  }
  return {
    init, refresh, loadOffering, buy, restore,
    get mode() { return state.mode; }, get ready() { return state.ready; }, get active() { return state.active; },
    get userId() { return state.userId; }, get offering() { return state.offering; }, get expires() { return state.expires; },
    get willRenew() { return state.willRenew; }, get product() { return state.product; }, get error() { return state.error; },
    onChange(f) { listeners.add(f); return () => listeners.delete(f); }
  };
})();
