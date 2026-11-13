@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===== 군인 최고의 재태크, 토토 =====
echo 최신 파일을 받는 중...
git pull
echo 앱을 켜는 중... (잠시 뒤 브라우저가 자동으로 열리고 배당을 최신화합니다)
start "토토 앱 서버 (닫지 마세요)" /min node collector\server.js
timeout /t 3 /nobreak >nul
start "" "http://localhost:8787/?auto=1"
echo.
echo 브라우저가 열렸습니다. 이 창은 닫아도 됩니다. 단, 작은 "토토 앱 서버" 창은 닫지 마세요.
timeout /t 10 >nul
