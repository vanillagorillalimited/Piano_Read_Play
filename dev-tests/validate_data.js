const fs=require('fs');
const src=['notation','data-library','data-course','data-playing'].map(f=>fs.readFileSync('/home/claude/notes-app/src/'+f+'.js','utf8')).join('\n');
eval(src+`
const errs=[]; const lv={};
PIECES.forEach(p=>{
  lv[p.level]=(lv[p.level]||0)+1;
  if(!PIECE_LEVELS.find(l=>l.n===p.level)) errs.push('level '+p.id);
  const tb=timeBeats(p.time);
  const parts=p.music?{m:p.music}:{rh:p.rh,lh:p.lh};
  const bars={};
  for(const [h,txt] of Object.entries(parts)){ try{ bars[h]=parseMusic(txt).map(b=>b.beats);}catch(e){errs.push(p.id+' '+h+' '+e.message);continue;}
    bars[h].forEach((b,i)=>{ if(Math.abs(b-tb)>0.001 && !(i===0||i===bars[h].length-1)) errs.push(p.id+' '+h+' bar '+(i+1)+' = '+b); });
  }
  if(bars.rh&&bars.lh){ if(bars.rh.length!==bars.lh.length) errs.push(p.id+' bar count '+bars.rh.length+'/'+bars.lh.length);
    bars.rh.forEach((b,i)=>{ if(Math.abs(b-bars.lh[i])>0.001) errs.push(p.id+' bar '+(i+1)+' rh '+b+' lh '+bars.lh[i]); }); }
});
const ids=new Set(PIECES.map(p=>p.id)); if(ids.size!==PIECES.length) errs.push('dup piece id');
ALL_LESSONS.forEach(l=>l.blocks.forEach(b=>{ if(b.t==='piece'&&!ids.has(b.id)) errs.push('lesson '+l.id+' -> '+b.id); }));
ALL_LESSONS.forEach(l=>l.blocks.forEach(b=>{ if(b.t!=='score'&&b.t!=='play') return; const sp=b.spec; const tb=timeBeats(sp.time||'4/4'); const parts=sp.music?{m:sp.music}:{rh:sp.rh,lh:sp.lh}; const bars={}; for(const [h,txt] of Object.entries(parts)){ try{bars[h]=parseMusic(txt).map(x=>x.beats);}catch(e){errs.push(l.id+' '+h+' '+e.message);continue;} if(!sp.noTime) bars[h].forEach((x,i)=>{ if(Math.abs(x-tb)>.001 && !(i===0||i===bars[h].length-1)) errs.push(l.id+' '+(b.title||'')+' '+h+' bar '+(i+1)+' = '+x); }); } if(bars.rh&&bars.lh){ if(bars.rh.length!==bars.lh.length) errs.push(l.id+' '+b.title+' bar count'); bars.rh.forEach((x,i)=>{ if(Math.abs(x-bars.lh[i])>.001) errs.push(l.id+' '+b.title+' bar '+(i+1)+' rh '+x+' lh '+bars.lh[i]); }); } }));
  ALL_LESSONS.forEach(l=>l.blocks.forEach(b=>{ if(b.t==='keys'&&b.fingers) Object.keys(b.fingers).forEach(p=>{ const m=parsePitch(p).midi; if(m<b.from||m>b.to) errs.push(l.id+' finger key out of range '+p); }); }));
  const lids=new Set(); ALL_LESSONS.forEach(l=>{ if(lids.has(l.id)) errs.push('dup lesson '+l.id); lids.add(l.id); });
  console.log('lessons',ALL_LESSONS.length,'playing',ALL_LESSONS.filter(l=>l.track==='play').length);
  console.log('pieces',PIECES.length, JSON.stringify(lv));
console.log(errs.length?errs.join('\\n'):'no data errors');
`);
