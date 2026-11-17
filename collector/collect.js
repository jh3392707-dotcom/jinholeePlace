// 사용: node collect.js [회차번호]   (한국 IP의 본인 PC에서 실행)
// 회차번호를 안 주면 '현재 발매 중인 회차'를 자동으로 찾는다 (회차 자동 탐지).
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const {parse,PARSER_VERSION}=require('./parse');
const base='https://www.betman.co.kr/main/mainPage/gamebuy/gameSlip.do?gmId=G101';
const dataFile=path.join(__dirname,'..','data.json');
let lastTs=260135;try{const od=JSON.parse(fs.readFileSync(dataFile,'utf8'));if(od.gmTs&&od.gmTs.length)lastTs=Math.max(...od.gmTs.map(Number))}catch(e){}
(async()=>{
  const rawDir=path.join(__dirname,'raw');fs.mkdirSync(rawDir,{recursive:true});
  const b=await chromium.launch({headless:false});
  const p=await (await b.newContext({locale:'ko-KR'})).newPage();
  let bag=[],n=0;
  p.on('response',async r=>{
    try{
      if(!/json/i.test(r.headers()['content-type']||''))return;
      const j=await r.json();const f=path.join(rawDir,`resp${++n}.json`);
      fs.writeFileSync(f,JSON.stringify({url:r.url(),json:j},null,1));bag.push(j);
    }catch(e){}
  });
  async function visit(ts){
    bag=[];const url=base+(ts?`&gmTs=${ts}`:'');console.log('접속:',url);
    await p.goto(url,{waitUntil:'networkidle',timeout:90000}).catch(e=>console.log('goto',e.message));
    await p.waitForTimeout(6000);
    const ms=bag.flatMap(j=>parse(j));
    const found=new Set();for(const j of bag){for(const m of JSON.stringify(j).matchAll(/"gmTs"\s*:\s*"?(\d{6})"?/g))found.add(+m[1])}
    return {ms,found,cur:(p.url().match(/gmTs=(\d+)/)||[])[1]};
  }
  const all=[],used=[];
  const add=(ts,ms)=>{if(ms.length){all.push(...ms);used.push(+ts)}console.log(`  회차 ${ts}: ${ms.length}건`)};
  const arg=process.argv[2];
  if(arg){const r=await visit(arg);add(arg,r.ms)}
  else{
    // 1) 회차 지정 없이 열어 사이트가 고른 최신 회차 + 응답에 보이는 회차들을 모은다
    const r0=await visit(null);add(r0.cur||'auto',r0.ms);
    const cand=new Set([...r0.found].filter(x=>x>=lastTs-2));
    if(r0.cur)cand.add(+r0.cur);
    // 2) 마지막으로 성공한 회차 이후 몇 개 회차도 직접 확인 (새 회차가 안 보일 때 대비)
    for(let t=lastTs;t<=lastTs+8;t++)cand.add(t);
    for(const t of [...cand].sort((a,b)=>a-b)){if(used.includes(t))continue;const r=await visit(t);add(t,r.ms)}
  }
  await b.close();
  const uniq=Object.values(Object.fromEntries(all.map(m=>[m.id,m])));
  if(!uniq.length){console.log('⚠ 경기 0건 — 기존 data.json 유지');process.exit(2)}
  let oldPicks={},oldEv={};try{const od=JSON.parse(fs.readFileSync(dataFile,'utf8'));oldPicks=od.picks||{};oldEv=od.evidence||{}}catch(e){}
  const ids=new Set(uniq.map(m=>m.id)),picks=Object.fromEntries(Object.entries(oldPicks).filter(([id])=>ids.has(id))),evidence=Object.fromEntries(Object.entries(oldEv).filter(([id])=>ids.has(id)));
  fs.writeFileSync(dataFile,JSON.stringify({collectedAt:new Date().toISOString(),parserVersion:PARSER_VERSION,gmTs:[...new Set(used)],matches:uniq,picks,evidence},null,1));
  fs.writeFileSync(path.join(__dirname,'..','data.js'),'window.TOTO_DATA='+fs.readFileSync(dataFile,'utf8')+';');
  const last=uniq.map(m=>m.time).sort().pop();
  console.log(`응답 ${n}개 저장(raw/), 회차 ${used.join(',')}, 경기 ${uniq.length}건(가장 늦은 경기 ${last}) → ../data.json`);
})();
