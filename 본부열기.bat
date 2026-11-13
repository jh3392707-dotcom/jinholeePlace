@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===== 토토 본부: 대위 이진호 대기 중 =====
echo 이 창을 켜 두면 휴대폰 사이트의 [최신화는 대위 이진호에게 요청] 버튼이 동작합니다.
git pull
claude remote-control --name 토토본부 --spawn same-dir --permission-mode acceptEdits
echo.
echo 본부가 종료되었습니다. 다시 켜려면 이 파일을 더블클릭하세요.
pause
