// 사용: node apply_picks.js picks.json
// Claude 세션이 자막을 직접 읽고 판단한 결과를 data.json 에 반영한다. (API 키 불필요)
// picks.json 형식: { "<채널명>": { "<경기id>": { "pick":"H|D|A|HH|HD|HA|O|U", "quote":"자막 원문 문장", "url":"영상주소", "videoTitle":"영상제목" } } }
const fs=require('fs'),path=require('path');
const file=process.argv[2];if(!file){console.log('사용: node apply_picks.js picks.json');process.exit(1)}
const dp=path.join(__dirname,'..','data.json'),data=JSON.parse(fs.readFileSync(dp,'utf8')),input=JSON.parse(fs.readFileSync(file,'utf8'));
const OK=['H','D','A','HH','HD','HA','O','U'],ids=new Set(data.matches.map(m=>m.id));
data.picks=data.picks||{};data.evidence=data.evidence||{};let n=0,bad=0;
for(const [ch,ms] of Object.entries(input))for(const [id,v] of Object.entries(ms)){
  if(!ids.has(id)||!OK.includes(v.pick)){bad++;continue}
  (data.picks[id]=data.picks[id]||{})[ch]=v.pick;
  (data.evidence[id]=data.evidence[id]||{})[ch]={k:v.pick,quote:String(v.quote||'').slice(0,240),url:v.url||'',videoTitle:v.videoTitle||'',via:'claude-session'};n++;
}
fs.writeFileSync(dp,JSON.stringify(data,null,1));
fs.writeFileSync(path.join(__dirname,'..','data.js'),'window.TOTO_DATA='+fs.readFileSync(dp,'utf8')+';');
console.log(`픽 ${n}건 반영, 무시 ${bad}건(없는 경기/잘못된 선택). data.json·data.js 갱신`);
