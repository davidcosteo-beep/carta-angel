@echo off
setlocal

set "SERVICE_NAME=KabalaPro"
set "LEGACY_SERVICE_NAME=KabalaProBackend"
for %%I in ("%~dp0..\..") do set "PROJECT_DIR=%%~fI"
set "BACKEND_DIR=%PROJECT_DIR%\backend"
set "DIST_INDEX=%PROJECT_DIR%\dist\index.html"
set "LOG_DIR=%PROJECT_DIR%\logs"
set "LOCAL_NSSM=%PROJECT_DIR%\tools\nssm\nssm.exe"
set "PORT=4000"

if not exist "%LOCAL_NSSM%" (
  echo ERROR: NSSM was not found at "%LOCAL_NSSM%".
  exit /b 1
)
set "NSSM_EXE=%LOCAL_NSSM%"

if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
if not defined NODE_EXE if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles(x86)%\nodejs\node.exe"
if defined NODE_EXE goto :node_found
if not defined NODE_EXE for /f "delims=" %%N in ('where node.exe 2^>nul') do (
  set "NODE_EXE=%%N"
  goto :node_found
)

echo ERROR: node.exe was not found in PATH.
exit /b 1

:node_found

if not exist "%BACKEND_DIR%\server.js" (
  echo ERROR: Backend server was not found: "%BACKEND_DIR%\server.js"
  exit /b 1
)

if not exist "%BACKEND_DIR%\.env" (
  echo ERROR: Backend environment file was not found: "%BACKEND_DIR%\.env"
  echo Create it from "%BACKEND_DIR%\.env.example" before installing the service.
  exit /b 1
)

if not exist "%DIST_INDEX%" (
  echo ERROR: Frontend dist was not found: "%DIST_INDEX%"
  echo Run scripts\windows\build-frontend.bat before installing the service.
  exit /b 1
)

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo Installing Windows service %SERVICE_NAME% on port %PORT%...

"%NSSM_EXE%" stop "%LEGACY_SERVICE_NAME%" >nul 2>&1
"%NSSM_EXE%" remove "%LEGACY_SERVICE_NAME%" confirm >nul 2>&1
"%NSSM_EXE%" stop "%SERVICE_NAME%" >nul 2>&1
"%NSSM_EXE%" remove "%SERVICE_NAME%" confirm >nul 2>&1

"%NSSM_EXE%" install "%SERVICE_NAME%" "%NODE_EXE%" "server.js"
if errorlevel 1 exit /b %errorlevel%

"%NSSM_EXE%" set "%SERVICE_NAME%" AppDirectory "%BACKEND_DIR%"
"%NSSM_EXE%" set "%SERVICE_NAME%" DisplayName "Kabala Pro"
"%NSSM_EXE%" set "%SERVICE_NAME%" Description "Kabala Pro local production service"
"%NSSM_EXE%" set "%SERVICE_NAME%" Start SERVICE_AUTO_START
"%NSSM_EXE%" set "%SERVICE_NAME%" AppEnvironmentExtra "NODE_ENV=production" "PORT=%PORT%"
"%NSSM_EXE%" set "%SERVICE_NAME%" AppStdout "%LOG_DIR%\kabala-pro.out.log"
"%NSSM_EXE%" set "%SERVICE_NAME%" AppStderr "%LOG_DIR%\kabala-pro.err.log"
"%NSSM_EXE%" set "%SERVICE_NAME%" AppRotateFiles 1
"%NSSM_EXE%" set "%SERVICE_NAME%" AppRotateOnline 1
"%NSSM_EXE%" set "%SERVICE_NAME%" AppRotateBytes 1048576

"%NSSM_EXE%" start "%SERVICE_NAME%"
if errorlevel 1 exit /b %errorlevel%

echo Kabala Pro service installed and started.
echo Open: http://localhost:%PORT%
endlocal
