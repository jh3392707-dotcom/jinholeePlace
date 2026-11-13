// 로컬 서버: 앱을 http://localhost:8787 로 열고, [배당 최신화] 버튼이 collect.js를 실행하게 해줍니다. (노트북에서 실행)
const http=require('http'),fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const root=path.join(__dirname,'..'),PORT=8787;let busy=false;
const mime={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.json':'application/json;charset=utf-8'};
http.createServer((req,res)=>{
  if(req.method==='POST'&&req.url==='/api/refresh'){
    const send=(o,c=200)=>{res.writeHead(c,{'content-type':'application/json;charset=utf-8'});res.end(JSON.stringify(o))};
    if(busy)return send({ok:false,error:'이미 수집 중입니다'},409);
    busy=true;let log='';
    const p=spawn(process.execPath,['collect.js'],{cwd:__dirname});
    const kill=setTimeout(()=>p.kill(),180000);
    p.stdout.on('data',d=>log+=d);p.stderr.on('data',d=>log+=d);
    p.on('close',code=>{clearTimeout(kill);busy=false;
      try{const data=JSON.parse(fs.readFileSync(path.join(root,'data.json'),'utf8'));
        if(code!==0)throw new Error('수집 실패(코드 '+code+')\n'+log.slice(-300));
        send({ok:true,data,log:log.slice(-300)})}catch(e){send({ok:false,error:e.message})}});
    return;
  }
  let f=decodeURIComponent(req.url.split('?')[0]);if(f==='/')f='/index.html';
  const fp=path.join(root,f);if(!fp.startsWith(root)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res.writeHead(404);return res.end('not found')}
  res.writeHead(200,{'content-type':mime[path.extname(fp)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(fp).pipe(res);
}).listen(PORT,'127.0.0.1',()=>console.log('앱 주소: http://localhost:'+PORT));
