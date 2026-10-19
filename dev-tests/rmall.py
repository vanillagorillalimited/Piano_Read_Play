import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':844})
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        pg.on('console', lambda m: errs.append('CONSOLE '+m.text) if m.type=='error' and 'TUNNEL' not in m.text else None)
        await pg.goto('file:///home/claude/notes-app/dist/test.html'); await pg.wait_for_timeout(1000)
        await pg.evaluate("document.querySelector('[data-act=pick-level]').click()"); await pg.wait_for_timeout(300)
        res = await pg.evaluate("""async () => {
          const out = []; const sleep = ms => new Promise(r => setTimeout(r, ms));
          const empties = sel => Array.from(document.querySelectorAll(sel)).filter(e => !e.querySelector('svg')).length;
          const ids = ALL_LESSONS.map(l => l.id);
          for (const id of ids) {
            document.querySelector('[data-act=tab][data-tab=learn]').click(); await sleep(30);
            const btn = document.querySelector(`[data-act=open-lesson][data-id="${id}"]`);
            if (!btn) { // other level
              const lv = ALL_LESSONS.find(l => l.id === id).level;
              document.querySelector(`[data-act=level-view][data-level=${lv}]`).click(); await sleep(30);
            }
            document.querySelector(`[data-act=open-lesson][data-id="${id}"]`).click(); await sleep(80);
            const e = empties('.score[data-score]') + empties('.ks-grid [data-ks]') + empties('[data-rh]') + empties('[data-int]') + empties('[data-ex]') + document.querySelectorAll('.hands-fig svg circle').length*0;
            if (e) out.push('lesson ' + id + ' empty scores ' + e);
          }
          for (const p of PIECES) {
            document.querySelector('[data-act=tab][data-tab=pieces]').click(); await sleep(30);
            document.querySelector(`[data-act=open-piece][data-id="${p.id}"]`).click(); await sleep(80);
            if (empties('[data-piece]')) out.push('piece ' + p.id + ' empty');
          }
          document.querySelector('[data-act=tab][data-tab=library]').click(); await sleep(30);
          document.querySelector('[data-act=lib-tab][data-v=symbols]').click(); await sleep(150);
          const blankThumbs = Array.from(document.querySelectorAll('.sym-art')).filter(e => !e.innerHTML.trim()).map(e => e.dataset.sym);
          if (blankThumbs.length) out.push('blank thumbs ' + blankThumbs.join(','));
          for (const s of SYMBOLS) {
            document.querySelector('[data-act=tab][data-tab=library]').click(); await sleep(20);
            document.querySelector('[data-act=lib-tab][data-v=symbols]').click(); await sleep(40);
            document.querySelector(`[data-act=open-symbol][data-id="${s.id}"]`).click(); await sleep(40);
            if (s.ex && empties('.score[data-score]')) out.push('symbol ' + s.id + ' empty');
          }
          for (const k of MAJOR_KEYS) {
            document.querySelector('[data-act=tab][data-tab=library]').click(); await sleep(20);
            document.querySelector('[data-act=lib-tab][data-v=keys]').click(); await sleep(30);
            document.querySelector(`.list [data-act=open-key][data-id="${k}"]`).click(); await sleep(40);
            if (empties('.score[data-score]')) out.push('key ' + k + ' empty');
          }
          return out;
        }""")
        print('\n'.join(res) or 'all rendered')
        print('errors', errs[:10])
        await b.close()
asyncio.run(main())
