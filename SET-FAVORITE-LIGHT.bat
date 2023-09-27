REM Script for setting favorite parameters, by DL5OCD
REM DATV-NotSoEasy

@echo off

REM Read configuration from config-tx.ini

for /f "delims=" %%i in (.\config-tx.ini) do (
set %%i
 )

mode con lines=64
CLS

echo Script for setting favorite parameters by DL5OCD
echo ------------------------------------------------
echo -
echo ----------------------------
echo Profile 1 parameters:
more .\ini\favorite-light-1.ini
echo ----------------------------
echo ----------------------------
echo Profile 2 parameters:
more .\ini\favorite-light-2.ini
echo ----------------------------
echo ----------------------------
echo Profile 3 parameters:
more .\ini\favorite-light-3.ini
echo ----------------------------

:START
set /p CHANGE=Do you want to change your profile settings? YES (1), NO (2) :
if /I "%CHANGE%"=="2" (echo Nothing changed - END)&(pause)&(exit)
if /I "%CHANGE%"=="1" (echo OK...)

:PROFILE
set /p PROFILECHOICE=Which profile do you want to change: Profile 1 (1), profile 2 (2) or profile 3 (3) :
if /I "%PROFILECHOICE%"=="1" (SET PROFILECOUNT=1)
if /I "%PROFILECHOICE%"=="2" (SET PROFILECOUNT=2)
if /I "%PROFILECHOICE%"=="3" (SET PROFILECOUNT=3)


:MODE
set /p MODECHOICE=Please, choose your Mode : QPSK (1), 8PSK (2), 16APSK (3) :
if /I "%MODECHOICE%"=="1" (SET MODE=qpsk)
if /I "%MODECHOICE%"=="2" (SET MODE=8psk)
if /I "%MODECHOICE%"=="3" (SET MODE=16apsk)


:FREQUENCYTX
more .\ini\frequency.ini
set /p FREQCHOICE=Please, choose your TX-Frequency 0-27 :

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

if "%auto%"=="6" GoTo QPSK

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

REM Write to favorite-light-x.ini
echo -----------------------------------
echo Setting favorite parameters....
echo -----------------------------------

echo SR=%SR% > .\ini\favorite-light-%PROFILECOUNT%.ini
echo MODE=%MODE% >> .\ini\favorite-light-%PROFILECOUNT%.ini
echo FEC=%FEC% >> .\ini\favorite-light-%PROFILECOUNT%.ini
echo TXFREQUENCY=%TXFREQUENCY% >> .\ini\favorite-light-%PROFILECOUNT%.ini
echo GAIN=%GAIN% >> .\ini\favorite-light-%PROFILECOUNT%.ini

echo --------------------------------------
echo Profile %PROFILECOUNT% parameters are set
echo --------------------------------------

set /p CHANGE=Do you want to change another profile? YES (1), NO (2) :
if /I "%CHANGE%"=="1" GoTo PROFILE

pause
exit

