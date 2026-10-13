@echo off
setlocal
cd /d "%~dp0"
echo Running Training Engine v2.1.1 self-tests...
echo.
call npm test || goto :fail
echo.
echo ALL SELF-TESTS PASSED
pause
exit /b 0
:fail
echo.
echo SELF-TEST FAILED. Do not use this build for a live class.
pause
exit /b 1
