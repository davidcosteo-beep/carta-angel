@echo off
setlocal

for %%I in ("%~dp0..\..") do set "PROJECT_DIR=%%~fI"
set "RELEASE_DIR=%PROJECT_DIR%\release\KabalaPro"
set "INSTALLER_NSSM=%PROJECT_DIR%\installer\dependencies\nssm.exe"

echo Preparing Kabala Pro production package...

pushd "%PROJECT_DIR%" || exit /b 1

call scripts\windows\build-frontend.bat
if errorlevel 1 exit /b %errorlevel%

if exist "%RELEASE_DIR%" rmdir /s /q "%RELEASE_DIR%"
mkdir "%RELEASE_DIR%"

robocopy "%PROJECT_DIR%\backend" "%RELEASE_DIR%\backend" /E /XD node_modules logs "%PROJECT_DIR%\backend\storage\pdfs" /XF .env hash.js
set "ROBOCOPY_CODE=%ERRORLEVEL%"
if %ROBOCOPY_CODE% GEQ 8 echo ERROR: Fatal robocopy failure while copying backend. Exit code: %ROBOCOPY_CODE%.
if %ROBOCOPY_CODE% GEQ 8 exit /b %ROBOCOPY_CODE%

if not exist "%RELEASE_DIR%\backend\storage\pdfs" mkdir "%RELEASE_DIR%\backend\storage\pdfs"
if not exist "%RELEASE_DIR%\backend\storage\pdfs" (
  echo ERROR: Could not create the empty packaged PDF storage directory.
  exit /b 1
)
if exist "%PROJECT_DIR%\backend\storage\pdfs\.gitkeep" (
  copy /Y "%PROJECT_DIR%\backend\storage\pdfs\.gitkeep" "%RELEASE_DIR%\backend\storage\pdfs\.gitkeep" >nul
  if errorlevel 1 (
    echo ERROR: Could not copy backend\storage\pdfs\.gitkeep.
    exit /b 1
  )
)

robocopy "%PROJECT_DIR%\dist" "%RELEASE_DIR%\dist" /E
set "ROBOCOPY_CODE=%ERRORLEVEL%"
if %ROBOCOPY_CODE% GEQ 8 echo ERROR: Fatal robocopy failure while copying frontend dist. Exit code: %ROBOCOPY_CODE%.
if %ROBOCOPY_CODE% GEQ 8 exit /b %ROBOCOPY_CODE%

robocopy "%PROJECT_DIR%\scripts" "%RELEASE_DIR%\scripts" /E
set "ROBOCOPY_CODE=%ERRORLEVEL%"
if %ROBOCOPY_CODE% GEQ 8 echo ERROR: Fatal robocopy failure while copying scripts. Exit code: %ROBOCOPY_CODE%.
if %ROBOCOPY_CODE% GEQ 8 exit /b %ROBOCOPY_CODE%

robocopy "%PROJECT_DIR%\docs" "%RELEASE_DIR%\docs" /E
set "ROBOCOPY_CODE=%ERRORLEVEL%"
if %ROBOCOPY_CODE% GEQ 8 echo ERROR: Fatal robocopy failure while copying documentation. Exit code: %ROBOCOPY_CODE%.
if %ROBOCOPY_CODE% GEQ 8 exit /b %ROBOCOPY_CODE%

robocopy "%PROJECT_DIR%\database" "%RELEASE_DIR%\database" /E
set "ROBOCOPY_CODE=%ERRORLEVEL%"
if %ROBOCOPY_CODE% GEQ 8 echo ERROR: Fatal robocopy failure while copying database. Exit code: %ROBOCOPY_CODE%.
if %ROBOCOPY_CODE% GEQ 8 exit /b %ROBOCOPY_CODE%

if not exist "%PROJECT_DIR%\tools" goto ToolsCopyComplete
robocopy "%PROJECT_DIR%\tools" "%RELEASE_DIR%\tools" /E /XD nssm
set "ROBOCOPY_CODE=%ERRORLEVEL%"
if %ROBOCOPY_CODE% GEQ 8 echo ERROR: Fatal robocopy failure while copying tools. Exit code: %ROBOCOPY_CODE%.
if %ROBOCOPY_CODE% GEQ 8 exit /b %ROBOCOPY_CODE%
:ToolsCopyComplete

if not exist "%RELEASE_DIR%\logs" mkdir "%RELEASE_DIR%\logs"
if not exist "%INSTALLER_NSSM%" (
  echo ERROR: NSSM source is missing at installer\dependencies\nssm.exe.
  exit /b 1
)
if not exist "%RELEASE_DIR%\tools\nssm" mkdir "%RELEASE_DIR%\tools\nssm"
if not exist "%RELEASE_DIR%\tools\nssm" (
  echo ERROR: Could not create release\KabalaPro\tools\nssm.
  exit /b 1
)
copy /Y "%INSTALLER_NSSM%" "%RELEASE_DIR%\tools\nssm\nssm.exe" >nul
if errorlevel 1 (
  echo ERROR: Failed to copy NSSM into the production package.
  exit /b 1
)
if not exist "%RELEASE_DIR%\tools\nssm\nssm.exe" (
  echo ERROR: NSSM copy reported success, but the packaged file is missing.
  exit /b 1
)

copy "%PROJECT_DIR%\README.md" "%RELEASE_DIR%\README.md" >nul
copy "%PROJECT_DIR%\package.json" "%RELEASE_DIR%\package.json" >nul
copy "%PROJECT_DIR%\package-lock.json" "%RELEASE_DIR%\package-lock.json" >nul

if not exist "%RELEASE_DIR%\backend\server.js" (
  echo ERROR: Packaged backend\server.js is missing.
  exit /b 1
)
if not exist "%RELEASE_DIR%\dist\index.html" (
  echo ERROR: Packaged dist\index.html is missing.
  exit /b 1
)
if not exist "%RELEASE_DIR%\tools\nssm\nssm.exe" (
  echo ERROR: Packaged tools\nssm\nssm.exe is missing before dependency installation.
  exit /b 1
)
pushd "%RELEASE_DIR%\backend" || exit /b 1
call npm.cmd ci --omit=dev
if errorlevel 1 exit /b %errorlevel%
popd

if not exist "%RELEASE_DIR%\backend\node_modules" (
  echo ERROR: Production backend node_modules is missing after npm ci.
  exit /b 1
)
for /r "%RELEASE_DIR%\backend\storage\pdfs" %%F in (*.pdf) do (
  echo ERROR: Generated PDF found in production package: "%%F"
  exit /b 1
)

popd

echo Production package ready: "%RELEASE_DIR%"
endlocal
exit /b 0
