// 사용: node yt.js   (data.json이 먼저 있어야 함. yt-dlp 필요: pip install yt-dlp 또는 https://github.com/yt-dlp/yt-dlp)
// channels.json에 채널 URL(예: https://www.youtube.com/@xxxx)을 넣으면 정확, 비워두면 채널명으로 검색합니다.
const {execFileSync}=require('child_process'),fs=require('fs'),path=require('path');
const {extract}=require('./picks');
const dataPath=path.join(__dirname,'..','data.json'),tdir=path.join(__dirname,'transcripts');
fs.mkdirSync(tdir,{recursive:true});
const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
const chans=JSON.parse(fs.readFileSync(path.join(__dirname,'channels.json'),'utf8'));
const ytdlp=(args)=>execFileSync('yt-dlp',args,{encoding:'utf8',maxBuffer:1<<28,timeout:180000});
const NV=+process.env.YT_VIDEOS||3;
function latestVideos(name,url){
  if(url){const j=JSON.parse(ytdlp(['--flat-playlist','-J','--playlist-end',String(NV),url.replace(/\/$/,'')+'/videos']));return (j.entries||[]).slice(0,NV).map(e=>({id:e.id,title:e.title}))}
  const core=name.replace(/[:\s]/g,'');
  const out=ytdlp(['--dump-json','--skip-download',`ytsearch15:${name} 프로토 분석`]).trim().split('\n').map(l=>JSON.parse(l));
  return out.filter(v=>(v.channel||v.uploader||'').replace(/[:\s]/g,'').includes(core.slice(0,3))).slice(0,NV).map(v=>({id:v.id,title:v.title}))
}
function transcript(id){
  const base=path.join(tdir,id);
  try{ytdlp(['--skip-download','--write-auto-subs','--write-subs','--sub-langs','ko','--sub-format','json3','-o',base,`https://www.youtube.com/watch?v=${id}`])}catch(e){}
  const f=fs.readdirSync(tdir).find(x=>x.startsWith(id)&&x.endsWith('.json3'));if(!f)return null;
  const j=JSON.parse(fs.readFileSync(path.join(tdir,f),'utf8'));
  const text=(j.events||[]).map(e=>(e.segs||[]).map(s=>s.utf8).join('')).join('\n').replace(/\n+/g,'\n');
  fs.writeFileSync(path.join(tdir,id+'.txt'),text);return text;
}
(async()=>{
  data.picks=data.picks||{};data.evidence=data.evidence||{};
  for(const name of Object.keys(chans)){
    process.stdout.write(`[${name}] `);
    try{
      const vs=latestVideos(name,chans[name]);if(!vs.length){console.log('영상 못 찾음 (channels.json에 URL 권장)');continue}
      const agg={},evd={};let used=0;
      for(const v of vs){
        const text=transcript(v.id);if(!text){console.log(`\n   - 자막 없음: ${v.title}`);continue}
        const {picks,via}=await extract(text,data.matches,name);used++;
        console.log(`\n   - "${v.title}" → ${Object.keys(picks).length}경기 (${via})`);
        // 최신 영상 우선: 이미 정해진 경기는 덮어쓰지 않음. 근거(원문 문장·영상 링크)를 함께 저장
        for(const [id,pk] of Object.entries(picks)){
          if(agg[id])continue;
          agg[id]=pk.k;evd[id]={quote:pk.quote||'',url:'https://www.youtube.com/watch?v='+v.id,videoTitle:v.title||'',via};
        }
      }
      for(const[id,k]of Object.entries(agg)){(data.picks[id]=data.picks[id]||{})[name]=k;(data.evidence[id]=data.evidence[id]||{})[name]={k,quote:evd[id].quote,url:evd[id].url||'',videoTitle:evd[id].videoTitle||'',via:evd[id].via}}
      console.log(`   => ${name}: 영상 ${used}/${vs.length}개 분석, ${Object.keys(agg).length}경기 픽`);
    }catch(e){console.log('실패:',e.message.split('\n')[0])}
  }
  fs.writeFileSync(dataPath,JSON.stringify(data,null,1));fs.writeFileSync(path.join(__dirname,'..','data.js'),'window.TOTO_DATA='+fs.readFileSync(path.join(__dirname,'..','data.json'),'utf8')+';');
  console.log('data.json 갱신 완료. 앱에서 불러온 뒤 매트릭스에서 확인하세요.');
})();
