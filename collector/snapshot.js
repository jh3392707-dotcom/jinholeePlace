// 사용: node snapshot.js   — 지금 앱이 보여주는 추천픽(네 구역 + 조합)을 ../records.json 에 스냅샷으로 저장한다.
// 앱(index.html)의 계산 로직을 그대로 쓰기 위해 헤드리스 브라우저로 앱을 열어 window.__snap() 결과를 받는다.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{
  const root=path.join(__dirname,'..'),rp=path.join(root,'records.json');
  const b=await chromium.launch(),pg=await (await b.newContext({timezoneId:'Asia/Seoul'})).newPage();
  await pg.goto(pathToFileURL(path.join(root,'index.html')).href);
  await pg.waitForFunction(()=>typeof window.__snap==='function'&&window.TOTO_DATA,{timeout:30000});
  await pg.waitForTimeout(500);
  const snap=await pg.evaluate(()=>window.__snap());
  await b.close();
  let R={snapshots:[],results:{}};try{R=JSON.parse(fs.readFileSync(rp,'utf8'))}catch(e){}
  R.snapshots=R.snapshots||[];R.results=R.results||{};
  const last=R.snapshots[R.snapshots.length-1];
  if(last&&last.collectedAt&&last.collectedAt===snap.collectedAt)R.snapshots[R.snapshots.length-1]=snap;   // 같은 수집분이면 교체
  else R.snapshots.push(snap);
  fs.writeFileSync(rp,JSON.stringify(R,null,1));
  fs.writeFileSync(path.join(root,'records.js'),'window.TOTO_RECORDS='+JSON.stringify(R)+';');
  console.log(`스냅샷 저장: 추천픽 ${snap.picks.length}개, 조합 ${snap.tickets.length}장 (누적 ${R.snapshots.length}회)`);
})();
