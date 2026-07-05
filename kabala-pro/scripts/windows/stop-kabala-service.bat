@echo off
setlocal

set "SERVICE_NAME=KabalaPro"
for %%I in ("%~dp0..\..") do set "PROJECT_DIR=%%~fI"
set "LOCAL_NSSM=%PROJECT_DIR%\tools\nssm\nssm.exe"

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
  exit /b 1
)

"%NSSM_EXE%" stop "%SERVICE_NAME%"
endlocal
