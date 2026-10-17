@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 veya daha yeni bir surum gerekli.
  pause
  exit /b 1
)
if not exist "node_modules\tsx" (
  call npm.cmd ci
  if errorlevel 1 goto failed
  call npm.cmd run setup
  if errorlevel 1 goto failed
)
echo Uygulama: http://127.0.0.1:4210
call npm.cmd start
if errorlevel 1 goto failed
exit /b 0
:failed
echo Baslatma tamamlanamadi. Yukaridaki hatayi kontrol edin.
pause
exit /b 1
