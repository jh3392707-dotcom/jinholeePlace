// 베트맨 gameInfoInq.do 응답(json.compSchedules.keys/datas 테이블) → 앱 형식 matches 로 변환
const sportOf=c=>({SC:'축구',BK:'농구',BS:'야구',VL:'배구'}[c]||c||'기타');
function toISO(ms){ // 베트맨 타임스탬프는 KST 기준이므로 UTC+9로 고정 변환
  const d=new Date(ms+9*3600*1000),p=n=>String(n).padStart(2,'0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}
function parse(json){
  const cs=json&&json.compSchedules;
  if(!cs||!Array.isArray(cs.keys)||!Array.isArray(cs.datas))return [];
  const keys=cs.keys,idx=k=>keys.indexOf(k);
  const need=['itemCode','leagueName','homeName','awayName','gameDate','betTypNm','winTxt','winAllot','drawTxt','drawAllot','loseTxt','loseAllot','winHandi','loseHandi'];
  if(need.some(k=>idx(k)<0))return [];
  const groups={};
  for(const r of cs.datas){
    const home=r[idx('homeName')],away=r[idx('awayName')],gameDate=r[idx('gameDate')];
    if(!home||!away||!gameDate)continue;
    const key=`${home}|${away}|${gameDate}`;
    const g=groups[key]=groups[key]||{id:'b'+Buffer.from(key).toString('hex').slice(0,16),
      time:toISO(gameDate),sport:sportOf(r[idx('itemCode')]),league:r[idx('leagueName')]||'',
      home:String(home),away:String(away),line:'',hcap:'',odds:{}};
    const bt=String(r[idx('betTypNm')]||''),win=+r[idx('winAllot')]||0,draw=+r[idx('drawAllot')]||0,lose=+r[idx('loseAllot')]||0;
    const hasDraw=r[idx('drawTxt')]&&r[idx('drawTxt')]!=='-';
    if(/핸디캡/.test(bt)){
      g.hcap=String(r[idx('winHandi')]??g.hcap);
      g.odds.HH=win;if(hasDraw)g.odds.HD=draw;g.odds.HA=lose;
    }else if(/언더오버/.test(bt)){
      g.line=String(r[idx('winHandi')]??r[idx('loseHandi')]??g.line);
      g.odds.U=win;g.odds.O=lose;
    }else if(/승무패|승패|승N패|승5패/.test(bt)){
      g.odds.H=win;if(hasDraw)g.odds.D=draw;g.odds.A=lose;
    }
  }
  return Object.values(groups).filter(g=>g.odds.H||g.odds.HH||g.odds.O);
}
module.exports={parse};
