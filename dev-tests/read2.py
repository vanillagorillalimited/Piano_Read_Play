import asyncio, json, sys
from playwright.async_api import async_playwright
FIXGOOD = sys.argv[1] if len(sys.argv) > 1 else 'good'
MOCK = r"""
(() => {
  const first = {"title":null,"composer":null,"key":"F","time":"3/4","tempo":null,"staves":"grand","uncertain":"","bars":[
    {"n":62,"rh":"(a4 d5 f5):q r:q e5:8 f5:8","lh":"(d2 d3):q (d2 d3):8 (d2 d3):q (d2 d3):8"},
    {"n":63,"rh":"(c5 g5):q (c5 f5):q","lh":"(c2 c3):q (c2 c3):8 (c2 c3):q (c2 c3):8"},
    {"n":64,"rh":"(f5 a5):q (c5 g5):q (c5 f5):q","lh":"(f2 f3):q (f2 f3):8 (f2 f3):8 (f2 f3):8 (f2 f3):8"},
    {"n":65,"rh":"(f4 b4 d5):q r:q d5:8 e5:8","lh":"(b1 b2):q (b1 b2):8 (b1 b2):8 (b1 b2):8"},
    {"n":66,"rh":"c#5:q c5:q bn4:q","lh":"(b1 b2):h."},
    {"n":67,"rh":"e5:q bn4:q b4:q~","lh":"b2:h.~"},
    {"n":68,"rh":"b4:q b4:q r:q","lh":"b2:h."}]};
  const fixGood = {"bars":[{"n":63,"rh":"(c5 g5):q (c5 f5):q (c5 g5):q","lh":"(c2 c3):q (c2 c3):8 (c2 c3):q (c2 c3):8"},{"n":65,"rh":"(f4 b4 d5):q r:q d5:8 e5:8","lh":"(b1 b2):q (b1 b2):8 (b1 b2):8 (b1 b2):8 (b1 b2):8"}]};
  const fixBad = {"bars":[{"n":63,"rh":"(c5 g5):q (c5 f5):q","lh":"(c2 c3):q (c2 c3):8 (c2 c3):q (c2 c3):8"}]};
  window.__calls = [];
  const sample = async () => ({ text: '', truncated: false });
  sample.json = async (input, opts) => {
    const fix = input.includes('THIS IS A SECOND LOOK');
    window.__calls.push({ fix, images: (opts.images||[]).length, tier: opts.modelTier, closeups: /close-ups? of the lines/.test(input), probs: fix ? input.split('\n').filter(l => l.startsWith('- Bar')) : [] });
    const ans = fix ? (FIXMODE === 'good' ? fixGood : fixBad) : first;
    const txt = JSON.stringify(ans); for (let i = 0; i < 3; i++) { await new Promise(r => setTimeout(r, 150)); opts.onText && opts.onText({ text: txt.slice(0, (i+1) * txt.length / 3), delta: '' }); }
    return JSON.parse(txt);
  };
  sample.limits = async () => ({ maxPromptBytes: 262144, images: { maxCount: 20, maxInputBytes: 20e6, mediaTypes: ['image/jpeg','image/png'] } });
  window.claude = { use: async n => n === 'sample' ? sample : null };
})();
""".replace('FIXMODE', json.dumps(FIXGOOD))
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={'width':390,'height':844}); await ctx.add_init_script(MOCK); pg=await ctx.new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        await pg.goto('file:///home/claude/notes-app/dist/test.html'); await pg.wait_for_timeout(1000)
        await pg.evaluate("window.__q = s => document.querySelector(s) || ((document.querySelector('[data-act=pa-sheet]') || {click(){}}).click(), document.querySelector(s));")
        ev=lambda js: pg.evaluate(js)
        async def click(sel, wait=400):
            await ev(f"document.querySelector({json.dumps(sel)}).click()"); await pg.wait_for_timeout(wait)
        await click('[data-act=pick-level][data-level=beginner]'); await click('[data-act=tab][data-tab=pieces]')
        await pg.set_input_files('#scan-pick', ['sys/page.jpg']); await pg.wait_for_timeout(1500)
        await click('[data-act=scan-read]', 300)
        seen = set()
        for i in range(30):
            t = await ev("(document.querySelector('[data-scan-progress]')||{}).textContent||''")
            if t: seen.add(t)
            if await ev("!!document.querySelector('[data-scan-score]')"): break
            await pg.wait_for_timeout(150)
        await pg.wait_for_timeout(500)
        print('progress shown:', sorted(seen))
        print('calls:', json.dumps(await ev('window.__calls')))
        print('warnings:', await ev("Array.from(document.querySelectorAll('.scan-warn li')).map(l=>l.textContent)"))
        await pg.screenshot(path='read2-review.png', full_page=True)
        await click('[data-act=scan-save]', 800)
        songs = json.loads(await ev("JSON.stringify(Object.values(window.ReadMusic.Store.state.songs))"))
        s = songs[-1]; print('key', s['key'], 'time', s['time']); print('RH', s['rh']); print('LH', s['lh'])
        # same page again: no new calls
        n = len(await ev('window.__calls'))
        await click('[data-act=tab][data-tab=pieces]'); await pg.set_input_files('#scan-pick', ['sys/page.jpg']); await pg.wait_for_timeout(1500)
        await click('[data-act=scan-read]', 2000)
        print('repeat read new calls:', len(await ev('window.__calls')) - n, '| note:', await ev("(document.querySelector('.scan-main').textContent.match(/read before[^.]*/)||[''])[0]"))
        print('left after 2 reads:', await ev("JSON.parse(localStorage.getItem('rmp-pages:v1')).used"))
        await click('[data-act=scan-again]', 3000)
        print('read-again calls:', json.dumps((await ev('window.__calls'))[n:]))
        print('review note:', await ev("Array.from(document.querySelectorAll('.scan-main p.muted')).map(p=>p.textContent).join(' / ')"))
        await ev("localStorage.setItem('rmp-pages:v1', JSON.stringify({month: JSON.parse(localStorage.getItem('rmp-pages:v1')).month, used: 20}))")
        await click('[data-act=tab][data-tab=pieces]'); await pg.set_input_files('#scan-pick', ['sys/photo.jpg']); await pg.wait_for_timeout(2500)
        print('ready screen:', await ev("Array.from(document.querySelectorAll('.scan-main .tip:not([hidden]), .scan-main p.muted')).map(p=>p.textContent).join(' / ')"), '| read disabled:', await ev("document.querySelector('[data-act=scan-read]').disabled"))
        await pg.screenshot(path='limit.png', full_page=True)
        print('errors', errs); await b.close()
asyncio.run(main())
