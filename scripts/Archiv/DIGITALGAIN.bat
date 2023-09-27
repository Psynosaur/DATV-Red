@echo off

SET BASEDIR=%~dp0
cd %BASEDIR%

REM Read configuration from config-tx.ini

for /f "delims=" %%i in (..\config-tx.ini) do (
set %%i
 )

CLS

:PWRD
set /p DGAIN=Digital TX-Gain (QPSK only) 3 to -20dB, step is 0.01db, q to quit :
if /I "%DGAIN%"=="q" (exit)

%mosquitto% -t %CMD_ROOT%/tx/dvbs2/digitalgain -m %DGAIN% -h %PLUTOIPMQTT%
echo Digital TX-Gain set to %DGAIN%
GoTo PWRD