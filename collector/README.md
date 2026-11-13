# 베트맨 수집기 (한국 IP의 본인 PC에서 실행)
1. Node.js 설치 후 이 폴더에서: `npm i playwright` → `npx playwright install chromium`
2. `node collect.js` (다른 회차는 `node collect.js 260136`)
3. 브라우저가 잠깐 열렸다 닫히고 `../data.json` 이 생성됩니다.
4. 앱(index.html)에서 [정보수집] → [수집 데이터 불러오기]로 data.json 선택.
※ 베트맨 응답 필드명은 추정으로 작성됨. 경기가 0건이면 `raw/` 파일을 Claude에게 보내 파서를 맞추세요.
