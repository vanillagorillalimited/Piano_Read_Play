import asyncio, json
from playwright.async_api import async_playwright
S='/tmp/claude-0/-home-claude/6689039a-4e32-5de0-9980-f7b8f9867b03/scratchpad/'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']); ctx=await b.new_context(viewport={'width':390,'height':844}); pg=await ctx.new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        await pg.goto('file:///home/claude/notes-app/dist/test.html'); await pg.wait_for_timeout(1200)
        await pg.evaluate("window.__q = s => document.querySelector(s) || ((document.querySelector('[data-act=pa-sheet]') || {click(){}}).click(), document.querySelector(s));")
        ev=lambda js: pg.evaluate(js)
        async def click(sel, wait=400):
            await ev(f"__q({json.dumps(sel)}).click()"); await pg.wait_for_timeout(wait)
        # onboarding
        await click('[data-act=pick-level][data-level=beginner]')
        # practise drill: answer with keyboard correctly 20 times by reading state
        await click('[data-act=tab][data-tab=practise]')
        await click('[data-act=drill-go]')
        for k in range(20):
            info = await ev("""(()=>{ const sc=document.querySelector('[data-drill-score] .vf-stavenote'); return !!sc })()""")
            # find target midi via ReadMusic internals isn't exposed; press each key until ok
            keys = await ev("Array.from(document.querySelectorAll('[data-drill-kb] .k')).map(k=>+k.dataset.midi)")
            found=False
            for m in keys:
                await ev(f"""(()=>{{const k=document.querySelector('[data-drill-kb] .k[data-midi="{m}"]'); const r=k.getBoundingClientRect(); k.dispatchEvent(new PointerEvent('pointerdown',{{bubbles:true,clientX:r.x+3,clientY:r.y+r.height-10,pointerId:1}})); k.dispatchEvent(new PointerEvent('pointerup',{{bubbles:true,pointerId:1}}));}})()""")
                fb = await ev("(document.querySelector('[data-fb]')||{}).textContent||''")
                if fb and 'Not' not in fb and 'wrong' not in fb.lower() and fb.strip():
                    found=True; break
            await pg.wait_for_timeout(800)
            if await ev("!!document.querySelector('.drill-sum')"): break
        print('drill summary shown:', await ev("!!document.querySelector('.drill-sum')"), await ev("(document.querySelector('.sum-big')||{}).textContent"))
        await pg.screenshot(path=S+'f-drill.png')
        # letters drill inside lesson
        await click('[data-act=tab][data-tab=learn]'); await click('[data-act=open-lesson][data-id="b2-spaces"]')
        await click('[data-act=drill-start]')
        for k in range(12):
            for pc in [0,2,4,5,7,9,11]:
                await ev(f"document.querySelector('.letter[data-pc=\"{pc}\"]') && document.querySelector('.letter[data-pc=\"{pc}\"]').click()")
                fb = await ev("(document.querySelector('[data-b-root] [data-fb]')||{}).textContent||''")
                if fb and 'Not' not in fb: break
            await pg.wait_for_timeout(700)
            if await ev("!!document.querySelector('.drill-sum')"): break
        print('letters summary:', await ev("(document.querySelector('.sum-big')||{}).textContent"))
        # piece play-along: press correct keys from steps via clicking highlighted step midis (hint on)
        await click('[data-act=tab][data-tab=pieces]'); await click('[data-act=open-piece][data-id="p-ode"]', 800)
        await click('[data-act=pa-hint]')
        for k in range(40):
            targets = await ev("Array.from(document.querySelectorAll('[data-pa-kb] .k.target')).map(k=>+k.dataset.midi)")
            if not targets: break
            for m in targets:
                await ev(f"""(()=>{{const k=__q('[data-pa-kb] .k[data-midi="{m}"]'); k.dispatchEvent(new PointerEvent('pointerdown',{{bubbles:true,pointerId:2}})); k.dispatchEvent(new PointerEvent('pointerup',{{bubbles:true,pointerId:2}}));}})()""")
            await pg.wait_for_timeout(60)
        print('piece fb:', await ev("(document.querySelector('[data-fb]')||{}).textContent"))
        await pg.screenshot(path=S+'f-piece.png')
        # grand piece both hands
        await click('[data-act=tab][data-tab=pieces]'); await click('[data-act=open-piece][data-id="p-fur-elise"]', 800)
        await click('[data-act=pa-hint]')
        for k in range(80):
            targets = await ev("Array.from(document.querySelectorAll('[data-pa-kb] .k.target')).map(k=>+k.dataset.midi)")
            if not targets: break
            for m in targets:
                await ev(f"""(()=>{{const k=__q('[data-pa-kb] .k[data-midi="{m}"]'); k.dispatchEvent(new PointerEvent('pointerdown',{{bubbles:true,pointerId:3}})); k.dispatchEvent(new PointerEvent('pointerup',{{bubbles:true,pointerId:3}}));}})()""")
            await pg.wait_for_timeout(40)
        print('fur elise fb:', await ev("(document.querySelector('[data-fb]')||{}).textContent"))
        await pg.screenshot(path=S+'f-fur.png')
        # rhythm: start tap-along and tap a few times
        await click('[data-act=tab][data-tab=practise]'); await click('[data-act=open-rhythm][data-id="r-crotchets"]', 600)
        await click('[data-act=rh-go]', 300)
        await pg.wait_for_timeout(int(60/72*4*1000)+150)
        for t in range(12):
            await ev("document.querySelector('.tap-pad').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))")
            await pg.wait_for_timeout(int(60/72*1000))
        await pg.wait_for_timeout(5000)
        print('rhythm fb:', await ev("(document.querySelector('[data-fb]')||{}).textContent"))
        await pg.screenshot(path=S+'f-rhythm.png')
        # intervals & key quiz
        await click('[data-act=tab][data-tab=practise]'); await click('[data-act=open-intervals]'); await click('[data-act=int-answer][data-v="3"]', 300)
        print('int fb:', await ev("(document.querySelector('[data-fb]')||{}).textContent"))
        await click('[data-act=tab][data-tab=practise]'); await click('[data-act=open-keyquiz]'); await click('[data-act=kq-answer]', 300)
        print('kq fb:', await ev("(document.querySelector('[data-fb]')||{}).textContent"))
        await pg.screenshot(path=S+'f-kq.png')
        # library details
        await click('[data-act=tab][data-tab=library]'); await click('[data-act=lib-tab][data-v=keys]'); await click('.list [data-act=open-key][data-id="Eb"]', 600)
        await pg.screenshot(path=S+'f-key.png', full_page=True)
        await click('[data-act=back]'); await click('[data-act=lib-tab][data-v=symbols]'); await click('[data-act=open-symbol][data-id="pedal"]', 600)
        await pg.screenshot(path=S+'f-sym.png', full_page=True)
        # weak drill & settings
        await click('[data-act=tab][data-tab=practise]'); 
        print('weak disabled:', await ev("document.querySelector('[data-act=drill-weak]').disabled"))
        await click('[data-act=open-settings]'); await click('[data-act=set-look][data-v=minimal]')
        print('look:', await ev("document.documentElement.dataset.look"))
        print('errors:', errs[:10])
        await b.close()
asyncio.run(main())
