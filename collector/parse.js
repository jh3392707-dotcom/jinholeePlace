// 베트맨 응답 JSON → 앱 형식 matches 로 변환 (필드명 추정 기반, 실제 응답과 다르면 raw 파일로 보정 필요)
const pick=(o,res)=>{for(const re of res){for(const k of Object.keys(o)){if(re.test(k)&&o[k]!=null&&o[k]!=='')return o[k]}}return null};
const num=v=>{const n=parseFloat(String(v).replace(/[^\d.\-]/g,''));return isFinite(n)?n:0};
function findRows(node,out=[]){
  if(Array.isArray(node)){
    if(node.length&&typeof node[0]==='object'&&node[0]){
      const ks=Object.keys(node[0]).join(' ');
      if(/home/i.test(ks)&&/away/i.test(ks))out.push(node);
    }
    node.forEach(n=>findRows(n,out));
  }else if(node&&typeof node==='object')Object.values(node).forEach(n=>findRows(n,out));
  return out;
}
function normTime(v){
  if(v==null)return '';const s=String(v);
  let m=s.match(/(\d{4})[-.\/]?(\d{2})[-.\/]?(\d{2})[ T]?(\d{2}):?(\d{2})/);
  if(m)return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`;
  if(/^\d{13}$/.test(s)){const d=new Date(+s),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
  return '';
}
const sportOf=s=>/SC|축구|soccer/i.test(s)?'축구':/BS|야구|base/i.test(s)?'야구':/BK|농구|basket/i.test(s)?'농구':/VL|배구|volley/i.test(s)?'배구':'기타';
function parse(json){
  const groups={};
  for(const rows of findRows(json))for(const o of rows){
    const home=pick(o,[/^home(team)?(name|nm)?$/i,/home.*(name|nm)/i,/^home/i]),away=pick(o,[/^away(team)?(name|nm)?$/i,/away.*(name|nm)/i,/^away/i]);
    if(!home||!away)continue;
    const time=normTime(pick(o,[/gameDate|startDate|matchDate|gameTime|dateTime|^date/i]));
    const id=`${home}|${away}|${time}`;
    const g=groups[id]=groups[id]||{id,time,home:String(home),away:String(away),sport:'기타',league:'',line:'',hcap:'',odds:{}};
    g.league=pick(o,[/league.*(name|nm)/i,/lg.*nm/i])||g.league;
    g.sport=sportOf(String(pick(o,[/item(code|nm|name)?$/i,/sport/i])||''))||g.sport;
    const type=String(pick(o,[/(game|gm|win)?type(nm|name|cd)?$/i,/kind/i])||'')+' '+String(pick(o,[/mark|gameName|gmNm/i])||'');
    const win=num(pick(o,[/win.*(allot|odds|rate)/i,/^(h|home)(allot|odds)$/i])),draw=num(pick(o,[/draw.*(allot|odds|rate)/i])),lose=num(pick(o,[/lose.*(allot|odds|rate)/i,/^(a|away)(allot|odds)$/i]));
    const handi=pick(o,[/handi/i,/hdcp/i,/baseP|standard/i]);
    if(/핸디|handi|H\b/i.test(type)&&!/언|오버/.test(type)){g.hcap=String(handi??g.hcap);Object.assign(g.odds,{HH:win,HD:draw,HA:lose})}
    else if(/언더|오버|U\/O|언오버|under|over/i.test(type)){g.line=String(handi??g.line);Object.assign(g.odds,{O:lose&&!win?lose:win,U:draw&&!lose?draw:lose})}
    else Object.assign(g.odds,{H:win,D:draw,A:lose});
  }
  return Object.values(groups).filter(g=>g.odds.H||g.odds.HH||g.odds.O).map(g=>({...g,id:'b'+Buffer.from(g.id).toString('hex').slice(0,16)}));
}
module.exports={parse};
