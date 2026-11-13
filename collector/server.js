// 로컬 서버: 앱을 http://localhost:8787 로 열고, [분석 최신화] 버튼이 아래 순서를 실행한다. (노트북에서 실행)
//  1) 베트맨 배당 수집(collect.js)  2) 유튜버 자막 받기(yt.js)  3) 유튜버 픽 판단(Claude 헤드리스, 실패 시 키워드 방식)
const http=require('http'),fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const root=path.join(__dirname,'..'),PORT=8787;
const mime={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.json':'application/json;charset=utf-8'};
let job=null;
const PROMPT=`collector/transcripts/manifest.json 에 적힌 각 영상 자막(collector/transcripts/<영상id>.txt)과 data.json 의 matches 를 읽어라. 채널별로, 아직 시작 전인 경기마다 항목별(승무패 H/D/A, 핸디캡 HH/HD/HA, 언더오버 O/U) 픽을 판단한다. 자막에 그 경기 언급이 없거나 불확실하거나 부정("~는 어렵다")·조건부 발언이면 제외한다. 팀 이름은 Grep 으로 찾고 앞뒤 문맥을 읽어라. 같은 팀 이름이 여러 경기(예: 일본-브라질 축구, 일본-한국 야구)에 나오면 상대팀·종목·리그·날짜가 정확히 맞는 경기에만 연결하고, 팀 이름만 같다고 다른 종목 발언을 연결하지 마라. 판단 후 픽이 배당 우세 방향과 정반대이면(예: 배당 1.78 우세 팀 대신 3.40 팀을 5명이 추천) 인용 문장을 다시 읽고 경기가 맞는지 재확인해라. 결과를 collector/picks_today.json 에 {"채널명":{"경기id":{"pick":"H","quote":"자막 원문 문장 그대로","url":"영상주소","videoTitle":"영상제목"}}} 형식으로 저장하고, 마지막에 node collector/apply_picks.js collector/picks_today.json --replace 를 실행해라. 질문하지 말고 끝까지 수행하고, 마지막에 반영 건수만 한 줄로 출력해라.`;
function run(cmd,args,opt={}){
  return new Promise(res=>{
    let log='';const p=spawn(cmd,args,Object.assign({shell:process.platform==='win32',cwd:__dirname},opt));
    const t=setTimeout(()=>{try{p.kill()}catch(e){}},opt.timeout||180000);
    p.stdout.on('data',d=>log+=d);p.stderr.on('data',d=>log+=d);
    p.on('error',e=>{clearTimeout(t);res({code:-1,log:log+String(e)})});
    p.on('close',c=>{clearTimeout(t);res({code:c,log})});
  });
}
async function analyze(){
  const J=job={running:true,startedAt:Date.now(),steps:[
    {id:'odds',name:'베트맨 배당 수집',status:'wait',detail:''},
    {id:'dl',name:'유튜버 영상 자막 받기',status:'wait',detail:''},
    {id:'pick',name:'유튜버 픽 판단 (Claude가 자막을 읽는 중)',status:'wait',detail:''}],error:null};
  const S=id=>J.steps.find(x=>x.id===id),tail=l=>l.trim().split('\n').slice(-3).join(' / ').slice(0,300);
  // 1) 배당
  S('odds').status='run';let r=await run(process.execPath,['collect.js']);
  if(r.code!==0){S('odds').status='fail';S('odds').detail=tail(r.log);J.error='배당 수집에 실패했습니다: '+tail(r.log);J.running=false;return}
  S('odds').status='ok';S('odds').detail=tail(r.log);
  // 2) 자막 다운로드 (실패해도 기존 픽 유지하고 계속)
  S('dl').status='run';r=await run(process.execPath,['yt.js'],{env:Object.assign({},process.env,{YT_DOWNLOAD_ONLY:'1'}),timeout:900000});
  if(r.code!==0){S('dl').status='warn';S('dl').detail='자막을 받지 못해 기존 유튜버 픽을 유지합니다. '+tail(r.log);S('pick').status='skip';J.warn=true}
  else{
    S('dl').status='ok';S('dl').detail=tail(r.log);
    // 3) Claude 헤드리스로 자막 판단 → 실패 시 키워드 방식
    S('pick').status='run';
    r=await run('claude',['-p',PROMPT,'--allowedTools','Read','Grep','Glob','Write','Bash(node collector/apply_picks.js:*)','--permission-mode','acceptEdits'],{cwd:root,timeout:900000});
    if(r.code===0){S('pick').status='ok';S('pick').detail=tail(r.log)}
    else{
      S('pick').detail='Claude 실행 실패 → 정확도가 낮은 키워드 방식으로 대체합니다. ';
      const r2=await run(process.execPath,['yt.js'],{timeout:900000});
      S('pick').status=r2.code===0?'warn':'fail';S('pick').detail+=tail(r2.log||r.log);J.warn=true;
    }
  }
  try{J.data=JSON.parse(fs.readFileSync(path.join(root,'data.json'),'utf8'))}catch(e){J.error='data.json을 읽지 못했습니다';}
  J.running=false;J.finishedAt=Date.now();
}
http.createServer((req,res)=>{
  const send=(o,c=200)=>{res.writeHead(c,{'content-type':'application/json;charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(o))};
  if(req.method==='POST'&&req.url==='/api/analyze'){
    if(job&&job.running)return send({ok:true,already:true});
    analyze().catch(e=>{job.error=String(e);job.running=false});return send({ok:true});
  }
  if(req.method==='GET'&&req.url.startsWith('/api/status')){
    if(!job)return send({running:false,none:true});
    const o=Object.assign({},job);if(job.running)delete o.data;return send(o);
  }
  let f=decodeURIComponent(req.url.split('?')[0]);if(f==='/')f='/index.html';
  const fp=path.join(root,f);if(!fp.startsWith(root)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res.writeHead(404);return res.end('not found')}
  res.writeHead(200,{'content-type':mime[path.extname(fp)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(fp).pipe(res);
}).listen(PORT,'127.0.0.1',()=>console.log('앱 주소: http://localhost:'+PORT));
