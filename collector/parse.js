// 베트맨 gameInfoInq.do 응답(json.compSchedules.keys/datas 테이블) → 앱 형식 matches 로 변환
// 한 경기에 전반 승무패·전반 핸디캡·전반 언더오버·SUM(홀짝)·여러 핸디캡/언더오버 줄이 함께 내려오므로
// betNm 으로 "경기 전체 승무패/핸디캡/언더오버"만 고르고, 줄이 여러 개면 가장 균형 잡힌(주력) 줄을 선택한다.
const PARSER_VERSION=2;
const sportOf=c=>({SC:'축구',BK:'농구',BS:'야구',VL:'배구'}[c]||c||'기타');
function toISO(ms){ // 베트맨 타임스탬프는 KST 기준이므로 UTC+9로 고정 변환
  const d=new Date(ms+9*3600*1000),p=n=>String(n).padStart(2,'0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}
const kindOf=nm=>{ // 종목 접두어 + (승무패|승패|핸디캡|언더오버) 만 허용. 전반/후반/쿼터/이닝/세트/SUM/홀짝 등은 제외
  const n=String(nm||'').trim();
  if(/전반|후반|쿼터|이닝|세트|SUM|홀짝|득점|코너/.test(n))return null;
  const m=n.match(/^(?:축구|농구|야구|배구|[가-힣]{1,4})\s*(승무패|승패|핸디캡|언더오버)$/);
  return m?(m[1]==='핸디캡'?'HC':m[1]==='언더오버'?'OU':'WDL'):null;
};
function parse(json){
  const cs=json&&json.compSchedules;
  if(!cs||!Array.isArray(cs.keys)||!Array.isArray(cs.datas))return [];
  const keys=cs.keys,idx=k=>keys.indexOf(k);
  if(['itemCode','leagueName','homeName','awayName','gameDate','betNm','winAllot','loseAllot'].some(k=>idx(k)<0))return [];
  const val=(r,k)=>idx(k)<0?null:r[idx(k)];
  const groups={};
  for(const r of cs.datas){
    const home=val(r,'homeName'),away=val(r,'awayName'),gameDate=val(r,'gameDate');
    if(!home||!away||!gameDate||/미정/.test(home+away))continue;
    const kind=kindOf(val(r,'betNm'));if(!kind)continue;
    const key=`${home}|${away}|${gameDate}`;
    const g=groups[key]=groups[key]||{key,time:toISO(gameDate),sport:sportOf(val(r,'itemCode')),league:val(r,'leagueName')||'',home:String(home),away:String(away),WDL:[],HC:[],OU:[],endMs:null};
    const ed=+val(r,'endDate');if(ed>0&&(g.endMs==null||ed<g.endMs))g.endMs=ed;
    g[kind].push({win:+val(r,'winAllot')||0,draw:+val(r,'drawAllot')||0,lose:+val(r,'loseAllot')||0,
      hasDraw:!!val(r,'drawTxt')&&val(r,'drawTxt')!=='-',winTxt:val(r,'winTxt'),winHandi:val(r,'winHandi'),loseHandi:val(r,'loseHandi')});
  }
  const balanced=rows=>rows.slice().sort((a,b)=>Math.abs(a.win-a.lose)-Math.abs(b.win-b.lose))[0];
  const out=[];
  for(const g of Object.values(groups)){
    const odds={};let line='',hcap='';
    const w=balanced(g.WDL);if(w){odds.H=w.win;if(w.hasDraw)odds.D=w.draw;odds.A=w.lose}
    const h=balanced(g.HC);if(h){odds.HH=h.win;if(h.hasDraw)odds.HD=h.draw;odds.HA=h.lose;const v=+h.winHandi;hcap=isFinite(v)?(v>0?'+'+v:String(v)):''}
    const u=balanced(g.OU);if(u){const under=/언더/.test(u.winTxt||'언더');odds.U=under?u.win:u.lose;odds.O=under?u.lose:u.win;line=String(u.winHandi??u.loseHandi??'')}
    if(!(odds.H||odds.HH||odds.O))continue;
    out.push({id:'b'+Buffer.from(g.key).toString('hex').slice(0,16),time:g.time,deadline:g.endMs?toISO(g.endMs):'',sport:g.sport,league:g.league,home:g.home,away:g.away,line,hcap,odds});
  }
  return out;
}
module.exports={parse,PARSER_VERSION};
