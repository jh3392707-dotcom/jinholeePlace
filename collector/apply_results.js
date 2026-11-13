// 사용:
//   node apply_results.js --list-pending         → 결과를 찾아야 할 경기 목록(저장된 추천픽 중 경기가 끝났을 시간인데 결과가 없는 것)
//   node apply_results.js results.json            → 최종 점수를 ../records.json 에 반영
// results.json 형식: { "<경기id>": { "home":2, "away":1, "total":null, "source":"출처", "note":"" } }
//   home/away = 정규시간 최종 점수 (축구: 연장·승부차기 제외 90분 / 농구·야구: 연장 포함 최종 / 배구: 세트 스코어)
//   total = 언더오버용 총 득점 합 (배구는 세트 스코어와 다르므로 총 득점 합을 따로 적는다. 나머지는 생략하면 home+away)
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),rp=path.join(root,'records.json');
let R={snapshots:[],results:{}};try{R=JSON.parse(fs.readFileSync(rp,'utf8'))}catch(e){}
R.snapshots=R.snapshots||[];R.results=R.results||{};
const save=()=>{fs.writeFileSync(rp,JSON.stringify(R,null,1));fs.writeFileSync(path.join(root,'records.js'),'window.TOTO_RECORDS='+JSON.stringify(R)+';')};
const arg=process.argv[2];
if(arg==='--list-pending'){
  const dur={축구:135,농구:160,야구:230,배구:160},now=Date.now(),seen={},out=[];
  R.snapshots.forEach(sn=>sn.picks.forEach(p=>{
    if(R.results[p.matchId]||seen[p.matchId])return;
    const start=Date.parse(p.time+':00+09:00');if(now<start+(dur[p.sport]||180)*60000)return;
    seen[p.matchId]=1;const same=R.snapshots.flatMap(s2=>s2.picks).filter(x=>x.matchId===p.matchId);
    out.push({matchId:p.matchId,sport:p.sport,league:p.league,home:p.home,away:p.away,start:p.time,
      필요:{승무패:same.some(x=>['H','D','A'].includes(x.sel)),핸디캡:[...new Set(same.filter(x=>['HH','HD','HA'].includes(x.sel)).map(x=>x.hcap))],언더오버:[...new Set(same.filter(x=>['O','U'].includes(x.sel)).map(x=>x.line))]}});
  }));
  console.log(JSON.stringify(out,null,1));console.log(`\n결과가 필요한 경기 ${out.length}개`);process.exit(0);
}
if(!arg){console.log('사용: node apply_results.js results.json | --list-pending');process.exit(1)}
const input=JSON.parse(fs.readFileSync(arg,'utf8'));let n=0,bad=0;
for(const [id,v] of Object.entries(input)){
  if(v==null||isNaN(+v.home)||isNaN(+v.away)){bad++;continue}
  R.results[id]={home:+v.home,away:+v.away,total:v.total==null?null:+v.total,source:String(v.source||''),note:String(v.note||''),updatedAt:new Date().toISOString()};n++;
}
save();console.log(`결과 ${n}건 반영, 무시 ${bad}건 (누적 결과 ${Object.keys(R.results).length}건)`);
