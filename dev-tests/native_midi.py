import asyncio, json
from playwright.async_api import async_playwright
MOCK = r"""
(() => {
  const listeners = {}; window.__calls = [];
  const plugin = name => new Proxy({}, { get: (t, k) => {
    if (k === 'addListener') return async (ev, fn) => { (listeners[name + ':' + ev] = listeners[name + ':' + ev] || []).push(fn); return { remove(){} }; };
    if (k === 'then') return undefined;
    return async (args) => { window.__calls.push(name + '.' + String(k)); if (name === 'ReadPlayMidi' && (k === 'start' || k === 'pairBluetooth')) return { inputs: ['Roland FP-30X'], connected: ['Roland FP-30X'] }; if (name === 'Preferences' && k === 'get') return { value: null }; return {}; };
  } });
  window.Capacitor = { isNativePlatform: () => true, isPluginAvailable: () => true, registerPlugin: plugin, getPlatform: () => 'ios', Plugins: {} };
  window.__fire = (ev, data) => (listeners['ReadPlayMidi:' + ev] || []).forEach(f => f(data));
})();
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={'width':390,'height':844}); await ctx.add_init_script(MOCK); pg=await ctx.new_page()
        errs=[]; ext=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('request', lambda r: ext.append(r.url) if not r.url.startswith('file://') and not r.url.startswith('data:') and not r.url.startswith('blob:') else None)
        await pg.goto('file:///home/claude/notes-app/www/index.html'); await pg.wait_for_timeout(1200)
        ev=lambda js: pg.evaluate(js)
        async def click(sel, wait=500):
            await pg.wait_for_function(f"!!document.querySelector({json.dumps(sel)})", timeout=8000); await ev(f"document.querySelector({json.dumps(sel)}).click()"); await pg.wait_for_timeout(wait)
        await click('[data-act=pick-level][data-level=beginner]', 1500); await click('[data-tour=skip]', 300)
        print('fonts:', await ev("[document.fonts.check('16px Mulish'), document.fonts.check('600 20px \"Bodoni Moda\"')]"))
        await click('[data-act=open-settings]', 500)
        print('settings MIDI buttons:', await ev("Array.from(document.querySelectorAll('#midi button')).map(b => b.textContent.trim())"))
        await click('#midi [data-act=midi-connect]', 600)
        print('status:', await ev("document.querySelector('[data-midi-status]').textContent"))
        await click('#midi [data-act=midi-bluetooth]', 600)
        await ev("__fire('devicesChanged', { inputs: ['Roland FP-30X', 'Yamaha P-125'] })"); await pg.wait_for_timeout(300)
        print('after device change:', await ev("document.querySelector('[data-midi-status]').textContent"))
        # play a piece from the "keyboard"
        await click('[data-act=back]', 400); await click('[data-act=tab][data-tab=pieces]', 1200); await ev("document.querySelector('[data-tour=skip]') && document.querySelector('[data-tour=skip]').click()")
        await click('[data-act=open-piece][data-id="p-ode"]', 1200); await ev("document.querySelector('[data-tour=skip]') && document.querySelector('[data-tour=skip]').click()")
        for m in [64, 64, 65, 67]:
            await ev(f"__fire('midiMessage', {{ data: [144, {m}, 90] }})"); await pg.wait_for_timeout(120)
            await ev(f"__fire('midiMessage', {{ data: [128, {m}, 0] }})"); await pg.wait_for_timeout(120)
        print('notes marked right:', await ev("document.querySelectorAll('[data-piece] .ok').length"))
        print('native calls:', sorted(set(await ev('window.__calls'))))
        print('external requests:', ext)
        print('errors', errs); await b.close()
asyncio.run(main())
