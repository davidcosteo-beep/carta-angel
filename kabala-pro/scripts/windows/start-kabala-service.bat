@echo off
setlocal

set "SERVICE_NAME=KabalaPro"
for %%I in ("%~dp0..\..") do set "PROJECT_DIR=%%~fI"
set "LOCAL_NSSM=%PROJECT_DIR%\tools\nssm\nssm.exe"

if not exist "%LOCAL_NSSM%" (
  echo ERROR: NSSM was not found at "%LOCAL_NSSM%".
  exit /b 1
)
set "NSSM_EXE=%LOCAL_NSSM%"

"%NSSM_EXE%" start "%SERVICE_NAME%"
endlocal
