import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']); pg=await b.new_page(viewport={'width':390,'height':844})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/notes-app/dist/test.html'); await pg.wait_for_timeout(800)
        await pg.evaluate("window.__q = s => document.querySelector(s) || ((document.querySelector('[data-act=pa-sheet]') || {click(){}}).click(), document.querySelector(s));")
        ev=lambda js: pg.evaluate(js)
        async def click(sel, wait=400):
            await pg.wait_for_function(f"!!__q({json.dumps(sel)})", timeout=8000); await ev(f"__q({json.dumps(sel)}).click()"); await pg.wait_for_timeout(wait)
        await click('[data-act=pick-level][data-level=beginner]')
        await ev("""(() => { window.__n = []; const o = Piano.note.bind(Piano); Piano.note = (m, t, x) => { window.__n.push(m); return o(m, t, x); };
          const P = PIECES.find(p => p.id === 'p-minuet'); const mid = s => parseMusic(s).flatMap(b => b.items.flatMap(i => i.pitches.map(x => x.midi)));
          window.__rh = new Set(mid(P.rh)); window.__lh = new Set(mid(P.lh)); })()""")
        await click('[data-act=tab][data-tab=pieces]')
        await ev("(() => { const b = document.createElement('button'); b.dataset.act = 'open-piece'; b.dataset.id = 'p-minuet'; document.querySelector('main').appendChild(b); b.click(); })()"); await pg.wait_for_timeout(1200)
        async def listen(label):
            await ev("window.__n = []"); await click('[data-act=pa-listen]', 3500); await click('[data-act=pa-listen]', 300)
            r = await ev("({ n: __n.length, onlyLH: __n.filter(m => __lh.has(m) && !__rh.has(m)).length, onlyRH: __n.filter(m => __rh.has(m) && !__lh.has(m)).length })")
            print(label, r)
        await listen('both hands:')
        await click('[data-act=pa-hands][data-v=rh]', 600); await listen('right only:')

        await click('[data-act=pa-hands][data-v=lh]', 600); await listen('left only:')
        await click('[data-act=pa-backing]', 600); await listen('left + hear right:')
        print('toggle:', await ev("__q('[data-act=pa-backing]').textContent"), await ev("__q('[data-act=pa-backing]').getAttribute('aria-pressed')"))
        await click('[data-act=pa-backing]', 600)
        # wait mode with left hand: the app shouldn't sound the right hand when it steps past it
        await ev("window.__n = []")
        await click('[data-act=pa-hands][data-v=lh]', 600)
        print('errors', errs); await b.close()
asyncio.run(main())
