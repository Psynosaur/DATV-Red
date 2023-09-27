mode con lines=64
@echo off

SET BASEDIR=%~dp0
cd %BASEDIR%

REM Wait 2s to let write mainprg to params.ini
timeout 2

REM Read configuration from config-tx.ini

for /f "delims=" %%i in (..\config-tx.ini) do (
set %%i
 )

REM Read configuration from rxonoff.ini

for /f %%i in (..\ini\rxonoff.ini) do (
set %%i
 )

REM Read configuration from params.ini

for /f %%i in (..\ini\params.ini) do (
set %%i
 )

SET DGAIN=0

CLS

:CONTROL
echo ---------------------------------------
echo Actual gain is %GAIN%dB
echo Actual digital gain is %DGAIN%dB
echo Actual TX-Frequency is %TXFREQUENCY%Mhz
echo Actual Mode is %MODE%
echo Actual TX-SR is %SR%KS
echo Actual TX-FEC is %FEC%
echo ---------------------------------------

if "%MODE%"=="qpsk" set /p CONTROL=Which parameter to change, PTT off (0), PTT on (1), Frequency (2), Gain (3), Digital Gain (4), Mode SR and FEC (5), Advanced Options (6) :
if NOT "%MODE%"=="qpsk" set /p CONTROL=Which parameter to change, PTT off (0), PTT on (1), Frequency (2), Gain (3), Mode SR and FEC (4), Advanced Options (6) :

:PTT
if /I "%CONTROL%"=="0" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)&(echo PTT is OFF)&(GoTo CONTROL)
if /I "%CONTROL%"=="1" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 0 -h %PLUTOIP%)&(echo PTT is ON)&(GoTo CONTROL)

if /I "%CONTROL%"=="2" GoTo FREQUENCYTX
if /I "%CONTROL%"=="3" GoTo GAIN
if /I "%CONTROL%"=="4" GoTo DGAIN
if /I "%CONTROL%"=="5" GoTo MODE
if /I "%CONTROL%"=="6" GoTo ADVANCED


:FREQUENCYTX

more ..\ini\frequency.ini
set /p TXFREQCHOICE=Please, choose your TX-Frequency 0-27 :

if /I "%TXFREQCHOICE%"=="0" set /p TXFREQUENCY=Please, choose your TX-Frequency (70Mhz-6Ghz), input in Hz :
if /I "%TXFREQCHOICE%"=="1" (SET TXFREQUENCY=2403.25e6)
if /I "%TXFREQCHOICE%"=="2" (SET TXFREQUENCY=2403.50e6)
if /I "%TXFREQCHOICE%"=="3" (SET TXFREQUENCY=2403.75e6)
if /I "%TXFREQCHOICE%"=="4" (SET TXFREQUENCY=2404.00e6)
if /I "%TXFREQCHOICE%"=="5" (SET TXFREQUENCY=2404.25e6)
if /I "%TXFREQCHOICE%"=="6" (SET TXFREQUENCY=2404.50e6)
if /I "%TXFREQCHOICE%"=="7" (SET TXFREQUENCY=2404.75e6)
if /I "%TXFREQCHOICE%"=="8" (SET TXFREQUENCY=2405.00e6)
if /I "%TXFREQCHOICE%"=="9" (SET TXFREQUENCY=2405.25e6)
if /I "%TXFREQCHOICE%"=="10" (SET TXFREQUENCY=2405.50e6)
if /I "%TXFREQCHOICE%"=="11" (SET TXFREQUENCY=2405.75e6)
if /I "%TXFREQCHOICE%"=="12" (SET TXFREQUENCY=2406.00e6)
if /I "%TXFREQCHOICE%"=="13" (SET TXFREQUENCY=2406.25e6)
if /I "%TXFREQCHOICE%"=="14" (SET TXFREQUENCY=2406.50e6)
if /I "%TXFREQCHOICE%"=="15" (SET TXFREQUENCY=2406.75e6)
if /I "%TXFREQCHOICE%"=="16" (SET TXFREQUENCY=2407.00e6)
if /I "%TXFREQCHOICE%"=="17" (SET TXFREQUENCY=2407.25e6)
if /I "%TXFREQCHOICE%"=="18" (SET TXFREQUENCY=2407.50e6)
if /I "%TXFREQCHOICE%"=="19" (SET TXFREQUENCY=2407.75e6)
if /I "%TXFREQCHOICE%"=="20" (SET TXFREQUENCY=2408.00e6)
if /I "%TXFREQCHOICE%"=="21" (SET TXFREQUENCY=2408.25e6)
if /I "%TXFREQCHOICE%"=="22" (SET TXFREQUENCY=2408.50e6)
if /I "%TXFREQCHOICE%"=="23" (SET TXFREQUENCY=2408.75e6)
if /I "%TXFREQCHOICE%"=="24" (SET TXFREQUENCY=2409.00e6)
if /I "%TXFREQCHOICE%"=="25" (SET TXFREQUENCY=2409.25e6)
if /I "%TXFREQCHOICE%"=="26" (SET TXFREQUENCY=2409.50e6)
if /I "%TXFREQCHOICE%"=="27" (SET TXFREQUENCY=2409.75e6)


