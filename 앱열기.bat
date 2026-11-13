@echo off
chcp 65001 >nul
cd /d "%~dp0"
git pull
start "" http://localhost:8787
node collector\server.js
