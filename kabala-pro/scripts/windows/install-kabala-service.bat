@echo off
setlocal

set "SERVICE_NAME=KabalaPro"
for %%I in ("%~dp0..\..") do set "PROJECT_DIR=%%~fI"
set "BACKEND_DIR=%PROJECT_DIR%\backend"
set "DIST_INDEX=%PROJECT_DIR%\dist\index.html"
set "LOG_DIR=%BACKEND_DIR%\logs"
set "LOCAL_NSSM=%PROJECT_DIR%\tools\nssm\nssm.exe"
set "PORT=4000"

if exist "%LOCAL_NSSM%" (
  set "NSSM_EXE=%LOCAL_NSSM%"
) else (
  for /f "delims=" %%S in ('where nssm.exe 2^>nul') do (
    set "NSSM_EXE=%%S"
    goto :nssm_found
  )
)

:nssm_found

if not defined NSSM_EXE (
  echo ERROR: NSSM was not found.
  echo Place nssm.exe in "%PROJECT_DIR%\tools\nssm" or add it to PATH.
  exit /b 1
)

for /f "delims=" %%N in ('where node.exe 2^>nul') do (
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
