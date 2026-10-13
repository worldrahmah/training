@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js was not found. Close the Training Engine Server window to stop this instance.
  pause
  exit /b 1
)
node --no-warnings tools\stop-server.mjs
if errorlevel 1 (
  echo Shutdown could not be confirmed. Check the Training Engine Server window.
)
pause
