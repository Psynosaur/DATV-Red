REM Script for DATV-TX via OBS, by DL5OCD
REM DATV-NotSoEasy-light

@echo off

SET BASEDIR=%~dp0
cd %BASEDIR%

REM ############## Global configuration ###############
REM Read configuration from config-tx.ini

for /f "delims=" %%i in (.\config-tx.ini) do (
set %%i
 )

REM ###################################################
REM Basic console settings
mode con lines=64
color 9F
cls

more .\version.txt
echo Running script in %BASEDIR%
REM You can adjust the lines below when you know what you are doing ;-)
REM ###################################################

if "%FW%"=="yes" (GoTo start)
if "%FW%"=="no" (echo FW=yes in config-tx.ini not set, exit)&(pause)&(exit)

:START
REM Read previous run from params.ini and favorites from favorite-x.ini
REM Jump to encoders

echo DATV-NotSoEasy-Light version, no streaming - just steering the Pluto!
echo -------------------------
echo Last run:
more .\ini\params-light.ini
echo -------------------------
echo -------------------------
echo Profile 1 setup:
more .\ini\favorite-light-1.ini
echo -------------------------
echo -------------------------
echo Profile 2 setup:
more .\ini\favorite-light-2.ini
echo -------------------------
echo -------------------------
echo Profile 3 setup:
more .\ini\favorite-light-3.ini
echo -------------------------

set /p AUTO=Use profile 1 (1), profile 2 (2), profile 3 (3), use previous parameters (4), start new parameters (5) :

if /I "%AUTO%"=="1" (for /f %%i in (.\ini\favorite-light-1.ini) do (
set %%i
 )
	)

if /I "%AUTO%"=="2" (for /f %%i in (.\ini\favorite-light-2.ini) do (
set %%i
 )
	)

if /I "%AUTO%"=="3" (for /f %%i in (.\ini\favorite-light-3.ini) do (
set %%i
 )
	)


if /I "%AUTO%"=="4" (for /f %%i in (.\ini\params-light.ini) do (
set %%i
 )
	)


if /I "%AUTO%"=="1" GoTo PRINT
if /I "%AUTO%"=="2" GoTo PRINT
if /I "%AUTO%"=="3" GoTo PRINT
if /I "%AUTO%"=="4" GoTo PRINT


:MODE
set /p MODECHOICE=Please, choose your mode : QPSK (1), 8PSK (2), 16APSK (3) :
if /I "%MODECHOICE%"=="1" (SET MODE=qpsk)
if /I "%MODECHOICE%"=="2" (SET MODE=8psk)
if /I "%MODECHOICE%"=="3" (SET MODE=16apsk)


:FREQUENCYTX
more .\ini\frequency.ini
set /p FREQCHOICE=Please, choose your frequency 0-27 :

if /I "%FREQCHOICE%"=="0" set /p TXFREQUENCY=Please, choose your TX-Frequency (70Mhz-6Ghz), input in Hz :
if /I "%FREQCHOICE%"=="1" (SET TXFREQUENCY=2403.25e6)
if /I "%FREQCHOICE%"=="2" (SET TXFREQUENCY=2403.50e6)
if /I "%FREQCHOICE%"=="3" (SET TXFREQUENCY=2403.75e6)
if /I "%FREQCHOICE%"=="4" (SET TXFREQUENCY=2404.00e6)
if /I "%FREQCHOICE%"=="5" (SET TXFREQUENCY=2404.25e6)
if /I "%FREQCHOICE%"=="6" (SET TXFREQUENCY=2404.50e6)
if /I "%FREQCHOICE%"=="7" (SET TXFREQUENCY=2404.75e6)
if /I "%FREQCHOICE%"=="8" (SET TXFREQUENCY=2405.00e6)
if /I "%FREQCHOICE%"=="9" (SET TXFREQUENCY=2405.25e6)
if /I "%FREQCHOICE%"=="10" (SET TXFREQUENCY=2405.50e6)
if /I "%FREQCHOICE%"=="11" (SET TXFREQUENCY=2405.75e6)
if /I "%FREQCHOICE%"=="12" (SET TXFREQUENCY=2406.00e6)
if /I "%FREQCHOICE%"=="13" (SET TXFREQUENCY=2406.25e6)
if /I "%FREQCHOICE%"=="14" (SET TXFREQUENCY=2406.50e6)
if /I "%FREQCHOICE%"=="15" (SET TXFREQUENCY=2406.75e6)
if /I "%FREQCHOICE%"=="16" (SET TXFREQUENCY=2407.00e6)
if /I "%FREQCHOICE%"=="17" (SET TXFREQUENCY=2407.25e6)
if /I "%FREQCHOICE%"=="18" (SET TXFREQUENCY=2407.50e6)
if /I "%FREQCHOICE%"=="19" (SET TXFREQUENCY=2407.75e6)
if /I "%FREQCHOICE%"=="20" (SET TXFREQUENCY=2408.00e6)
if /I "%FREQCHOICE%"=="21" (SET TXFREQUENCY=2408.25e6)
if /I "%FREQCHOICE%"=="22" (SET TXFREQUENCY=2408.50e6)
if /I "%FREQCHOICE%"=="23" (SET TXFREQUENCY=2408.75e6)
if /I "%FREQCHOICE%"=="24" (SET TXFREQUENCY=2409.00e6)
if /I "%FREQCHOICE%"=="25" (SET TXFREQUENCY=2409.25e6)
if /I "%FREQCHOICE%"=="26" (SET TXFREQUENCY=2409.50e6)
if /I "%FREQCHOICE%"=="27" (SET TXFREQUENCY=2409.75e6)

