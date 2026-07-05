@echo off
setlocal

for %%I in ("%~dp0..\..") do set "PROJECT_DIR=%%~fI"

echo Building Kabala Pro frontend...
pushd "%PROJECT_DIR%" || exit /b 1

call npm.cmd install
if errorlevel 1 exit /b %errorlevel%

call npm.cmd run build
if errorlevel 1 exit /b %errorlevel%

popd
echo Frontend build completed: "%PROJECT_DIR%\dist"
endlocal
