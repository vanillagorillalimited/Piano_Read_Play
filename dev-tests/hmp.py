import asyncio, json
from playwright.async_api import async_playwright
MOCK = """
(() => {
  const answer = {"title":"Sunlit Drive (test)","composer":null,"key":"G","time":"4/4","tempo":108,"staves":"grand",
    "rh":"b4:8 b4 b4 a4 b4:q d5 | a4:q. f#4:8 a4:h | b4:8 a4 g4 a4 b4:q e5 | e4:q. d4:8 e4:h FIN",
    "lh":"g2:8 g2 g2 g2 g2 g2 g2 g2 | d3:8 d3 d3 d3 d3 d3 d3 d3 | e2:8 e2 e2 e2 e2 e2 e2 e2 | c3:8 c3 c3 c3 c3 c3 c3 FIN", "music":"", "uncertain":"Bar 4 left hand may be missing a note."};
  const sample = async () => ({ text: JSON.stringify(answer), truncated: false });
  sample.json = async (input, opts) => { window.__sampleCall = { input: input.slice(0, 80), images: (opts.images||[]).length, tier: opts.modelTier, types: (opts.images||[]).map(b => b.type) };
    const txt = JSON.stringify(answer); for (let i = 0; i < 4; i++) { await new Promise(r => setTimeout(r, 250)); opts.onText && opts.onText({ text: txt.slice(0, (i+1) * txt.length / 4), delta: '' }); } return answer; };
  sample.limits = async () => ({ maxPromptBytes: 262144, images: { maxCount: 5, maxInputBytes: 20e6, mediaTypes: ['image/jpeg','image/png'] } });
  window.claude = { use: async n => n === 'sample' ? sample : null };
})();
"""
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
        await click('[data-act=tab][data-tab=pieces]')
        await pg.screenshot(path='hmp-1-card.png')
        await pg.set_input_files('#scan-pick', ['sheet-test.png'])
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path='hmp-2-ready.png')
        await click('[data-act=scan-read]', 300)
        await pg.screenshot(path='hmp-3-reading.png')
        await pg.wait_for_timeout(1800)
        print('sample call:', await ev('JSON.stringify(window.__sampleCall)'))
        await pg.screenshot(path='hmp-4-review.png', full_page=True)
        print('warnings:', await ev("Array.from(document.querySelectorAll('.scan-warn li')).map(l=>l.textContent)"))
        await click('[data-act=scan-save]', 900)
        print('song screen:', await ev("document.querySelector('.topbar .title').textContent"), '|', await ev("document.querySelector('.piece-sub').textContent"))
        # play it in wait mode
        await click('[data-act=pa-hint]', 200)
        for i in range(60):
            t = await ev("Array.from(document.querySelectorAll('[data-pa-kb] .k.target')).map(k=>+k.dataset.midi)")
            if not t: break
            for m in t: await ev(f"""(()=>{{const k=__q('[data-pa-kb] .k[data-midi="{m}"]'); k.dispatchEvent(new PointerEvent('pointerdown',{{bubbles:true,pointerId:2}})); k.dispatchEvent(new PointerEvent('pointerup',{{bubbles:true,pointerId:2}}));}})()""")
            await pg.wait_for_timeout(20)
        print('play:', await ev("document.querySelector('[data-fb]').textContent"))
        await pg.screenshot(path='hmp-5-song.png')
        # edit
        await click('[data-act=song-edit]', 600)
        await ev("const t=document.querySelector('[data-input=song-title]'); t.value='Sunlit edited'; t.dispatchEvent(new Event('input',{bubbles:true}))")
        await ev("const t=document.querySelector('[data-input=song-rh]'); t.value=t.value.replace('e4:q. d4:8 e4:h','e4:q. d4:8 zz e4:h'); t.dispatchEvent(new Event('input',{bubbles:true}))")
        await pg.wait_for_timeout(600)
        print('edit error msg:', await ev("document.querySelector('[data-song-msg]').textContent"))
        await pg.screenshot(path='hmp-6-edit.png')
        await ev("const t=document.querySelector('[data-input=song-rh]'); t.value=t.value.replace(' zz',''); t.dispatchEvent(new Event('input',{bubbles:true}))")
        await pg.wait_for_timeout(600)
        await click('[data-act=song-save]', 600)
        print('after save title:', await ev("document.querySelector('.topbar .title').textContent"))
        await click('[data-act=tab][data-tab=pieces]', 400)
        print('my songs rows:', await ev("Array.from(document.querySelectorAll('.hmp .list-row .t')).map(x=>x.textContent)"))
        await click('.hmp .list-row', 600)
        await click('[data-act=song-del-ask]', 300); await click('[data-act=song-del]', 600)
        print('after delete rows:', await ev("document.querySelectorAll('.hmp .list-row').length"))
        print('errors', errs)
        await b.close()
asyncio.run(main())
