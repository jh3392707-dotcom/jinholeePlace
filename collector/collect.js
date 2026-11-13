// 사용: node collect.js [회차번호=260135]   (한국 IP의 본인 PC에서 실행)
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const {parse}=require('./parse');
const gmTs=process.argv[2]||'260135';
const url=`https://www.betman.co.kr/main/mainPage/gamebuy/gameSlip.do?gmId=G101&gmTs=${gmTs}`;
(async()=>{
  const rawDir=path.join(__dirname,'raw');fs.mkdirSync(rawDir,{recursive:true});
  const b=await chromium.launch({headless:false});
  const p=await (await b.newContext({locale:'ko-KR'})).newPage();
  const bag=[];let n=0;
  p.on('response',async r=>{
    try{
      if(!/json/i.test(r.headers()['content-type']||''))return;
      const j=await r.json();const f=path.join(rawDir,`resp${++n}.json`);
      fs.writeFileSync(f,JSON.stringify({url:r.url(),json:j},null,1));bag.push(j);
    }catch(e){}
  });
  console.log('접속:',url);
  await p.goto(url,{waitUntil:'networkidle',timeout:90000}).catch(e=>console.log('goto',e.message));
  await p.waitForTimeout(6000);
  await b.close();
  const matches=bag.flatMap(j=>parse(j));
  const uniq=Object.values(Object.fromEntries(matches.map(m=>[m.id,m])));
  fs.writeFileSync(path.join(__dirname,'..','data.json'),JSON.stringify({collectedAt:new Date().toISOString(),matches:uniq},null,1));
  console.log(`응답 ${n}개 저장(raw/), 경기 ${uniq.length}건 → ../data.json`);
  if(!uniq.length)console.log('⚠ 경기를 못 찾았습니다. collector/raw 폴더의 파일을 Claude에게 보내주세요. 파서를 맞춰드립니다.');
})();
