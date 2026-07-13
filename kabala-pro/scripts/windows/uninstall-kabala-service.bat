@echo off
setlocal

set "SERVICE_NAME=KabalaPro"
set "LEGACY_SERVICE_NAME=KabalaProBackend"
for %%I in ("%~dp0..\..") do set "PROJECT_DIR=%%~fI"
set "LOCAL_NSSM=%PROJECT_DIR%\tools\nssm\nssm.exe"

if not exist "%LOCAL_NSSM%" (
  echo ERROR: NSSM was not found at "%LOCAL_NSSM%".
  exit /b 1
)
set "NSSM_EXE=%LOCAL_NSSM%"

"%NSSM_EXE%" stop "%SERVICE_NAME%"
"%NSSM_EXE%" remove "%SERVICE_NAME%" confirm
"%NSSM_EXE%" stop "%LEGACY_SERVICE_NAME%" >nul 2>&1
"%NSSM_EXE%" remove "%LEGACY_SERVICE_NAME%" confirm >nul 2>&1
endlocal
