import asyncio, json
from playwright.async_api import async_playwright
S='/tmp/claude-0/-home-claude/6689039a-4e32-5de0-9980-f7b8f9867b03/scratchpad/'
FAKE="""
(() => {
  const inp = { name: 'Test Piano', state: 'connected', onmidimessage: null };
  const access = { inputs: new Map([['a', inp]]), outputs: new Map(), onstatechange: null };
  navigator.requestMIDIAccess = () => Promise.resolve(access);
  window.__midi = (bytes) => inp.onmidimessage && inp.onmidimessage({ data: new Uint8Array(bytes) });
})();
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx=await b.new_context(viewport={'width':390,'height':844}); await ctx.add_init_script(FAKE); pg=await ctx.new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        await pg.goto('file:///home/claude/notes-app/dist/test.html'); await pg.wait_for_timeout(1200)
        await pg.evaluate("window.__q = s => document.querySelector(s) || ((document.querySelector('[data-act=pa-sheet]') || {click(){}}).click(), document.querySelector(s));")
        ev=lambda js: pg.evaluate(js)
        async def click(sel, wait=400):
            await ev(f"__q({json.dumps(sel)}).click()"); await pg.wait_for_timeout(wait)
        await click('[data-act=pick-level][data-level=beginner]')
        print('title:', await pg.title(), '|', await ev("document.querySelector('.topbar .title').textContent"))
        await click('[data-act=tab][data-tab=pieces]'); await click('[data-act=open-piece][data-id="p-ode-hands"]', 800)
        await click('[data-act=midi-connect]', 500)
        await click('[data-act=pa-hint]', 200)
        # --- wait mode, section bars 2-3 with loop
        await ev("const s=__q('[data-change=pa-from]'); s.value='2'; s.dispatchEvent(new Event('change',{bubbles:true}))"); await pg.wait_for_timeout(500)
        await ev("const s=__q('[data-change=pa-to]'); s.value='3'; s.dispatchEvent(new Event('change',{bubbles:true}))"); await pg.wait_for_timeout(500)
        await ev("__q('[data-change=pa-loop]').click()"); await pg.wait_for_timeout(200)
        n=0
        for i in range(200):
            fb = await ev("document.querySelector('[data-fb]').textContent")
            if 'Loop 2' in fb: break
            t = await ev("Array.from(document.querySelectorAll('[data-pa-kb] .k.target')).map(k=>+k.dataset.midi)")
            if not t: await pg.wait_for_timeout(120); continue
            for m in t: await ev(f"__midi([0x90,{m},80])"); n+=1
            await pg.wait_for_timeout(30)
        print('wait loop fb:', await ev("document.querySelector('[data-fb]').textContent"), 'presses', n)
        await pg.screenshot(path=S+'perf-wait.png')
        # listen section, tempo
        await click('[data-act=pa-tempo][data-d="-4"]', 100); await click('[data-act=pa-tempo][data-d="-4"]', 100)
        print('tempo:', await ev("document.querySelector('[data-pa-bpm]').textContent"))
        await click('[data-act=pa-listen]', 1500); await click('[data-act=pa-listen]', 300)
        await click('[data-act=pa-whole]', 500)
        # --- perform mode
        await click('[data-act=pa-mode][data-v=perform]', 600)
        await ev("""(() => { window.__pressed = 0; const seen = new Set(); function loop(){ document.querySelectorAll('[data-pa-kb] .k.target').forEach(k => { const m=+k.dataset.midi; const key = m + ':' + document.querySelectorAll('.score-svg .hi').length + ':' + Math.floor(performance.now()/10000); }); requestAnimationFrame(loop); } })()""")
        # simpler: page-side observer that presses newly targeted keys immediately
        await ev("""(() => { let prev = new Set(); window.__pressed = 0; function tick(){ const now = new Set(Array.from(document.querySelectorAll('[data-pa-kb] .k.target')).map(k=>+k.dataset.midi)); now.forEach(m => { if (!prev.has(m)) { __midi([0x90,m,90]); window.__pressed++; } }); prev = now; requestAnimationFrame(tick); } tick(); })()""")
        if await ev("document.querySelector('[data-act=pa-perform]') !== null") is False: print('no start')
        await click('[data-act=pa-perform]', 200)
        for i in range(120):
            await pg.wait_for_timeout(500)
            fb = await ev("document.querySelector('[data-fb]').textContent")
            if '%' in fb and 'Notes' in fb: break
        print('perform fb:', fb, '| pressed', await ev("window.__pressed"))
        await pg.screenshot(path=S+'perf-done.png')
        print('errors', errs)
        await b.close()
asyncio.run(main())
