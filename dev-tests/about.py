import asyncio, json
from playwright.async_api import async_playwright
L8 = lambda n: f"({n}):q ({n}):8 ({n}):8 ({n}):8 ({n}):8"
RH = ["(a4 d5 f5):q r:q e5:8 f5:8","(c5 g5):q (c5 f5):q (c5 g5):q","(f5 a5):q (c5 g5):q (c5 f5):q","(f4 bb4 d5):q r:q d5:8 e5:8","(a4 d5 f5):q (a4 d5 f5):q (d5 a5):q","(bb4 d5 bb5):q (bb4 d5):q (bb4 g5):q","(a4 f5):q r:q g5:8 e5:8","(a4 d5):q r:q e5:8 c#5:8","(d5 f5 a5):h.","(d5 g5 bb5):h.","(c5 f5 a5):q (c5 f5 a5):q (c5 f5 a5):q","(c5 e5 a5):8 (c5 e5 g5):q r:8 r:q","(bb4 d5 g5):h.","(a4 d5 f5):h.","(a4 c#5 e5):q (a4 d5 f5):q (a4 c#5 e5):q","(a4 e5):8 d5:q (d4 d5):8 (e4 e5):8 (f4 f5):8","(a4 d5 f5 a5):q. (d4 d5):8 (e4 e5):8 (f4 f5):8","(bb4 d5 f5 bb5):q. (d4 d5):8 (e4 e5):8 (f4 f5):8","(a4 c5 f5 a5):q (a4 c5 f5 a5):q (c5 f5 a5 c6):q","(a4 c5 e5 a5):8 (g4 g5):q r:8 r:q","(g4 bb4 d5 g5):h.","(f4 a4 d5 f5):h.","(e4 a4 c#5 e5):q (f4 a4 d5 f5):q (e4 a4 c#5 e5):q","(d4 f4 a4 d5):q. r:8 r:q","d4:h.~","d4:h."]
LHn = ["d2 d3","c2 c3","f2 f3","bb1 bb2","d2 d3","g1 g2","a1 a2","a1 a2","d2 d3","g1 g2","f2 f3","c2 c3","g1 g2","a1 a2","a1 a2","d2 d3","d2 d3","bb1 bb2","f2 f3","c2 c3","g1 g2","a1 a2","a1 a2"]
LH = [L8(n) for n in LHn] + ["(d2 d3):q. (d2 d3):8 (d2 d3):8 (d2 d3):8", "(d1 d2):h.~", "(d1 d2):h."]
song = {"title": "Page test", "by": None, "clef": "grand", "key": "F", "time": "3/4", "bpm": 100, "rh": " | ".join(RH) + " FIN", "lh": " | ".join(LH) + " FIN", "created": 1, "at": 1}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':400,'height':900})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/notes-app/dist/test.html'); await pg.wait_for_timeout(800)
        await pg.evaluate("window.__q = s => document.querySelector(s) || ((document.querySelector('[data-act=pa-sheet]') || {click(){}}).click(), document.querySelector(s));")
        ev=lambda js: pg.evaluate(js)
        async def click(sel, wait=500):
            await pg.wait_for_function(f"!!__q({json.dumps(sel)})", timeout=8000); await ev(f"__q({json.dumps(sel)}).click()"); await pg.wait_for_timeout(wait)
        await click('[data-act=pick-level][data-level=beginner]')
        await ev("s => { const S = window.ReadMusic.Store; S.state.songs['song-test'] = s; S.save(); }".replace('s =>','') if False else f"(() => {{ const S = window.ReadMusic.Store; S.state.songs['song-test'] = {json.dumps(song)}; S.save(); }})()")
        await click('[data-act=tab][data-tab=pieces]')
        print('rows', await ev("Array.from(document.querySelectorAll('[data-id=\"song-test\"]')).map(e => e.outerHTML.slice(0,90))"))
        await click('[data-act=open-piece][data-id="song-test"]', 1500)
        print('ERRS', errs); print('VIEW', await ev("document.querySelector('main').innerText.slice(0,200)"))
        print(await ev("(() => { try { const s = window.ReadMusic.Store.state.songs['song-test']; const a = analysePiece(Object.assign({mine:true}, s)); try { aboutCard(Object.assign({mine:true,id:'x'}, s)); } catch (e) { return 'CARD ' + e.stack; } return a ? 'ok' : 'null'; } catch (e) { return e.stack; } })()"))
        print(await ev("document.querySelector('.about-piece').innerText"))
        print('orange notes in score:', await ev("document.querySelectorAll('[data-piece] [fill=\"#E0601F\"]').length"))
        await pg.screenshot(path='about-top.png', full_page=False)
        await ev("document.querySelector('.about-piece').scrollIntoView()"); await pg.wait_for_timeout(300)
        await pg.locator('.about-piece').screenshot(path='about-card.png')
        await pg.locator('[data-piece]').screenshot(path='about-score.png')
        await click('[data-act=about-loop]', 800)
        print('loop:', await ev("[__q('[data-change=pa-from]').value, __q('[data-change=pa-to]').value, __q('[data-change=pa-loop]').checked]"))
        await click('.about-piece [data-act=open-key]', 800)
        print('KEY PAGE:', (await ev("document.querySelector('main').innerText"))[:700])
        await pg.screenshot(path='about-key.png', full_page=True)
        print('errors', errs); await b.close()
asyncio.run(main())
