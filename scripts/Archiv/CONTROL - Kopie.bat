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

REM Read configuration from relay.ini

for /f %%i in (..\ini\relay.ini) do (
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
if "%RXL%"=="on" echo Actual RX-Frequency is %RXFREQUENCY%Mhz
if "%RXL%"=="on" echo Actual RX-SR is %RXSR%KS
echo ---------------------------------------

if "%MODE%"=="qpsk" set /p CONTROL=Which parameter do you want to change, PTT off (0), PTT on (1), Frequency (2), Gain (3), Digital Gain (4) :
if NOT "%MODE%"=="qpsk" set /p CONTROL=Which parameter do you want to change, PTT off (0), PTT on (1), Frequency (2), Gain (3) :

:PTT
if /I "%CONTROL%"=="0" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)&(echo PTT is OFF)&(GoTo CONTROL)
if /I "%CONTROL%"=="1" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 0 -h %PLUTOIP%)&(echo PTT is ON)&(GoTo CONTROL)
if /I "%CONTROL%"=="2" GoTo FREQUENCYTX
if /I "%CONTROL%"=="3" GoTo GAIN
if /I "%CONTROL%"=="4" GoTo DGAIN


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

:FREQUENCYRX
if "%RXL%"=="on" more ..\ini\frequency.ini
if "%RXL%"=="on" set /p RXFREQCHOICE=Please, choose your RX-Frequency 0-28 :

if /I "%RXFREQCHOICE%"=="0" if "%RXL%"=="on" set /p RXFREQUENCY=Please, choose your RX-Frequency, input in kHz :
if /I "%RXFREQCHOICE%"=="1" (SET RXFREQUENCY=10492750)
if /I "%RXFREQCHOICE%"=="2" (SET RXFREQUENCY=10493000)
if /I "%RXFREQCHOICE%"=="3" (SET RXFREQUENCY=10493250)
if /I "%RXFREQCHOICE%"=="4" (SET RXFREQUENCY=10493500)
if /I "%RXFREQCHOICE%"=="5" (SET RXFREQUENCY=10493750)
if /I "%RXFREQCHOICE%"=="6" (SET RXFREQUENCY=10494000)
if /I "%RXFREQCHOICE%"=="7" (SET RXFREQUENCY=10494250)
if /I "%RXFREQCHOICE%"=="8" (SET RXFREQUENCY=10494500)
if /I "%RXFREQCHOICE%"=="9" (SET RXFREQUENCY=10494750)
if /I "%RXFREQCHOICE%"=="10" (SET RXFREQUENCY=10495000)
if /I "%RXFREQCHOICE%"=="11" (SET RXFREQUENCY=10495250)
if /I "%RXFREQCHOICE%"=="12" (SET RXFREQUENCY=10495500)
if /I "%RXFREQCHOICE%"=="13" (SET RXFREQUENCY=10495750)
if /I "%RXFREQCHOICE%"=="14" (SET RXFREQUENCY=10496000)
if /I "%RXFREQCHOICE%"=="15" (SET RXFREQUENCY=10496250)
if /I "%RXFREQCHOICE%"=="16" (SET RXFREQUENCY=10496500)
if /I "%RXFREQCHOICE%"=="17" (SET RXFREQUENCY=10496750)
if /I "%RXFREQCHOICE%"=="18" (SET RXFREQUENCY=10497000)
if /I "%RXFREQCHOICE%"=="19" (SET RXFREQUENCY=10497250)
if /I "%RXFREQCHOICE%"=="20" (SET RXFREQUENCY=10497500)
if /I "%RXFREQCHOICE%"=="21" (SET RXFREQUENCY=10497750)
if /I "%RXFREQCHOICE%"=="23" (SET RXFREQUENCY=10498000)
if /I "%RXFREQCHOICE%"=="24" (SET RXFREQUENCY=10498250)
if /I "%RXFREQCHOICE%"=="25" (SET RXFREQUENCY=10498500)
if /I "%RXFREQCHOICE%"=="26" (SET RXFREQUENCY=10498750)
if /I "%RXFREQCHOICE%"=="27" (SET RXFREQUENCY=10499000)
if /I "%RXFREQCHOICE%"=="28" (SET RXFREQUENCY=10491500)

REM TX
%mosquitto% -t %CMD_ROOT%/tx/frequency -m %TXFREQUENCY% -h %PLUTOIP%
echo TX-Frequency is set to %TXFREQUENCY%Mhz

REM GSE RX
if "%RXL%"=="on" set /a LONGFREQUENCY = %RXFREQUENCY% - %RXOFFSET% * 1000
if "%RXL%"=="on" %mosquitto% -t cmd/longmynd/frequency -m %LONGFREQUENCY% -h %PLUTOIP%

REM RX SR
if "%RXL%"=="on" more ..\ini\longmynd-sr.ini
if "%RXL%"=="on" set /p SRCHOICE=Please, choose your RX-Sample Rate (0-9) :
if /I "%SRCHOICE%"=="0" if "%RXL%"=="on" set /p RXSR=Please, choose your RX-Sample Rate (35-4000) :
if /I "%SRCHOICE%"=="1" if "%RXL%"=="on" (SET RXSR=35)
if /I "%SRCHOICE%"=="2" if "%RXL%"=="on" (SET RXSR=66)
if /I "%SRCHOICE%"=="3" if "%RXL%"=="on" (SET RXSR=125)
if /I "%SRCHOICE%"=="4" if "%RXL%"=="on" (SET RXSR=250)
if /I "%SRCHOICE%"=="5" if "%RXL%"=="on" (SET RXSR=333)
if /I "%SRCHOICE%"=="6" if "%RXL%"=="on" (SET RXSR=500)
if /I "%SRCHOICE%"=="7" if "%RXL%"=="on" (SET RXSR=1000)
if /I "%SRCHOICE%"=="8" if "%RXL%"=="on" (SET RXSR=1500)
if /I "%SRCHOICE%"=="9" if "%RXL%"=="on" (SET RXSR=2000)

if "%RXL%"=="on" %mosquitto% -t cmd/longmynd/sr -m %RXSR% -h %PLUTOIP%

if "%RXL%"=="on" echo Longmynd-Frequency is set to %LONGFREQUENCY%Khz
if "%RXL%"=="on" echo RX-Frequency is set to %RXFREQUENCY%Mhz
if "%RXL%"=="on" echo RX-Sample Rate is set to %RXSR%KS

REM Restart MPV or FFPLAY
if "%DATVOUT%"=="on" if "%RXPRG%"=="ffplay" if "%RELAY%"=="off" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")
if "%DATVOUT%"=="on" if "%RXPRG%"=="mpv" if "%RELAY%"=="off" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%DATVOUT%"=="on" if "%RXPRG%"=="ffplay" if "%RELAY%"=="off" start "FFPLAY" ..\scripts\START-FFPLAY-LONGMYND.bat
if "%DATVOUT%"=="on" if "%RXPRG%"=="mpv" if "%RELAY%"=="off" start "MPV" ..\scripts\START-MPV-LONGMYND.bat
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