:GAIN
set /p GAIN=Please, choose your TX-Gain (0 to -50dB), 0.5dB steps :
if /I %GAIN% GTR %PWRLIM% (echo Invalid gain, PWRLIM is set to %PWRLIM%dB)&(GoTo GAIN)


:MODES
REM Decision modes
if /I "%MODECHOICE%"=="1" GoTo QPSK
if /I "%MODECHOICE%"=="2" GoTo 8PSK
if /I "%MODECHOICE%"=="3" GoTo 16APSK


:QPSK
more .\ini\qpsk.ini
set /p SRCHOICE=Please, choose your SR 0-9 :

if /I "%SRCHOICE%"=="0" set /p SR=Please, choose your SR (25-4000) :

if /I "%SRCHOICE%"=="1" (SET SR=35)
if /I "%SRCHOICE%"=="2" (SET SR=66)
if /I "%SRCHOICE%"=="3" (SET SR=125)
if /I "%SRCHOICE%"=="4" (SET SR=250)
if /I "%SRCHOICE%"=="5" (SET SR=333)
if /I "%SRCHOICE%"=="6" (SET SR=500)
if /I "%SRCHOICE%"=="7" (SET SR=1000)
if /I "%SRCHOICE%"=="8" (SET SR=1500)
if /I "%SRCHOICE%"=="9" (SET SR=2000)

more .\ini\qpsk-fec.ini
set /p FECCHOICE=Please, choose your FEC 1-11 :

if /I "%FECCHOICE%"=="1" (SET FEC=1/4)
if /I "%FECCHOICE%"=="2" (SET FEC=1/3)
if /I "%FECCHOICE%"=="3" (SET FEC=2/5)
if /I "%FECCHOICE%"=="4" (SET FEC=1/2)
if /I "%FECCHOICE%"=="5" (SET FEC=3/5)
if /I "%FECCHOICE%"=="6" (SET FEC=2/3)
if /I "%FECCHOICE%"=="7" (SET FEC=3/4)
if /I "%FECCHOICE%"=="8" (SET FEC=4/5)
if /I "%FECCHOICE%"=="9" (SET FEC=5/6)
if /I "%FECCHOICE%"=="10" (SET FEC=8/9)
if /I "%FECCHOICE%"=="11" (SET FEC=9/10)

GoTo PRINT


:8PSK
more .\ini\8psk.ini
set /p SRCHOICE=Please, choose your SR 0-9 :

if /I "%SRCHOICE%"=="0" set /p SR=Please, choose your SR (25-4000) :

if /I "%SRCHOICE%"=="1" (SET SR=35)
if /I "%SRCHOICE%"=="2" (SET SR=66)
if /I "%SRCHOICE%"=="3" (SET SR=125)
if /I "%SRCHOICE%"=="4" (SET SR=250)
if /I "%SRCHOICE%"=="5" (SET SR=333)
if /I "%SRCHOICE%"=="6" (SET SR=500)
if /I "%SRCHOICE%"=="7" (SET SR=1000)
if /I "%SRCHOICE%"=="8" (SET SR=1500)
if /I "%SRCHOICE%"=="9" (SET SR=2000)