REM TX
%mosquitto% -t %CMD_ROOT%/tx/frequency -m %TXFREQUENCY% -h %PLUTOIP%
echo TX-Frequency is set to %TXFREQUENCY%Mhz
GoTo CONTROL


:GAIN
set /p GAIN=TX-Gain 0 to -40dB, step is 0.5db :
if /I %GAIN% GTR %PWRLIM% (echo Invalid gain, PWRLIM is set to %PWRLIM%dB)&(GoTo GAIN)

%mosquitto% -t %CMD_ROOT%/tx/gain -m %GAIN% -h %PLUTOIP%
echo Gain set to %GAIN%
GoTo CONTROL


:DGAIN
set /p DGAIN=Digital TX-Gain (QPSK only) 3 to -20dB, step is 0.01db :
if /I %DGAIN% GTR 3 (echo Invalid gain, value must be between -20 and 3)&(GoTo DGAIN)
if /I %DGAIN% LSS -20 (echo Invalid gain, value must be between -20 and 3)&(GoTo DGAIN)

%mosquitto% -t %CMD_ROOT%/tx/dvbs2/digitalgain -m %DGAIN% -h %PLUTOIP%
echo Digital TX-Gain set to %DGAIN%
GoTo CONTROL


:MODE
set /p MODECHOICE=Please, choose your Mode : QPSK (1), 8PSK (2), 16APSK (3) :
if /I "%MODECHOICE%"=="1" (SET MODE=qpsk)&(GoTo QPSK)
if /I "%MODECHOICE%"=="2" (SET MODE=8psk)&(GoTo 8PSK)
if /I "%MODECHOICE%"=="3" (SET MODE=16apsk)&(GoTo 16APSK)


:QPSK
more ..\ini\qpsk.ini
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

more ..\ini\qpsk-fec.ini
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
more ..\ini\8psk.ini
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


more ..\ini\8psk-fec.ini
set /p FECCHOICE=Please, choose your FEC 1-6 :

if /I "%FECCHOICE%"=="1" (SET FEC=3/5)
if /I "%FECCHOICE%"=="2" (SET FEC=2/3)
if /I "%FECCHOICE%"=="3" (SET FEC=3/4)
if /I "%FECCHOICE%"=="4" (SET FEC=5/6)
if /I "%FECCHOICE%"=="5" (SET FEC=8/9)
if /I "%FECCHOICE%"=="6" (SET FEC=9/10)

GoTo PRINT


:16APSK
more ..\ini\16apsk.ini
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


more ..\ini\16apsk-fec.ini
set /p FECCHOICE=Please, choose your FEC 1-5 :

if /I "%FECCHOICE%"=="1" (SET FEC=2/3)
if /I "%FECCHOICE%"=="2" (SET FEC=3/4)
if /I "%FECCHOICE%"=="3" (SET FEC=5/6)
if /I "%FECCHOICE%"=="4" (SET FEC=8/9)
if /I "%FECCHOICE%"=="5" (SET FEC=9/10)

GoTo PRINT


:PRINT

REM Check parameters
if %SR% GTR 4000 (echo Invalid SR ^>4000KS)&(GoTo CONTROL)

