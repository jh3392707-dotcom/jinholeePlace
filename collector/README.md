# 베트맨 수집기 (한국 IP의 본인 PC에서 실행)
1. Node.js 설치 후 이 폴더에서: `npm i playwright` → `npx playwright install chromium`
2. `node collect.js` (다른 회차는 `node collect.js 260136`)
3. 브라우저가 잠깐 열렸다 닫히고 `../data.json` 이 생성됩니다.
4. 앱(index.html)에서 [정보수집] → [수집 데이터 불러오기]로 data.json 선택.
※ 베트맨 응답 필드명은 추정으로 작성됨. 경기가 0건이면 `raw/` 파일을 Claude에게 보내 파서를 맞추세요.

## 유튜브 8채널 픽 자동 수집 (yt.js)
- 사전 준비: `yt-dlp` 설치(`pip install yt-dlp`). 먼저 `node collect.js`로 data.json을 만든 뒤 `node yt.js`.
- 정확도를 높이려면 `channels.json`에 각 채널 URL(`https://www.youtube.com/@핸들`)을 채우세요. 비우면 채널명 검색(부정확할 수 있음).
- 환경변수 `ANTHROPIC_API_KEY`를 설정하면 자막을 Claude가 읽어 픽을 뽑고(정확), 없으면 키워드 규칙으로 추정합니다. (자막 텍스트가 API로 전송됩니다)
- 자막은 `transcripts/`에 저장됩니다. 자동 추출은 추정이므로 앱 매트릭스에서 꼭 확인하세요.
- 영상에 자막(자동자막 포함)이 없으면 건너뜁니다.
