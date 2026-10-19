import asyncio, json
from playwright.async_api import async_playwright
H=open('/tmp/claude-0/-home-claude/6689039a-4e32-5de0-9980-f7b8f9867b03/scratchpad/mic/harness.js').read()
def notes(names_times):
    return names_times
TESTS = {
 'repeat C4 over held C3': ([{'t':0.3,'midis':[48],'dur':2.8},{'t':0.3,'midis':[60],'dur':0.71},{'t':1.05,'midis':[60],'dur':0.71},{'t':1.8,'midis':[62],'dur':0.7},{'t':2.55,'midis':[64],'dur':0.7}], {'expectSeq':[{'midis':[48,60]},{'midis':[60]},{'midis':[62]},{'midis':[64]}]}),
 'repeat E4 over held E3': ([{'t':0.3,'midis':[52],'dur':2.8},{'t':0.3,'midis':[64],'dur':0.71},{'t':1.05,'midis':[64],'dur':0.71},{'t':1.8,'midis':[64],'dur':0.7}], {'expectSeq':[{'midis':[52,64]},{'midis':[64]},{'midis':[64]}]}),
 'repeat G4 over held C3': ([{'t':0.3,'midis':[48],'dur':2.8},{'t':0.3,'midis':[67],'dur':0.71},{'t':1.05,'midis':[67],'dur':0.71},{'t':1.8,'midis':[67],'dur':0.7}], {'expectSeq':[{'midis':[48,67]},{'midis':[67]},{'midis':[67]}]}),
 'melody legato C4-G4': ([{'t':0.3+i*0.45,'midis':[m],'dur':0.6} for i,m in enumerate([60,62,64,65,67,65,64,62,60])], {}),
 'repeated E4 x4': ([{'t':0.3+i*0.4,'midis':[64],'dur':0.35} for i in range(4)], {}),
 'bass C2..C3': ([{'t':0.3+i*0.5,'midis':[m],'dur':0.45} for i,m in enumerate([36,38,40,41,43,45,47,48])], {}),
 'high C5..C7': ([{'t':0.3+i*0.4,'midis':[m],'dur':0.35} for i,m in enumerate([72,76,79,84,88,91,96])], {}),
 'LH chords C F G7 C': ([{'t':0.3+i*0.8,'midis':ms,'dur':0.75} for i,ms in enumerate([[48,52,55],[48,53,57],[47,53,55],[48,52,55]])], {}),
 'hands together': ([{'t':0.3+i*0.5,'midis':ms,'dur':0.5} for i,ms in enumerate([[48,64],[43,62],[48,60],[41,65],[43,67],[36,60]])], {}),
 'soft + noise + phone mic': ([{'t':0.3+i*0.45,'midis':[m],'dur':0.5,'vel':0.25} for i,m in enumerate([60,64,67,72,67,64,60])], {'noise':0.004,'highpass':180}),
 'wrong note: expect C4 play D4': ([{'t':0.3,'midis':[62],'dur':0.5}], {'expectSeq':[{'midis':[60]}]}),
 'wrong note: expect C3 play E3': ([{'t':0.3,'midis':[52],'dur':0.5}], {'expectSeq':[{'midis':[48]}]}),
 'semitone trap: expect E4 play F4': ([{'t':0.3,'midis':[65],'dur':0.5}], {'expectSeq':[{'midis':[64]}]}),
 'octave trap: expect C4 play C5': ([{'t':0.3,'midis':[72],'dur':0.5}], {'expectSeq':[{'midis':[60]}]}),
 'octave trap: expect C5 play C4': ([{'t':0.3,'midis':[60],'dur':0.5}], {'expectSeq':[{'midis':[72]}]}),
 'twelfth trap: expect G5 play C4': ([{'t':0.3,'midis':[60],'dur':0.5}], {'expectSeq':[{'midis':[79]}]}),
 'chord with octave doubling C3+C4': ([{'t':0.3,'midis':[48,60],'dur':0.5}], {}),
 'chord C-E-G, plays C-E-A': ([{'t':0.3,'midis':[48,52,57],'dur':0.5}], {'expectSeq':[{'midis':[48,52,55]}]}),
 'pedal: held chord + melody': ([{'t':0.3,'midis':[48,52,55],'dur':2.2}] + [{'t':0.8+i*0.4,'midis':[m],'dur':0.4} for i,m in enumerate([67,72,76,72])], {'expectSeq':[{'midis':[48,52,55]}]+[{'midis':[m]} for m in [67,72,76,72]]}),
 'fast 8ths at 120bpm': ([{'t':0.3+i*0.25,'midis':[m],'dur':0.25} for i,m in enumerate([60,62,64,65,67,69,71,72,71,69,67,65,64,62,60])], {}),
}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await (await b.new_context()).new_page()
        await pg.goto('file:///home/claude/notes-app/dist/test.html'); await pg.wait_for_timeout(800)
        await pg.add_script_tag(content=H)
        for name,(seq,o) in TESTS.items():
            r = await pg.evaluate(f"micTest({json.dumps(seq)}, {json.dumps(o)})")
            print(f"{name:34s} completed {r['completed']}/{r['total']}  timing ms (min/mean/max) {r['timing']}  log {r['log'][:6]}")
        await b.close()
asyncio.run(main())
