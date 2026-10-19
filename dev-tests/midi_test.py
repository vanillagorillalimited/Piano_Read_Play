import asyncio, json
from playwright.async_api import async_playwright
MOCK = open('hmp.py').read().split('MOCK = """')[1].split('"""')[0].replace("sample.json = async (input, opts) => {", "sample.json = async (input, opts) => { window.__calls = (window.__calls||0) + 1;")
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx=await b.new_context(viewport={'width':390,'height':844}); await ctx.add_init_script(MOCK); pg=await ctx.new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        await pg.goto('file:///home/claude/notes-app/dist/test.html'); await pg.wait_for_timeout(1200)
        await pg.evaluate("window.__q = s => document.querySelector(s) || ((document.querySelector('[data-act=pa-sheet]') || {click(){}}).click(), document.querySelector(s));")
        ev=lambda js: pg.evaluate(js)
        async def click(sel, wait=400):
            await pg.wait_for_function(f"!!__q({json.dumps(sel)})", timeout=10000); await ev(f"__q({json.dumps(sel)}).click()"); await pg.wait_for_timeout(wait)
        await click('[data-act=pick-level][data-level=beginner]')
        for f in ['xml/waltz.mid', 'xml/pickup.mid', 'xml/onetrack.mid']:
            await click('[data-act=tab][data-tab=pieces]', 400)
            await pg.set_input_files('#scan-pick', [f]); await pg.wait_for_timeout(1500)
            ok = await ev("!!document.querySelector('[data-scan-score] svg')")
            warn = await ev("Array.from(document.querySelectorAll('.scan-warn li')).map(l=>l.textContent.slice(0,70))")
            await click('[data-act=scan-save]', 800)
            print(f, 'rendered', ok, warn)
        print(json.dumps([{ 't': s.get('title'), 'key': s.get('key'), 'time': s.get('time'), 'bpm': s.get('bpm'), 'rh': s.get('rh') or s.get('music'), 'lh': s.get('lh')} for s in json.loads(await ev("JSON.stringify(Object.values(window.ReadMusic.Store.state.songs))"))], indent=0))
        # cache: read the same PDF twice
        for i in range(2):
            await click('[data-act=tab][data-tab=pieces]', 400)
            await pg.set_input_files('#scan-pick', ['xml/sheet.pdf']); await pg.wait_for_timeout(3500)
            await click('[data-act=scan-read]', 300); await pg.wait_for_function("!!document.querySelector('[data-act=scan-save]')", timeout=15000)
            print('read', i+1, 'API calls so far:', await ev('window.__calls'), '| cached note:', await ev("(document.querySelector('.scan-main').textContent.match(/read before[^.]*/)||[''])[0]"))
        await click('[data-act=scan-again]', 300); await pg.wait_for_function("!!document.querySelector('[data-act=scan-save]')", timeout=15000)
        print('careful read: API calls', await ev('window.__calls'), 'tier', await ev('JSON.stringify(window.__sampleCall.tier)'))
        print('errors', errs)
        await b.close()
asyncio.run(main())
