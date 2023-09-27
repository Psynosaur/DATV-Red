@echo off

SET BASEDIR=%~dp0
cd %BASEDIR%

REM Read configuration from config-tx.ini

for /f "delims=" %%i in (..\config-tx.ini) do (
set %%i
 )

CLS

%mosquitto% -t %CMD_ROOT%/ip/route -m "add default gw 192.168.2.1" -h %PLUTOIPMQTT%
pause