REM Status and info
echo -----------------------------------
echo Running parameters:
echo -----------------------------------
echo TX-Frequency: %TXFREQUENCY%Mhz
echo Gain: %GAIN%dB
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo -----------------------------------


REM Mosquitto commands, don't modify
set /a SRM = %SR% * 1000

REM %mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/sr -m %SRM% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/fec -m %FEC% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/constel -m %MODE% -h %PLUTOIP%
REM %mosquitto% -t %CMD_ROOT%/tx/mute -m 0 -h %PLUTOIP%
GoTo CONTROL


:ADVANCED

echo ---------------------------------------
echo Actual FEC is %FEC%
echo Actual FECVARIABLE is %FECVARIABLE%
echo Actual FECMODE is %FECMODE%
echo Actual FECRANGE is %FECRANGE%
echo Actual AGCGAIN is %AGCGAIN%dB
echo Actual GAINVARIABLE is %GAINVARIABLE%
echo ---------------------------------------

set /p ADVANCED=Which parameter to change, FECMODE (1), FECRANGE (2), AGCGAIN (3), GAINVARIABLE (4), Back to main menu (0) :

if /I "%ADVANCED%"=="1" set /p FECMODECHOICE=Enter FECMODE fixed (1) or variable (2) :
if /I "%FECMODECHOICE%"=="1" (SET FECMODE=fixed)
if /I "%FECMODECHOICE%"=="2" (SET FECMODE=variable)

if /I "%FECMODECHOICE%"=="2" if "%MODE%"=="qpsk" (set FECVARIABLE=1/4)
if /I "%FECMODECHOICE%"=="2" if "%MODE%"=="8psk" (set FECVARIABLE=3/5)
if /I "%FECMODECHOICE%"=="2" if "%MODE%"=="16apsk" (set FECVARIABLE=2/3)

if /I "%FECMODECHOICE%"=="1" %mosquitto% -t %CMD_ROOT%/tx/dvbs2/fecmode -m %FECMODE% -h %PLUTOIP%
if /I "%FECMODECHOICE%"=="1" %mosquitto% -t %CMD_ROOT%/tx/dvbs2/fec -m %FEC% -h %PLUTOIP%
if /I "%FECMODECHOICE%"=="2" %mosquitto% -t %CMD_ROOT%/tx/dvbs2/fecmode -m %FECMODE% -h %PLUTOIP%
if /I "%FECMODECHOICE%"=="2" %mosquitto% -t %CMD_ROOT%/tx/dvbs2/fec -m %FECVARIABLE% -h %PLUTOIP%
if /I "%FECMODECHOICE%"=="1" (echo FECMODE is set to %FECMODE%)
if /I "%FECMODECHOICE%"=="2" (echo FECMODE is set to %FECMODE%)

if /I "%ADVANCED%"=="2" set /p FECRANGE=Enter FECRANGE 1-11 :
if /I "%ADVANCED%"=="2" %mosquitto% -t %CMD_ROOT%/tx/dvbs2/fecrange -m %FECRANGE% -h %PLUTOIP%
if /I "%ADVANCED%"=="2" (echo FECRANGE is set to %FECRANGE%)

if /I "%ADVANCED%"=="3" set /p AGCGAIN=Enter AGCGAIN -1 to -100 (-100 is AGC off) :
if /I "%ADVANCED%"=="3" %mosquitto% -t %CMD_ROOT%/tx/dvbs2/agcgain -m %AGCGAIN% -h %PLUTOIP%
if /I "%ADVANCED%"=="3" (echo AGCGAIN is set to %AGCGAIN%)

if /I "%ADVANCED%"=="4" set /p GAINVARIABLE=Enter GAINVARIABLE on (1), off (0) :
if /I "%ADVANCED%"=="4" %mosquitto% -t %CMD_ROOT%/tx/dvbs2/gainvariable -m %GAINVARIABLE% -h %PLUTOIP%
if /I "%ADVANCED%"=="4" (echo GAINVARIABLE is set to %GAINVARIABLE%)

if /I "%ADVANCED%"=="0" GoTo CONTROL

set /p CHANGEMORE=Change more advanced options? Yes (1) No (0) :
if /I "%CHANGEMORE%"=="1" GoTo ADVANCED
if /I "%CHANGEMORE%"=="0" GoTo CONTROL
