@echo off

SET BASEDIR=%~dp0
cd %BASEDIR%

REM Read configuration from config-tx.ini

for /f "delims=" %%i in (..\config-tx.ini) do (
set %%i
 )

CLS

echo Run this script as Administrator!!!
echo Adding local routing for the PC...
echo route add %NETWORK% %PLUTOIPMQTT%
route add %NETWORK% %PLUTOIPMQTT%
echo Routing is set.
echo Press enter to kill the routing.

pause
route delete %NETWORK%
exit