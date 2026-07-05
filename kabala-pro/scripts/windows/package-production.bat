@echo off
setlocal

for %%I in ("%~dp0..\..") do set "PROJECT_DIR=%%~fI"
set "RELEASE_DIR=%PROJECT_DIR%\release\KabalaPro"

echo Preparing Kabala Pro production package...

pushd "%PROJECT_DIR%" || exit /b 1

call scripts\windows\build-frontend.bat
if errorlevel 1 exit /b %errorlevel%

if exist "%RELEASE_DIR%" rmdir /s /q "%RELEASE_DIR%"
mkdir "%RELEASE_DIR%"

robocopy "%PROJECT_DIR%\backend" "%RELEASE_DIR%\backend" /E /XD node_modules logs /XF .env hash.js
if errorlevel 8 exit /b %errorlevel%

robocopy "%PROJECT_DIR%\dist" "%RELEASE_DIR%\dist" /E
if errorlevel 8 exit /b %errorlevel%

robocopy "%PROJECT_DIR%\scripts" "%RELEASE_DIR%\scripts" /E
if errorlevel 8 exit /b %errorlevel%

robocopy "%PROJECT_DIR%\docs" "%RELEASE_DIR%\docs" /E
if errorlevel 8 exit /b %errorlevel%

robocopy "%PROJECT_DIR%\database" "%RELEASE_DIR%\database" /E
if errorlevel 8 exit /b %errorlevel%

if exist "%PROJECT_DIR%\tools" (
  robocopy "%PROJECT_DIR%\tools" "%RELEASE_DIR%\tools" /E
  if errorlevel 8 exit /b %errorlevel%
) else (
  mkdir "%RELEASE_DIR%\tools\nssm"
)

copy "%PROJECT_DIR%\README.md" "%RELEASE_DIR%\README.md" >nul
copy "%PROJECT_DIR%\package.json" "%RELEASE_DIR%\package.json" >nul
copy "%PROJECT_DIR%\package-lock.json" "%RELEASE_DIR%\package-lock.json" >nul

pushd "%RELEASE_DIR%\backend" || exit /b 1
if exist package-lock.json (
  call npm.cmd ci --omit=dev
  if errorlevel 1 exit /b %errorlevel%
) else (
  call npm.cmd install --omit=dev
  if errorlevel 1 exit /b %errorlevel%
)
popd

popd

echo Production package ready: "%RELEASE_DIR%"
endlocal
