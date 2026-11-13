// index.html + data.js 를 하나로 합쳐 Artifact(사이트)용 artifact.html 생성. 사용: node build_artifact.js
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
let h=fs.readFileSync(path.join(root,'index.html'),'utf8');
const data=fs.readFileSync(path.join(root,'data.js'),'utf8');
const style=h.match(/<style>([\s\S]*?)<\/style>/)[1];
const body=h.match(/<body>([\s\S]*?)<script/)[1];
const scripts=h.slice(h.indexOf('<script>\nconst CH='),h.lastIndexOf('</script>')+9);
const out=`<title>군인 최고의 재태크, 토토</title>
<link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>:root{color-scheme:dark}${style}</style>
${body}
<script>${data}</script>
${scripts}`;
fs.writeFileSync(path.join(root,'artifact.html'),out);console.log('artifact.html',out.length,'bytes');
