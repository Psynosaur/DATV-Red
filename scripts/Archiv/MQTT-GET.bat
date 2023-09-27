mode con lines=64
@echo off

SET BASEDIR=%~dp0
cd %BASEDIR%

REM Read configuration from config-tx.ini

for /f "delims=" %%i in (..\config-tx.ini) do (
set %%i
 )

CLS

if "%FW%"=="yes" %mosquittosub% -h %PLUTOIP% -t %CMD_ROOT%/tx/gain -t %CMD_ROOT%/tx/frequency
