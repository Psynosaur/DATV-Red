@echo off

SET BASEDIR=%~dp0
cd %BASEDIR%

REM Read configuration from config-tx.ini

for /f "delims=" %%i in (..\config-tx.ini) do (
set %%i
 )

CLS

:PTT
set /p PTT=PTT on=1, off=0, q=exit PTT-Control :
if /I "%PTT%"=="0" (SET MUTE=1)&(echo PTT is OFF)
if /I "%PTT%"=="1" (SET MUTE=0)&(echo PTT is ON)
if /I "%PTT%"=="q" (exit)

%mosquitto% -t %CMD_ROOT%/tx/mute -m %MUTE% -h %PLUTOIPMQTT%

GoTo PTT