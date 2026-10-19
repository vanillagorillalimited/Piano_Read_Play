import asyncio, json
from playwright.async_api import async_playwright
NATIVE = r"""
(() => {
  window.READ_PLAY_CONFIG = { revenueCat: { ios: 'appl_test', android: 'goog_test', entitlement: 'premium' }, termsUrl: 'https://example.com/terms', privacyUrl: 'https://example.com/privacy' };
  window.__active = false; window.__calls = [];
  const info = () => ({ entitlements: { active: window.__active ? { premium: { expirationDate: '2026-11-19T10:00:00Z', willRenew: true, productIdentifier: 'rp_monthly' } } : {} } });
  const offering = { current: { availablePackages: [
    { identifier: '$rc_monthly', packageType: 'MONTHLY', product: { priceString: '£4.99', introPrice: null } },
    { identifier: '$rc_annual', packageType: 'ANNUAL', product: { priceString: '£39.99', pricePerMonthString: '£3.33', introPrice: { periodNumberOfUnits: 1, periodUnit: 'WEEK', price: 0 } } } ] } };
  const plugins = {
    Purchases: { configure: async a => { __calls.push('configure:' + a.apiKey); }, getAppUserID: async () => ({ appUserID: '$RCAnonymousID:abc123' }), getCustomerInfo: async () => ({ customerInfo: info() }),
      getOfferings: async () => offering, purchasePackage: async a => { __calls.push('buy:' + a.aPackage.identifier); window.__active = true; return { customerInfo: info() }; },
      restorePurchases: async () => ({ customerInfo: info() }) },
  };
  const any = name => plugins[name] || new Proxy({}, { get: (t, k) => k === 'then' ? undefined : (k === 'addListener' ? async () => ({ remove(){} }) : async () => ({})) });
  window.Capacitor = { isNativePlatform: () => true, isPluginAvailable: n => n !== 'ReadPlayMidi', registerPlugin: any, getPlatform: () => 'ios', Plugins: {} };
})();
"""
async def run(native):
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={'width':390,'height':844})
        if native: await ctx.add_init_script(NATIVE)
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/notes-app/' + ('www/index.html' if native else 'dist/test.html')); await pg.wait_for_timeout(1200)
        ev=lambda js: pg.evaluate(js)
        async def click(sel, wait=500):
            await pg.wait_for_function(f"!!document.querySelector({json.dumps(sel)})", timeout=8000); await ev(f"document.querySelector({json.dumps(sel)}).click()"); await pg.wait_for_timeout(wait)
        skip = lambda: ev("document.querySelector('[data-tour=skip]') && document.querySelector('[data-tour=skip]').click()")
        await click('[data-act=pick-level][data-level=beginner]', 1500); await skip()
        if not native:
            print('web, default: locked tags =', await ev("document.querySelectorAll('.lock-tag').length"))
            await click('[data-act=open-settings]', 400); print('settings card:', (await ev("[...document.querySelectorAll('.card')].find(c => c.textContent.includes('PREMIUM') || c.querySelector('.eyebrow')?.textContent === 'Premium')?.innerText.slice(0,140)")))
            await click('[data-act=premium-preview-free]', 400); await click('[data-act=back]', 400)
        print('locked level tags:', await ev("document.querySelectorAll('.level-row .lock-tag').length"))
        await click('[data-act=level-view][data-level=intermediate]', 400)
        await click('.lesson-row[data-act=open-lesson]', 800)
        print('opening an Intermediate lesson ->', await ev("document.querySelector('.topbar .title').textContent"), '|', await ev("(document.querySelector('.pay-hero p')||{}).textContent"))
        await pg.screenshot(path=f"pay-{'native' if native else 'web'}.png")
        print('plans:', await ev("[...document.querySelectorAll('.pay-opt')].map(b => b.innerText.replace(/\\n/g,' '))"), '| button:', await ev("document.querySelector('.pay-go').textContent"))
        await click('[data-act=premium-buy]', 900)
        print('after buying ->', await ev("document.querySelector('.topbar .title').textContent"), '| locked tags left:', await ev("document.querySelectorAll('.lock-tag').length"))
        if native:
            print('calls:', await ev('__calls'))
            await click('[data-act=open-settings]', 500); print('settings:', await ev("[...document.querySelectorAll('section.card')].find(c => c.querySelector('.eyebrow') && c.querySelector('.eyebrow').textContent === 'Premium').innerText.replace(/\\n/g,' | ')"))
        print('errors', errs); await b.close()
asyncio.run(run(False)); print('-----'); asyncio.run(run(True))