more .\ini\8psk-fec.ini
set /p FECCHOICE=Please, choose your FEC 1-6 :

if /I "%FECCHOICE%"=="1" (SET FEC=3/5)
if /I "%FECCHOICE%"=="2" (SET FEC=2/3)
if /I "%FECCHOICE%"=="3" (SET FEC=3/4)
if /I "%FECCHOICE%"=="4" (SET FEC=5/6)
if /I "%FECCHOICE%"=="5" (SET FEC=8/9)
if /I "%FECCHOICE%"=="6" (SET FEC=9/10)

GoTo PRINT


:16APSK
more .\ini\16apsk.ini
set /p SRCHOICE=Please, choose your SR 0-9 :

if /I "%SRCHOICE%"=="0" set /p SR=Please, choose your SR (25-4000) :

if /I "%SRCHOICE%"=="1" (SET SR=35)
if /I "%SRCHOICE%"=="2" (SET SR=66)
if /I "%SRCHOICE%"=="3" (SET SR=125)
if /I "%SRCHOICE%"=="4" (SET SR=250)
if /I "%SRCHOICE%"=="5" (SET SR=333)
if /I "%SRCHOICE%"=="6" (SET SR=500)
if /I "%SRCHOICE%"=="7" (SET SR=1000)
if /I "%SRCHOICE%"=="8" (SET SR=1500)
if /I "%SRCHOICE%"=="9" (SET SR=2000)


more .\ini\16apsk-fec.ini
set /p FECCHOICE=Please, choose your FEC 1-5 :

if /I "%FECCHOICE%"=="1" (SET FEC=2/3)
if /I "%FECCHOICE%"=="2" (SET FEC=3/4)
if /I "%FECCHOICE%"=="3" (SET FEC=5/6)
if /I "%FECCHOICE%"=="4" (SET FEC=8/9)
if /I "%FECCHOICE%"=="5" (SET FEC=9/10)

GoTo PRINT


:PRINT

REM Check parameters
if %SR% GTR 4000 (echo Invalid SR ^>4000KS)&(GoTo START)

REM Status and info
echo -----------------------------------
echo Running parameters:
echo -----------------------------------
echo Pluto-IP: %PLUTOIP%
echo Pluto-Port: %PLUTOPORT%
echo TX-Frequency: %TXFREQUENCY%Mhz
echo Gain: %GAIN%dB
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo -----------------------------------

REM Write run to params-light.ini
echo SR=%SR% > .\ini\params-light.ini
echo MODE=%MODE% >> .\ini\params-light.ini
echo FEC=%FEC% >> .\ini\params-light.ini
echo TXFREQUENCY=%TXFREQUENCY% >> .\ini\params-light.ini
echo GAIN=%GAIN% >> .\ini\params-light.ini


:MOSQUITTO
REM Mosquitto commands, don't modify
set /a SRM = %SR% * 1000
set /a DIGITALGAIN = 0

REM %mosquitto% -t %CMD_ROOT%/tx/dvbs2/rxbbframeip -m %MCAST%:%MCASTPORT% -h %PLUTOIP%
REM %mosquitto% -t %CMD_ROOT%/ip/tunadress -m %TUNIP% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/tssourceaddress -m %PLUTOIP%:%PLUTOPORT% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/gain -m %GAIN% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/mute -m %MUTE% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/frequency -m %TXFREQUENCY% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/sr -m %SRM% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/nco -m %NCO% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/stream/mode -m %TXMODE% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/fec -m %FEC% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/constel -m %MODE% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/pilots -m %PILOTS% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/frame -m %FRAME% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/fecmode -m %FECMODE% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/agcgain -m %AGCGAIN% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/gainvariable -m %GAINVARIABLE% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/digitalgain -m %DIGITALGAIN% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/fecrange -m %FECRANGE% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/tssourcemode -m %TSSOURCEMODE% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/tssourcefile -m %TSSOURCEFILE% -h %PLUTOIP%


REM Start Control and MQTT Browser
start "CONTROL" .\scripts\CONTROL-LIGHT.bat
start .\Mosquitto\MQTT-Explorer-0.4.0-beta1.exe

REM Running till interaction
echo Running, now stream the Pluto from OBS or something similar....press any key to exit...

pause

REM Kill Control and MQTT Browser
if "%REBOOT%"=="on" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%
taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe
taskkill /F /FI "WINDOWTITLE eq CONTROL*"

exit

