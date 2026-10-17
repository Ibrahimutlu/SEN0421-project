@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 24.12 or newer is required.
  pause
  exit /b 1
)
if not exist "node_modules\tsx" (
  call npm.cmd ci
  if errorlevel 1 goto failed
)
call npm.cmd run setup
if errorlevel 1 goto failed
echo Open http://127.0.0.1:4210 in your browser.
call npm.cmd start
if errorlevel 1 goto failed
exit /b 0
:failed
echo Startup failed. Check the error above.
pause
exit /b 1
