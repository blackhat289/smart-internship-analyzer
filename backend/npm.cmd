@echo off
where npm.cmd >nul 2>nul
if %errorlevel% neq 0 exit /b %errorlevel%
for /f "delims=" %%i in ('where npm.cmd ^| findstr /v /i "\\backend\\npm.cmd"') do (
  call "%%i" %*
  exit /b %errorlevel%
)
exit /b 1
