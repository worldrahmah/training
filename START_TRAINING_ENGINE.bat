@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo Node.js was not found. Install Node.js 22 or newer, then run this file again.
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('node -p "process.versions.node"') do set NODEVER=%%v
node -e "process.exit(Number(process.versions.node.split('.')[0])>=22?0:1)"
if errorlevel 1 (
  echo.
  echo Training Engine requires Node.js 22 or newer. Detected: %NODEVER%
  echo Node.js 24 LTS is recommended.
  echo.
  pause
  exit /b 1
)
echo.
echo =====================================================
echo             TRAINING ENGINE
 echo =====================================================
echo Node.js: %NODEVER%
echo Preparing local typography...
node tools\cache-google-fonts.mjs --optional
echo Starting local server...
echo.
start "Training Engine Server" /min cmd /c "node --no-warnings app\server.mjs"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/trainer"
start "" "http://localhost:3000/present"
echo Trainer:   http://localhost:3000/trainer
echo Projector: http://localhost:3000/present
echo.
echo The Trainer dashboard shows the recommended LAN links for phones and student devices.
echo Keep the server window running during the class.
echo.
pause
