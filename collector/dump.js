// 사용: node dump.js 사우디   → collector/raw 의 베트맨 원본에서 해당 팀이 들어간 모든 행을 그대로 출력 (파서 검증용)
const fs=require('fs'),path=require('path');
const kw=process.argv[2];if(!kw){console.log('사용: node dump.js 팀이름');process.exit(1)}
const dir=path.join(__dirname,'raw');let n=0;
for(const f of fs.readdirSync(dir)){
  let j;try{j=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')).json}catch(e){continue}
  const cs=j&&j.compSchedules;if(!cs||!cs.keys||!cs.datas)continue;
  const hi=cs.keys.indexOf('homeName'),ai=cs.keys.indexOf('awayName');
  cs.datas.forEach((r,i)=>{
    if(String(r[hi]).includes(kw)||String(r[ai]).includes(kw)){
      n++;const o={};cs.keys.forEach((k,x)=>{if(r[x]!==null&&r[x]!==''&&r[x]!==0&&r[x]!=='-')o[k]=r[x]});
      console.log(`--- ${f} 행${i}`);console.log(JSON.stringify(o));
    }
  });
}
console.log(`\n총 ${n}행`);
