import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':844})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/notes-app/dist/test.html'); await pg.wait_for_timeout(800)
        ev=lambda js: pg.evaluate(js)
        await ev("document.querySelector('[data-act=pick-level][data-level=beginner]').click()"); await pg.wait_for_timeout(300)
        ids = await ev("PIECES.map(p => p.id)"); missing = []
        for i in ids:
            await ev("document.querySelector('[data-act=tab][data-tab=pieces]').click()"); await pg.wait_for_timeout(120)
            await ev(f"(() => {{ const b = document.createElement('button'); b.dataset.act = 'open-piece'; b.dataset.id = '{i}'; document.querySelector('main').appendChild(b); b.click(); }})()"); await pg.wait_for_timeout(250)
            if not await ev("!!document.querySelector('.about-piece')"): missing.append(i)
        print(len(ids), 'pieces; without card:', missing, 'errors', errs[:5]); await b.close()
asyncio.run(main())
