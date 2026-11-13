// 사용: node yt.js   (data.json이 먼저 있어야 함. yt-dlp 필요: pip install yt-dlp 또는 https://github.com/yt-dlp/yt-dlp)
// channels.json에 채널 URL(예: https://www.youtube.com/@xxxx)을 넣으면 정확, 비워두면 채널명으로 검색합니다.
const {execFileSync}=require('child_process'),fs=require('fs'),path=require('path');
const {extract}=require('./picks');
const dataPath=path.join(__dirname,'..','data.json'),tdir=path.join(__dirname,'transcripts');
fs.mkdirSync(tdir,{recursive:true});
const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
const chans=JSON.parse(fs.readFileSync(path.join(__dirname,'channels.json'),'utf8'));
const ytdlp=(args)=>execFileSync('yt-dlp',args,{encoding:'utf8',maxBuffer:1<<28,timeout:180000});
function latestVideo(name,url){
  if(url){const j=JSON.parse(ytdlp(['--flat-playlist','-J','--playlist-end','3',url.replace(/\/$/,'')+'/videos']));const e=(j.entries||[])[0];return e&&{id:e.id,title:e.title}}
  const core=name.replace(/[:\s]/g,'');
  const out=ytdlp(['--dump-json','--skip-download',`ytsearchdate8:${name} 프로토 분석`]).trim().split('\n').map(l=>JSON.parse(l));
  const hit=out.find(v=>(v.channel||v.uploader||'').replace(/[:\s]/g,'').includes(core.slice(0,3)));return hit&&{id:hit.id,title:hit.title}
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
  data.picks=data.picks||{};
  for(const name of Object.keys(chans)){
    process.stdout.write(`[${name}] `);
    try{
      const v=latestVideo(name,chans[name]);if(!v){console.log('영상 못 찾음 (channels.json에 URL 입력 권장)');continue}
      const text=transcript(v.id);if(!text){console.log(`자막 없음: ${v.title}`);continue}
      const {picks,via}=await extract(text,data.matches,name);
      for(const[id,k]of Object.entries(picks)){(data.picks[id]=data.picks[id]||{})[name]=k}
      console.log(`"${v.title}" → ${Object.keys(picks).length}경기 픽 (${via})`);
    }catch(e){console.log('실패:',e.message.split('\n')[0])}
  }
  fs.writeFileSync(dataPath,JSON.stringify(data,null,1));console.log('data.json 갱신 완료. 앱에서 불러온 뒤 매트릭스에서 확인하세요.');
})();
