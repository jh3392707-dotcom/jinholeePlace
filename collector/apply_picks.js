// 사용: node apply_picks.js picks.json [--replace]   (--replace: 기존 유튜버 픽을 모두 지우고 이번 결과로 교체)
// Claude 세션이 자막을 직접 읽고 판단한 결과를 data.json 에 반영한다. (API 키 불필요)
// picks.json 형식: { "<채널명>": { "<경기id>": { "pick":"H|D|A|HH|HD|HA|O|U", "quote":"자막 원문 문장", "url":"영상주소", "videoTitle":"영상제목" } } }
const fs=require('fs'),path=require('path');
const file=process.argv.slice(2).find(a=>!a.startsWith('--'));if(!file){console.log('사용: node apply_picks.js picks.json');process.exit(1)}
const dp=path.join(__dirname,'..','data.json'),data=JSON.parse(fs.readFileSync(dp,'utf8')),input=JSON.parse(fs.readFileSync(file,'utf8'));
const OK=['H','D','A','HH','HD','HA','O','U'],ids=new Set(data.matches.map(m=>m.id));
data.picks=data.picks||{};data.evidence=data.evidence||{};let n=0,bad=0;
if(process.argv.includes('--replace')){data.picks={};data.evidence={}}
for(const [ch,ms] of Object.entries(input))for(const [id,v] of Object.entries(ms)){
  if(!ids.has(id)||!OK.includes(v.pick)){bad++;continue}
  (data.picks[id]=data.picks[id]||{})[ch]=v.pick;
  (data.evidence[id]=data.evidence[id]||{})[ch]={k:v.pick,quote:String(v.quote||'').slice(0,240),url:v.url||'',videoTitle:v.videoTitle||'',via:'claude-session',verified:!!v.verified};n++;
}
fs.writeFileSync(dp,JSON.stringify(data,null,1));
fs.writeFileSync(path.join(__dirname,'..','data.js'),'window.TOTO_DATA='+fs.readFileSync(dp,'utf8')+';');
console.log(`픽 ${n}건 반영, 무시 ${bad}건(없는 경기/잘못된 선택). data.json·data.js 갱신`);
// ---- 자동 점검: 유튜버 다수 의견이 배당 약세/반대 쪽이면 목록으로 알린다 (재확인 대상)
{
  const GR=[['H','D','A'],['HH','HD','HA'],['O','U']],M=Object.fromEntries(data.matches.map(m=>[m.id,m])),alerts=[];
  for(const [id,pk] of Object.entries(data.picks)){const m=M[id];if(!m)continue;
    GR.forEach((g,gi)=>{const ks=g.filter(k=>m.odds[k]>1);if(ks.length<2)return;
      const inv=ks.reduce((a,k)=>a+1/m.odds[k],0),pr=Object.fromEntries(ks.map(k=>[k,(1/m.odds[k])/inv]));
      const fav=ks.reduce((a,b)=>pr[a]>=pr[b]?a:b),voters=Object.entries(pk).filter(([c,k])=>ks.includes(k)),n=voters.length;
      ks.forEach(k=>{const v=voters.filter(([c,x])=>x===k).length;
        const oppose=gi===0&&k!==fav&&v>=2&&v/n>=0.5, strong=v>=3&&v/n>=0.6&&pr[k]<0.35;
        if(oppose||strong)alerts.push(`${m.home} vs ${m.away} [${k}] 유튜버 ${v}/${n}명 · 확률 ${(pr[k]*100).toFixed(0)}%${strong?' (정반대 다수)':' (역배)'}`)})})}
  console.log(alerts.length?`⚠ 재확인 대상 ${alerts.length}건 (근거 문장·경기 일치 여부를 다시 확인하세요):\n - `+alerts.join('\n - '):'재확인 대상 없음 (배당과 반대인 다수 의견 0건)');
}
