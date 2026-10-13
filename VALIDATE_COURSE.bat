@echo off
setlocal
cd /d "%~dp0"
if "%~1"=="" (
  echo Drag a .course.zip or course JSON file onto VALIDATE_COURSE.bat
  echo or enter the full path below.
  set /p COURSEFILE=Course file: 
) else (
  set COURSEFILE=%~1
)
node --no-warnings tools\validate-course.mjs "%COURSEFILE%"
echo.
pause
