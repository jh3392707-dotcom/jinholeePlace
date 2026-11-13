// 자막 텍스트 → 경기별 픽 추출. 기본은 규칙 기반, ANTHROPIC_API_KEY가 있으면 Claude로 더 정확하게.
const CH_SEL=['H','D','A','HH','HD','HA','O','U'];
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s*');
const AFTER='.{0,6}(승|픽|추천|우세|간다|가자|이긴|이길|유리)';
function ruleExtract(text,matches){
  const segs=text.split(/[\n.!?。]+/),out={};
  matches.forEach(m=>{
    const votes={},quotes={};
    segs.forEach(sg=>{
      const hh=sg.includes(m.home),aa=sg.includes(m.away);if(!hh&&!aa)return;
      let k=null;
      if(/오버/.test(sg)&&m.odds.O)k='O';else if(/언더/.test(sg)&&m.odds.U)k='U';
      else if(/무승부|무\s*(픽|추천)/.test(sg)&&m.odds.D)k='D';
      else{const hp=hh&&new RegExp(esc(m.home)+AFTER).test(sg),ap=aa&&new RegExp(esc(m.away)+AFTER).test(sg);
        if(hp&&!ap)k='H';else if(ap&&!hp)k='A';else if(hh&&!aa&&/(승|픽|추천)/.test(sg))k='H';else if(aa&&!hh&&/(승|픽|추천)/.test(sg))k='A'}
      if(k){votes[k]=(votes[k]||0)+1;(quotes[k]=quotes[k]||[]).push(sg.trim().replace(/\s+/g,' ').slice(0,160))}
    });
    const best=Object.entries(votes).sort((a,b)=>b[1]-a[1])[0];if(best)out[m.id]={k:best[0],quote:quotes[best[0]][0]};
  });
  return out;
}
async function llmExtract(text,matches,channel){
  const key=process.env.ANTHROPIC_API_KEY;if(!key)return null;
  const list=matches.map(m=>`${m.id} | ${m.home} vs ${m.away} | 선택지: ${Object.keys(m.odds).filter(k=>m.odds[k]>1).join(',')} (H=홈승,D=무,A=원정승,HH/HD/HA=핸디캡 홈승/무/원정승,O=오버,U=언더)`).join('\n');
  const body={model:process.env.CLAUDE_MODEL||'claude-sonnet-5-5',max_tokens:3000,messages:[{role:'user',content:
`다음은 스포츠 분석 유튜브 채널 "${channel}" 영상의 자막입니다. 아래 경기 목록 중 이 영상이 명확히 추천(픽)한 경기만 골라, 경기당 가장 강하게 추천한 선택지 하나를 JSON으로만 답하세요. 언급 없거나 불확실하면 제외. 형식: {"<경기id>":{"pick":"<선택지>","quote":"그렇게 판단한 근거가 되는 자막 원문 한두 문장(그대로 인용)"}}\n\n[경기]\n${list}\n\n[자막]\n${text.slice(0,60000)}`}]};
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':key,'anthropic-version':'2023-06-01','content-type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok)throw new Error('LLM '+r.status);
  const t=(await r.json()).content?.[0]?.text||'';const j=JSON.parse((t.match(/\{[\s\S]*\}/)||['{}'])[0]);
  const ids=new Set(matches.map(m=>m.id)),out={};
  for(const[id,v]of Object.entries(j)){const k=typeof v==='string'?v:v&&v.pick;if(ids.has(id)&&CH_SEL.includes(k))out[id]={k,quote:String((v&&v.quote)||'').slice(0,200)}}return out;
}
async function extract(text,matches,channel){
  try{const l=await llmExtract(text,matches,channel);if(l)return{picks:l,via:'claude'}}catch(e){console.log('  LLM 실패, 규칙 기반으로 대체:',e.message)}
  return{picks:ruleExtract(text,matches),via:'rule'};
}
module.exports={extract,ruleExtract};
