@echo off

SET BASEDIR=%~dp0
cd %BASEDIR%

REM Read configuration from config-tx.ini

for /f "delims=" %%i in (..\config-tx.ini) do (
set %%i
 )

CLS

:PWR
set /p GAIN=TX-Gain 0 to -40dB, step is 0.5db, q to quit :
if /I "%GAIN%"=="q" (exit)

%mosquitto% -t %CMD_ROOT%/tx/gain -m %GAIN% -h %PLUTOIPMQTT%
echo Gain set to %GAIN%
GoTo PWR