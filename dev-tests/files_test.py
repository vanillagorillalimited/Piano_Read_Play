import asyncio, json
from playwright.async_api import async_playwright
MOCK = open('hmp.py').read().split('MOCK = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx=await b.new_context(viewport={'width':390,'height':844}); await ctx.add_init_script(MOCK); pg=await ctx.new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e))); pg.on('console', lambda m: m.type=='error' and 'ERR_TUNNEL' not in m.text and errs.append(m.text))
        await pg.goto('file:///home/claude/notes-app/dist/test.html'); await pg.wait_for_timeout(1200)
        await pg.evaluate("window.__q = s => document.querySelector(s) || ((document.querySelector('[data-act=pa-sheet]') || {click(){}}).click(), document.querySelector(s));")
        ev=lambda js: pg.evaluate(js)
        async def click(sel, wait=400):
            await pg.wait_for_function(f"!!__q({json.dumps(sel)})", timeout=10000); await ev(f"__q({json.dumps(sel)}).click()"); await pg.wait_for_timeout(wait)
        await click('[data-act=pick-level][data-level=beginner]')
        await click('[data-act=tab][data-tab=pieces]')
        print('accept:', await ev("document.querySelector('#scan-pick').accept"))
        # PDF
        await pg.set_input_files('#scan-pick', ['xml/sheet.pdf']); await pg.wait_for_timeout(4000)
        print('pdf pages shown:', await ev("document.querySelectorAll('.scan-thumbs img').length"), '| title:', await ev("document.querySelector('[data-input=scan-title]').value"))
        await pg.screenshot(path='files-pdf.png')
        await click('[data-act=scan-read]', 2500)
        print('pdf -> sample call:', await ev('JSON.stringify(window.__sampleCall)'))
        print('review shown:', await ev("!!document.querySelector('[data-scan-score] svg')"))
        # MusicXML
        for f in ['xml/waltz.musicxml', 'xml/waltz.mxl', 'xml/pickup.musicxml']:
            await click('[data-act=tab][data-tab=pieces]', 400)
            await pg.set_input_files('#scan-pick', [f]); await pg.wait_for_timeout(1500)
            info = await ev("({ p: document.querySelector('.scan-main p') && document.querySelector('.scan-main p').textContent, svg: !!document.querySelector('[data-scan-score] svg'), warn: Array.from(document.querySelectorAll('.scan-warn li')).map(l=>l.textContent) })")
            print(f, '->', info)
            await click('[data-act=scan-save]', 800)
            print('   saved song:', await ev("document.querySelector('.topbar .title').textContent"), '|', await ev("document.querySelector('.piece-sub').textContent"))
            if f.endswith('waltz.musicxml'):
                await pg.screenshot(path='files-waltz.png')
        print('stored songs:', await ev("JSON.stringify(Object.values(window.ReadMusic.Store.state.songs).map(s => ({t: s.title, key: s.key, time: s.time, bpm: s.bpm, rh: s.rh || s.music, lh: s.lh})))"))
        print('errors', errs)
        await b.close()
asyncio.run(main())
