@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===== 군인 최고의 재태크, 토토 =====
git pull
set /p B=오늘 투자 금액(원, 1000원 단위 예: 20000): 
claude "오늘 분석해줘. 예산은 %B%원이야."
start "" index.html
