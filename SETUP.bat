REM Initial setup by DL5OCD
@echo off

REM Read configuration from config-tx.ini

for /f "delims=" %%i in (.\config-tx.ini) do (
set %%i
 )

cls
echo Initial setup to set the CALLSIGN for the Pluto (new F5OEO FW only!)...
echo ------------------------------------------------------------------------
echo Please be shure to set the variables CALLSIGN, PLUTOIPMQTT and CMD_ROOT in config-tx.ini !!!!!
echo Install Mosquitto before you proceed !!!!!
echo You find the installer in the Mosquitto directory (mosquitto-2.0.15-install-windows-x64.exe).
echo Be shure, that the Pluto is reachable.
echo When everything is ready, press enter...

pause

ping %PLUTOIP%


%mosquitto% -t cmd/pluto/call -m %CALLSIGN% -h %PLUTOIP%
echo Reboot the Pluto.
echo You can close this window now.
pause