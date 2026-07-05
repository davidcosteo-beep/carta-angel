@echo off
setlocal

for %%I in ("%~dp0..\..") do set "PROJECT_DIR=%%~fI"
set "BACKEND_DIR=%PROJECT_DIR%\backend"

if not exist "%BACKEND_DIR%\scripts\init-database.js" (
  echo ERROR: Database initializer was not found.
  exit /b 1
)

pushd "%BACKEND_DIR%" || exit /b 1

call npm.cmd install --omit=dev
if errorlevel 1 exit /b %errorlevel%

node scripts\init-database.js --prompt-master-password
if errorlevel 1 exit /b %errorlevel%

popd
endlocal
