REM Script for DATV-TX via FFMPEG, by DL5OCD
REM DATV-NotSoEasy

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

:START
REM Read previous run from params.ini and favorites from favorite-x.ini
REM Jump to encoders
REM If programm was not cleanly closed
echo RXL=0 > .\ini\rxonoff.ini

echo -------------------------
echo Last run:
more .\ini\params.ini
echo -------------------------
echo -------------------------
echo Profile 1 setup:
more .\ini\favorite-1.ini
echo -------------------------
echo -------------------------
echo Profile 2 setup:
more .\ini\favorite-2.ini
echo -------------------------
echo -------------------------
echo Profile 3 setup:
more .\ini\favorite-3.ini
echo -------------------------

set /p AUTO=External streaming (0), profile 1 (1), profile 2 (2), profile 3 (3), use previous parameters (4), start new parameters (5), GSE-Mode (6) :

if /I "%AUTO%"=="1" (for /f %%i in (.\ini\favorite-1.ini) do (
set %%i
 )
	)

if /I "%AUTO%"=="2" (for /f %%i in (.\ini\favorite-2.ini) do (
set %%i
 )
	)

if /I "%AUTO%"=="3" (for /f %%i in (.\ini\favorite-3.ini) do (
set %%i
 )
	)


if /I "%AUTO%"=="4" (for /f %%i in (.\ini\params.ini) do (
set %%i
 )
	)


if "%AUTO%"=="0" GoTo MODE

if "%AUTO%"=="1" if "%GSE%"=="1" (SET AUTO=6)&(GoTo GSE)
if "%AUTO%"=="2" if "%GSE%"=="1" (SET AUTO=6)&(GoTo GSE)
if "%AUTO%"=="3" if "%GSE%"=="1" (SET AUTO=6)&(GoTo GSE)

if "%AUTO%"=="1" GoTo DECISIONFW
if "%AUTO%"=="2" GoTo DECISIONFW
if "%AUTO%"=="3" GoTo DECISIONFW

if "%AUTO%"=="4" if "%GSE%"=="1" (SET AUTO=6)&(GoTo GSE)
if "%AUTO%"=="4" GoTo DECISIONFW

if "%AUTO%"=="5" GoTo CODEC

if "%AUTO%"=="6" if "%FW%"=="no" (echo Invalid, please set FW=yes in config-tx.ini)&(timeout 10)&(GoTo START)
if "%AUTO%"=="6" GoTo MODE

REM Look for RXSR in params.ini
REM if DEFINED RXSR (SET AUTO=6)&(GoTo GSE)

REM ###################################################

:CODEC
if "%ENCTYPE%"=="soft" GoTo CODECSOFT 
if "%ENCTYPE%"=="nvidia" GoTo CODECHARD


:CODECHARD
REM set /p codecchoice=Please, choose your codec: H264 (1), H265 (2), VVC (H266) (3), AV1 (4) :
set /p CODECCHOICE=Please, choose your Codec (HW-ENC): H264 (1), H265 (2), VVC (H266) (3) :
if /I "%CODECCHOICE%"=="1" (SET CODEC=h264_nvenc)
if /I "%CODECCHOICE%"=="2" (SET CODEC=hevc_nvenc)
if /I "%CODECCHOICE%"=="3" (SET CODEC=libvvenc)
if /I "%CODECCHOICE%"=="4" (SET CODEC=libaom-av1)

GoTo FPS


:CODECSOFT
REM set /p codecchoice=Please, choose your codec: H264 (1), H265 (2), VVC (H266) (3), AV1 (4) :
set /p CODECCHOICE=Please, choose your Codec (SW-ENC): H264 (1), H265 (2), VVC (H266) (3) :
if /I "%CODECCHOICE%"=="1" (SET CODEC=libx264)
if /I "%CODECCHOICE%"=="2" (SET CODEC=libx265)
if /I "%CODECCHOICE%"=="3" (SET CODEC=libvvenc)
if /I "%CODECCHOICE%"=="4" (SET CODEC=libaom-av1)


:FPS
set /p FPSCHOICE=Please, choose your FPS: 10 (1), 20 (2), 25 (3), 30 (4), 48 (5), 50 (6), 60 (7) :
if /I "%FPSCHOICE%"=="1" (SET FPS=10)
if /I "%FPSCHOICE%"=="2" (SET FPS=20)
if /I "%FPSCHOICE%"=="3" (SET FPS=25)
if /I "%FPSCHOICE%"=="4" (SET FPS=30)
if /I "%FPSCHOICE%"=="5" (SET FPS=48)
if /I "%FPSCHOICE%"=="6" (SET FPS=50)
if /I "%FPSCHOICE%"=="7" (SET FPS=60)

REM 5.1
if "%AUDIOCODEC%"=="ac3" (SET AUDIO=6)&(GoTo MODE)

set /p AUDIOCHOICE=Please, choose mono (1), or stereo (2) :
if /I "%AUDIOCHOICE%"=="1" (SET AUDIO=1)
if /I "%AUDIOCHOICE%"=="2" (SET AUDIO=2)


:MODE
set /p MODECHOICE=Please, choose your TX-Mode : QPSK (1), 8PSK (2), 16APSK (3) :
if /I "%MODECHOICE%"=="1" (SET MODE=qpsk)
if /I "%MODECHOICE%"=="2" (SET MODE=8psk)
if /I "%MODECHOICE%"=="3" (SET MODE=16apsk)

if "%AUTO%"=="6" GoTo FREQUENCYTX
if "%AUTO%"=="0" GoTo FREQUENCYTX

set /p IMAGECHOICE=Please, choose your Image size : 640x360 (1), 960x540 (2), 1280x720 (3), 1920x1080 (4), 2560x1440 (5) :
if /I "%IMAGECHOICE%"=="1" (SET IMAGESIZE=640x360)
if /I "%IMAGECHOICE%"=="2" (SET IMAGESIZE=960x540)
if /I "%IMAGECHOICE%"=="3" (SET IMAGESIZE=1280x720)
if /I "%IMAGECHOICE%"=="4" (SET IMAGESIZE=1920x1080)
if /I "%IMAGECHOICE%"=="5" (SET IMAGESIZE=2560x1440)

set /p ABITCHOICE=Please, choose your audio bitrate 4k (1), 8k (2), 16k (3), 32k (4), 64 (5), 96k (6) :
if /I "%ABITCHOICE%"=="1" (SET ABITRATE=4)
if /I "%ABITCHOICE%"=="2" (SET ABITRATE=8)
if /I "%ABITCHOICE%"=="3" (SET ABITRATE=16)
if /I "%ABITCHOICE%"=="4" (SET ABITRATE=32)
if /I "%ABITCHOICE%"=="5" (SET ABITRATE=64)
if /I "%ABITCHOICE%"=="6" (SET ABITRATE=96)

REM Decision for F5OEO Firmware
if "%FW%"=="no" GoTo MODES


:FREQUENCYTX
more .\ini\frequency.ini
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
if /I "%TXFREQCHOICE%"=="23" (SET TXFREQUENCY=2408.75e6)
if /I "%TXFREQCHOICE%"=="24" (SET TXFREQUENCY=2409.00e6)
if /I "%TXFREQCHOICE%"=="25" (SET TXFREQUENCY=2409.25e6)
if /I "%TXFREQCHOICE%"=="26" (SET TXFREQUENCY=2409.50e6)
if /I "%TXFREQCHOICE%"=="27" (SET TXFREQUENCY=2409.75e6)


:GAIN
set /p GAIN=Please, choose your TX-Gain (0 to -50dB), 0.5dB steps :
if /I %GAIN% GTR %PWRLIM% (echo Invalid gain, PWRLIM is set to %PWRLIM%dB)&(GoTo GAIN)


REM DATV-RELAY Mode
if "%RELAY%"=="on" SET DATVOUT=yes



:FREQUENCYRX
if "%DATVOUT%"=="yes" if NOT "%AUTO%"=="6" more .\ini\frequency.ini
if "%DATVOUT%"=="yes" if NOT "%AUTO%"=="6" set /p RXFREQCHOICE=Please, choose your RX-Frequency 0-28 :
if "%AUTO%"=="6" more .\ini\frequency.ini
if "%AUTO%"=="6" set /p RXFREQCHOICE=Please, choose your RX-Frequency 0-28 :

if /I "%RXFREQCHOICE%"=="0" if "%DATVOUT%"=="yes" if NOT "%AUTO%"=="6" set /p RXFREQUENCY=Please, choose your RX-Frequency, input in kHz :
if /I "%RXFREQCHOICE%"=="0" if "%AUTO%"=="6" set /p RXFREQUENCY=Please, choose your RX-Frequency, input in kHz :
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


:MODES
REM Decision modes
if /I "%MODECHOICE%"=="1" GoTo QPSK
if /I "%MODECHOICE%"=="2" GoTo 8PSK
if /I "%MODECHOICE%"=="3" GoTo 16APSK


:QPSK
more .\ini\qpsk.ini
set /p SRCHOICE=Please, choose your TX-SR 0-9 :

if /I "%SRCHOICE%"=="0" set /p SR=Please, choose your TX-SR (25-4000) :
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
set /p FECCHOICE=Please, choose your TX-FEC 1-11 :

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


:QPSKRX
if "%DATVOUT%"=="yes" if NOT "%AUTO%"=="6" if "%FW%"=="yes" more .\ini\longmynd-sr.ini
if "%DATVOUT%"=="yes" if NOT "%AUTO%"=="6" if "%FW%"=="yes" set /p SRCHOICE=Please, choose your RX-SR 0-9 :
if "%AUTO%"=="6" more .\ini\longmynd-sr.ini
if "%AUTO%"=="6" set /p SRCHOICE=Please, choose your RX-SR 0-9 :

if "%DATVOUT%"=="yes" if /I "%SRCHOICE%"=="0" set /p RXSR=Please, choose your RX-SR (25-4000) :
if "%AUTO%"=="6" if /I "%SRCHOICE%"=="0" set /p RXSR=Please, choose your RX-SR (25-4000) :
if /I "%SRCHOICE%"=="1" (SET RXSR=35)
if /I "%SRCHOICE%"=="2" (SET RXSR=66)
if /I "%SRCHOICE%"=="3" (SET RXSR=125)
if /I "%SRCHOICE%"=="4" (SET RXSR=250)
if /I "%SRCHOICE%"=="5" (SET RXSR=333)
if /I "%SRCHOICE%"=="6" (SET RXSR=500)
if /I "%SRCHOICE%"=="7" (SET RXSR=1000)
if /I "%SRCHOICE%"=="8" (SET RXSR=1500)
if /I "%SRCHOICE%"=="9" (SET RXSR=2000)

if "%AUTO%"=="6" GoTo GSE
if "%AUTO%"=="0" GoTo EXTERNAL


REM Calculation QPSK
set /a TSBITRATE = 2 * %SR% * 188 / 204 * %FEC% * 1075 / 1000

GoTo FREESR


:8PSK
more .\ini\8psk.ini
set /p SRCHOICE=Please, choose your TX-SR 0-9 :

if /I "%SRCHOICE%"=="0" set /p SR=Please, choose your TX-SR (25-4000) :
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
set /p FECCHOICE=Please, choose your TX-FEC 1-6 :

if /I "%FECCHOICE%"=="1" (SET FEC=3/5)
if /I "%FECCHOICE%"=="2" (SET FEC=2/3)
if /I "%FECCHOICE%"=="3" (SET FEC=3/4)
if /I "%FECCHOICE%"=="4" (SET FEC=5/6)
if /I "%FECCHOICE%"=="5" (SET FEC=8/9)
if /I "%FECCHOICE%"=="6" (SET FEC=9/10)


:8PSKRX
if "%DATVOUT%"=="yes" if NOT "%AUTO%"=="6" if "%FW%"=="yes" more .\ini\longmynd-sr.ini
if "%DATVOUT%"=="yes" if NOT "%AUTO%"=="6" if "%FW%"=="yes" set /p SRCHOICE=Please, choose your RX-SR 0-9 :
if "%AUTO%"=="6" more .\ini\longmynd-sr.ini
if "%AUTO%"=="6" set /p SRCHOICE=Please, choose your RX-SR 0-9 :

if "%DATVOUT%"=="yes" if /I "%SRCHOICE%"=="0" set /p RXSR=Please, choose your RX-SR (25-4000) :
if "%AUTO%"=="6" if /I "%SRCHOICE%"=="0" set /p RXSR=Please, choose your RX-SR (25-4000) :
if /I "%SRCHOICE%"=="1" (SET RXSR=35)
if /I "%SRCHOICE%"=="2" (SET RXSR=66)
if /I "%SRCHOICE%"=="3" (SET RXSR=125)
if /I "%SRCHOICE%"=="4" (SET RXSR=250)
if /I "%SRCHOICE%"=="5" (SET RXSR=333)
if /I "%SRCHOICE%"=="6" (SET RXSR=500)
if /I "%SRCHOICE%"=="7" (SET RXSR=1000)
if /I "%SRCHOICE%"=="8" (SET RXSR=1500)
if /I "%SRCHOICE%"=="9" (SET RXSR=2000)

if "%AUTO%"=="6" GoTo GSE
if "%AUTO%"=="0" GoTo EXTERNAL

REM Calculation 8PSK
set /a TSBITRATE = 3 * %SR% * 188 / 204 * %FEC% * 1075 / 1000

GoTo FREESR


:16APSK
more .\ini\16apsk.ini
set /p SRCHOICE=Please, choose your TX-SR 0-9 :

if /I "%SRCHOICE%"=="0" set /p SR=Please, choose your TX-SR (25-4000) :
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
set /p FECCHOICE=Please, choose your TX-FEC 1-5 :

if /I "%FECCHOICE%"=="1" (SET FEC=2/3)
if /I "%FECCHOICE%"=="2" (SET FEC=3/4)
if /I "%FECCHOICE%"=="3" (SET FEC=5/6)
if /I "%FECCHOICE%"=="4" (SET FEC=8/9)
if /I "%FECCHOICE%"=="5" (SET FEC=9/10)


:16APSKRX
if "%DATVOUT%"=="yes" if NOT "%AUTO%"=="6" if "%FW%"=="yes" more .\ini\longmynd-sr.ini
if "%DATVOUT%"=="yes" if NOT "%AUTO%"=="6" if "%FW%"=="yes" set /p SRCHOICE=Please, choose your RX-SR 0-9 :
if "%AUTO%"=="6" more .\ini\longmynd-sr.ini
if "%AUTO%"=="6" set /p SRCHOICE=Please, choose your RX-SR 0-9 :

if "%DATVOUT%"=="yes" if /I "%SRCHOICE%"=="0" set /p RXSR=Please, choose your RX-SR (25-4000) :
if "%AUTO%"=="6" if /I "%SRCHOICE%"=="0" set /p RXSR=Please, choose your RX-SR (25-4000) :
if /I "%SRCHOICE%"=="1" (SET RXSR=35)
if /I "%SRCHOICE%"=="2" (SET RXSR=66)
if /I "%SRCHOICE%"=="3" (SET RXSR=125)
if /I "%SRCHOICE%"=="4" (SET RXSR=250)
if /I "%SRCHOICE%"=="5" (SET RXSR=333)
if /I "%SRCHOICE%"=="6" (SET RXSR=500)
if /I "%SRCHOICE%"=="7" (SET RXSR=1000)
if /I "%SRCHOICE%"=="8" (SET RXSR=1500)
if /I "%SRCHOICE%"=="9" (SET RXSR=2000)

if "%AUTO%"=="6" GoTo GSE
if "%AUTO%"=="0" GoTo EXTERNAL

REM Calculation 16APSK
set /a TSBITRATE = 4 * %SR% * 188 / 204 * %FEC% * 1075 / 1000

GoTo FREESR


:FREESR
REM Videobitrate calculation

REM Up to 35K
if %SR% GTR 20 if %SR% LSS 36 set /a VBITRATE = (1000 * %TSBITRATE% * 45 / 100 / 1000) - %ABITRATE%
REM Up to 66K
if %SR% GTR 35 if %SR% LSS 67 set /a VBITRATE = (1000 * %TSBITRATE% * 60 / 100 / 1000) - %ABITRATE%
REM Up to 125K
if %SR% GTR 66 if %SR% LSS 126 set /a VBITRATE = (1000 * %TSBITRATE% * 68 / 100 / 1000) - %ABITRATE%
REM Up to 250K
if %SR% GTR 125 if %SR% LSS 251 set /a VBITRATE = (1000 * %TSBITRATE% * 76 / 100 / 1000) - %ABITRATE%
REM Up to 333K
if %SR% GTR 250 if %SR% LSS 334 set /a VBITRATE = (1000 * %TSBITRATE% * 80 / 100 / 1000) - %ABITRATE%
REM Up to 500K
if %SR% GTR 333 if %SR% LSS 501 set /a VBITRATE = (1000 * %TSBITRATE% * 82 / 100 / 1000) - %ABITRATE%
REM Up to 1000K
if %SR% GTR 500 if %SR% LSS 1001 set /a VBITRATE = (1000 * %TSBITRATE% * 86 / 100 / 1000) - %ABITRATE%
REM Up to 1500K
if %SR% GTR 1000 if %SR% LSS 1501 set /a VBITRATE = (1000 * %TSBITRATE% * 87 / 100 / 1000) - %ABITRATE%
REM Up to 3000K
if %SR% GTR 1500 if %SR% LSS 3001 set /a VBITRATE = (1000 * %TSBITRATE% * 92 / 100 / 1000) - %ABITRATE%
REM Above 4000K leads to invalid parameter check
if %SR% GTR 3000 set /a VBITRATE = (1000 * %TSBITRATE% * 93 / 100 / 1000) - %ABITRATE%

REM Decision for adjustment
if "%MODE%"=="QPSK" GoTo ADJUSTQPSK
if "%MODE%"=="8PSK" GoTo ADJUST8PSK
if "%MODE%"=="16APSK" GoTo ADJUST16APSK


:ADJUSTQPSK
REM Adjusting for low/high FEC
if "%FEC%"=="1/4" (SET /a VBITRATE=%VBITRATE% * 80 / 100)
if "%FEC%"=="1/3" (SET /a VBITRATE=%VBITRATE% * 91 / 100)
if "%FEC%"=="2/5" (SET /a VBITRATE=%VBITRATE% * 94 / 100)
if "%FEC%"=="1/2" (SET /a VBITRATE=%VBITRATE% * 98 / 100)
if "%FEC%"=="3/5" (SET /a VBITRATE=%VBITRATE% * 99 / 100)
if "%FEC%"=="2/3" (SET /a VBITRATE=%VBITRATE% * 100 / 100)
if "%FEC%"=="3/4" (SET /a VBITRATE=%VBITRATE% * 101 / 100)
if "%FEC%"=="4/5" (SET /a VBITRATE=%VBITRATE% * 101 / 100)
if "%FEC%"=="5/6" (SET /a VBITRATE=%VBITRATE% * 102 / 100)
if "%FEC%"=="8/9" (SET /a VBITRATE=%VBITRATE% * 103 / 100)
if "%FEC%"=="9/10" (SET /a VBITRATE=%VBITRATE% * 104 / 100)
GoTo PRINT


:ADJUST8PSK
REM Adjusting for low/high FEC
if "%FEC%"=="3/5" (SET /a VBITRATE=%VBITRATE% * 107 / 100)
if "%FEC%"=="2/3" (SET /a VBITRATE=%VBITRATE% * 108 / 100)
if "%FEC%"=="3/4" (SET /a VBITRATE=%VBITRATE% * 109 / 100)
if "%FEC%"=="5/6" (SET /a VBITRATE=%VBITRATE% * 109 / 100)
if "%FEC%"=="8/9" (SET /a VBITRATE=%VBITRATE% * 109 / 100)
if "%FEC%"=="9/10" (SET /a VBITRATE=%VBITRATE% * 109 / 100)
GoTo PRINT


:ADJUST16APSK
REM Adjusting for low/high FEC
if "%FEC%"=="2/3" (SET /a VBITRATE=%VBITRATE% * 118 / 100)
if "%FEC%"=="3/4" (SET /a VBITRATE=%VBITRATE% * 119 / 100)
if "%FEC%"=="5/6" (SET /a VBITRATE=%VBITRATE% * 121 / 100)
if "%FEC%"=="8/9" (SET /a VBITRATE=%VBITRATE% * 121 / 100)
if "%FEC%"=="9/10" (SET /a VBITRATE=%VBITRATE% * 122 / 100)
GoTo PRINT


:PRINT
REM Check parameters
if %SR% GTR 4000 (echo Invalid SR ^>4000KS)&(GoTo CODEC)
if %VBITRATE% LSS 20 (echo Invalid parameters, Video-Bitrate below 20K)&(GoTo CODEC)
if %VBITRATE% LSS 50 if %FPS% GTR 25 (echo Invalid parameters, FPS too high)&(GoTo CODEC)

REM Status and info
echo -----------------------------------
echo Running parameters:
echo -----------------------------------
echo Service-Name: %CALLSIGN%
echo Service-Provider: %SERVICEPROVIDER%
echo Pluto-IP: %PLUTOIP%
echo Pluto-Port: %PLUTOPORT%
echo TX-Frequency: %TXFREQUENCY%
echo RX-Frequency: %RXFREQUENCY%
echo Gain: %GAIN%
echo TX-SR: %SR%KS
echo RX-SR: %RXSR%KS
echo TX-Mode: %MODE%
echo TX-FEC: %FEC%
echo Image size: %IMAGESIZE%
echo FPS: %FPS%
echo Audiochannels: %AUDIO%
echo CODEC: %CODEC%
echo TS-Bitrate: %TSBITRATE%K
echo Video-Bitrate: %VBITRATE%K
echo Audio-Bitrate: %ABITRATE%K

REM Write run to params.ini
echo SR=%SR% > .\ini\params.ini
echo MODE=%MODE% >> .\ini\params.ini
echo FEC=%FEC% >> .\ini\params.ini
echo IMAGESIZE=%IMAGESIZE% >> .\ini\params.ini
echo FPS=%FPS% >> .\ini\params.ini
echo AUDIO=%AUDIO% >> .\ini\params.ini
echo CODEC=%CODEC% >> .\ini\params.ini
echo TSBITRATE=%TSBITRATE% >> .\ini\params.ini
echo VBITRATE=%VBITRATE% >> .\ini\params.ini
echo ABITRATE=%ABITRATE% >> .\ini\params.ini

echo TXFREQUENCY=%TXFREQUENCY% >> .\ini\params.ini
echo RXFREQUENCY=%RXFREQUENCY% >> .\ini\params.ini
echo RXSR=%RXSR% >> .\ini\params.ini
echo GAIN=%GAIN% >> .\ini\params.ini


:DECISIONFW
REM Decision for F5OEO Firmware
if "%FW%"=="no" GoTo DECISIONCODEC

:EXTERNAL
REM External streaming
REM Status and info
if "%AUTO%"=="0" echo ------------------------------------------
if "%AUTO%"=="0" echo Running parameters for external streaming:
if "%AUTO%"=="0" echo ------------------------------------------
if "%AUTO%"=="0" echo Pluto-IP: %PLUTOIP%
if "%AUTO%"=="0" echo Pluto-Port: %PLUTOPORT%
if "%AUTO%"=="0" echo TX-Frequency: %TXFREQUENCY%Mhz
if "%AUTO%"=="0" echo RX-Frequency: %RXFREQUENCY%Mhz
if "%AUTO%"=="0" echo Gain: %GAIN%dB
if "%AUTO%"=="0" echo SR: %SR%KS
if "%AUTO%"=="0" echo Mode: %MODE%
if "%AUTO%"=="0" echo FEC: %FEC%
if "%AUTO%"=="0" echo ------------------------------------------

REM Write run to params-light.ini
if "%AUTO%"=="0" echo SR=%SR% > .\ini\params.ini
if "%AUTO%"=="0" echo MODE=%MODE% >> .\ini\params.ini
if "%AUTO%"=="0" echo FEC=%FEC% >> .\ini\params.ini
if "%AUTO%"=="0" echo TXFREQUENCY=%TXFREQUENCY% >> .\ini\params.ini
if "%AUTO%"=="0" echo RXFREQUENCY=%RXFREQUENCY% >> .\ini\params.ini
if "%AUTO%"=="0" echo GAIN=%GAIN% >> .\ini\params.ini


:GSE
REM GSE RX
if "%AUTO%"=="6" set /a LONGFREQUENCY = %RXFREQUENCY% - %RXOFFSET% * 1000
if "%AUTO%"=="6" %mosquitto% -t %CMD_ROOT%/system/longmynd -m on -h %PLUTOIP%
if "%AUTO%"=="6" echo Wait 10s for Longmynd to start...
if "%AUTO%"=="6" timeout 10
if "%AUTO%"=="6" %mosquitto% -t cmd/longmynd/frequency -m %LONGFREQUENCY% -h %PLUTOIP%
if "%AUTO%"=="6" %mosquitto% -t cmd/longmynd/sr -m %RXSR% -h %PLUTOIP%
if "%AUTO%"=="6" %mosquitto% -t cmd/longmynd/tsip -m %TSIP% -h %PLUTOIP%
if "%AUTO%"=="6" %mosquitto% -t %CMD_ROOT%/tx/dvbs2/rxbbframeip -m %MCAST%:%MCASTPORT% -h %PLUTOIP%
if "%AUTO%"=="6" echo RXL=1 > .\ini\rxonoff.ini

REM GSE TX
if "%AUTO%"=="6" set TXMODE=dvbs2-gse
if "%AUTO%"=="6" set FRAME=short

REM GSE Routing
if "%AUTO%"=="6" %mosquitto% -t %CMD_ROOT%/ip/tunadress -m %TUNIP% -h %PLUTOIP%
REM if "%AUTO%"=="6" if "%ROUTE%"=="yes" (route add %ROUTENET% %PLUTOIP%)
REM if "%AUTO%"=="6" if "%ROUTE%"=="yes" start "ROUTING" .\scripts\ROUTING.BAT

REM GSE init iptables
if "%AUTO%"=="6" %mosquitto% -t %CMD_ROOT%/ip/iptables -m "-t nat -F" -h %PLUTOIP%
if "%AUTO%"=="6" ping -n 1 -w 10 127.255.255.255 >nul
if "%AUTO%"=="6" %mosquitto% -t %CMD_ROOT%/ip/iptables -m "-F" -h %PLUTOIP%
if "%AUTO%"=="6" ping -n 1 -w 10 127.255.255.255 >nul
if "%AUTO%"=="6" %mosquitto% -t %CMD_ROOT%/ip/iptables -m "-A FORWARD -p udp -o gse0 -s %NETWORK% -j DROP" -h %PLUTOIP%
if "%AUTO%"=="6" ping -n 1 -w 10 127.255.255.255 >nul
if "%AUTO%"=="6" %mosquitto% -t %CMD_ROOT%/ip/iptables -m "-t nat -A POSTROUTING -o gse0  -j MASQUERADE" -h %PLUTOIP%
if "%AUTO%"=="6" ping -n 1 -w 10 127.255.255.255 >nul
if "%AUTO%"=="6" %mosquitto% -t %CMD_ROOT%/ip/iptables -m "-t nat -A POSTROUTING -o eth0  -j MASQUERADE" -h %PLUTOIP%
if "%AUTO%"=="6" ping -n 1 -w 10 127.255.255.255 >nul
if "%AUTO%"=="6" %mosquitto% -t %CMD_ROOT%/ip/iptables -m "-t nat -A PREROUTING -p udp -i gse0 --dport %PORTSTART%:%PORTEND% -j DNAT --to-destination %PCFORWARD1%:%PORTSTART%-%PORTEND%" -h %PLUTOIP%
if "%AUTO%"=="6" ping -n 1 -w 10 127.255.255.255 >nul
if "%AUTO%"=="6" %mosquitto% -t %CMD_ROOT%/ip/iptables -m "-t nat -A PREROUTING -p tcp -i gse0 --dport %PORT% -j DNAT --to-destination %PCFORWARD2%:%PORT%" -h %PLUTOIP%

REM GSE Status and info
if "%AUTO%"=="6" echo GSE-Mode activated, frame type (short) and txmode (dvbs2-gse) automatically set:
if "%AUTO%"=="6" echo ######################################################################
if "%AUTO%"=="6" echo TX-Frequency: %TXFREQUENCY%Mhz
if "%AUTO%"=="6" echo RX-Frequency: %RXFREQUENCY%Mhz
if "%AUTO%"=="6" echo Offset-Frequency: %RXOFFSET%Mhz
if "%AUTO%"=="6" echo Longmynd-Frequency: %LONGFREQUENCY%Khz
if "%AUTO%"=="6" echo Gain: %GAIN%
if "%AUTO%"=="6" echo TX-SR: %SR%KS
if "%AUTO%"=="6" echo RX-SR: %RXSR%KS
if "%AUTO%"=="6" echo Mode: %MODE%
if "%AUTO%"=="6" echo FEC: %FEC%
if "%AUTO%"=="6" echo Mode type: %TXMODE%
if "%AUTO%"=="6" echo Frame type: %FRAME%
if "%AUTO%"=="6" echo Status Longmynd: on
if "%AUTO%"=="6" echo ######################################################################
if "%AUTO%"=="6" echo To set up the routing for the local PC, you have to start \scripts\ROUTING.BAT as Admin (klick)

REM REM Write run to params.ini
if "%AUTO%"=="6" echo GSE=1 > .\ini\params.ini
if "%AUTO%"=="6" echo TXFREQUENCY=%TXFREQUENCY% >> .\ini\params.ini
if "%AUTO%"=="6" echo RXFREQUENCY=%RXFREQUENCY% >> .\ini\params.ini
if "%AUTO%"=="6" echo GAIN=%GAIN% >> .\ini\params.ini
if "%AUTO%"=="6" echo SR=%SR% >> .\ini\params.ini
if "%AUTO%"=="6" echo RXSR=%RXSR% >> .\ini\params.ini
if "%AUTO%"=="6" echo MODE=%MODE% >> .\ini\params.ini
if "%AUTO%"=="6" echo FEC=%FEC% >> .\ini\params.ini



REM DATV-RELAY Mode
if "%RELAY%"=="on" SET PLUTOPORT=1234
if "%RELAY%"=="on" SET DATVOUTIP=%PLUTOIP%
if "%RELAY%"=="on" SET FECMODE=variable



:MOSQUITTO
REM Mosquitto general init commands, don't modify
set /a SRM = %SR% * 1000
set /a DIGITALGAIN = 0

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
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/digitalgain -m %DIGITALGAIN% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/fecrange -m %FECRANGE% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/tssourcemode -m %TSSOURCEMODE% -h %PLUTOIP%
%mosquitto% -t %CMD_ROOT%/tx/dvbs2/tssourcefile -m %TSSOURCEFILE% -h %PLUTOIP%
%mosquitto% -t cmd/longmynd/lnb_supply -m %LNBSUPPLY% -h %PLUTOIP%
%mosquitto% -t cmd/longmynd/polarisation -m %LNBPOL% -h %PLUTOIP%
%mosquitto% -t cmd/longmynd/swport -m %TUNERPORT% -h %PLUTOIP%


REM Start Control and MQTT Browser
if NOT "%AUTO%"=="0" start "CONTROL" .\scripts\CONTROL.bat
if "%AUTO%"=="0" start "CONTROL" .\scripts\CONTROL-LIGHT.bat
start .\Mosquitto\MQTT-Explorer-0.4.0-beta1.exe

REM Init Control after start
if "%DATVOUT%"=="yes" if NOT "%AUTO%"=="6" GoTo DATVRX

REM Running GSE or till interaction
if "%AUTO%"=="6" echo GSE-Mode started, press enter to exit...
if "%AUTO%"=="6" pause

REM Kill for GSE-Mode
if "%AUTO%"=="6" %mosquitto% -t %CMD_ROOT%/system/longmynd -m off -h %PLUTOIP%
if "%AUTO%"=="6" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%AUTO%"=="6" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%AUTO%"=="6" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%AUTO%"=="6" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
REM if "%AUTO%"=="6" if "%ROUTE%"=="yes" (route delete %ROUTENET%)
if "%AUTO%"=="6" echo RXL=0 > .\ini\rxonoff.ini
if "%AUTO%"=="6" exit


:DATVRX
REM DATV RX
if "%DATVOUT%"=="yes" set /a LONGFREQUENCY = %RXFREQUENCY% - %RXOFFSET% * 1000
if "%DATVOUT%"=="yes" %mosquitto% -t %CMD_ROOT%/system/longmynd -m on -h %PLUTOIP%
if "%DATVOUT%"=="yes" echo Wait 10s for Longmynd to start...
if "%DATVOUT%"=="yes" timeout 10
if "%DATVOUT%"=="yes" %mosquitto% -t cmd/longmynd/frequency -m %LONGFREQUENCY% -h %PLUTOIP%
if "%DATVOUT%"=="yes" %mosquitto% -t cmd/longmynd/sr -m %RXSR% -h %PLUTOIP%
if "%DATVOUT%"=="yes" %mosquitto% -t cmd/longmynd/tsip -m %DATVOUTIP% -h %PLUTOIP%
if "%DATVOUT%"=="yes" echo RXL=1 > .\ini\rxonoff.ini

REM DATV Status and info
if "%DATVOUT%"=="yes" echo DATV-RX activated:
if "%DATVOUT%"=="yes" echo ######################################################################
if "%DATVOUT%"=="yes" echo TX-Frequency: %TXFREQUENCY%Mhz
if "%DATVOUT%"=="yes" echo RX-Frequency: %RXFREQUENCY%Mhz
if "%DATVOUT%"=="yes" echo Offset-Frequency: %RXOFFSET%Mhz
if "%DATVOUT%"=="yes" echo Longmynd-Frequency: %LONGFREQUENCY%Khz
if "%DATVOUT%"=="yes" echo Gain: %GAIN%
if "%DATVOUT%"=="yes" echo TX-SR: %SR%KS
if "%DATVOUT%"=="yes" echo RX-SR: %RXSR%KS
if "%DATVOUT%"=="yes" echo Mode: %MODE%
if "%DATVOUT%"=="yes" echo FEC: %FEC%
if "%DATVOUT%"=="yes" echo Mode type: %TXMODE%
if "%DATVOUT%"=="yes" echo Frame type: %FRAME%
if "%DATVOUT%"=="yes" echo Status Longmynd: on
if "%DATVOUT%"=="yes" echo Decoder: %RXPRG%
if "%DATVOUT%"=="yes" echo ######################################################################

REM Start Decoder
if "%DATVOUT%"=="yes" if "%RXPRG%"=="ffplay" start "FFPLAY" .\scripts\START-FFPLAY-LONGMYND.bat
if "%DATVOUT%"=="yes" if "%RXPRG%"=="mpv" start "MPV" .\scripts\START-MPV-LONGMYND.bat

REM Running RELAY-Mode till interaction
if "%RELAY%"=="on" (echo RELAY-Mode started, press enter to exit...)
if "%RELAY%"=="on" pause

REM Kill for RELAY-Mode
if "%RELAY%"=="on" %mosquitto% -t %CMD_ROOT%/system/longmynd -m off -h %PLUTOIP%
if "%RELAY%"=="on" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%RELAY%"=="on" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%RELAY%"=="on" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%RELAY%"=="on" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%RELAY%"=="on" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%RELAY%"=="on" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")
if "%RELAY%"=="on" echo RXL=0 > .\ini\rxonoff.ini
if "%RELAY%"=="on" exit



REM Running external streaming till interaction
if "%AUTO%"=="0" echo (Running, now stream the Pluto from OBS or something similar....press any key to exit...)
if "%AUTO%"=="0" pause

REM Kill for external streaming
if "%AUTO%"=="0" %mosquitto% -t %CMD_ROOT%/system/longmynd -m off -h %PLUTOIP%
if "%AUTO%"=="0" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%AUTO%"=="0" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%AUTO%"=="0" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%AUTO%"=="0" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%AUTO%"=="0" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%AUTO%"=="0" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")
if "%AUTO%"=="0" echo RXL=0 > .\ini\rxonoff.ini
if "%AUTO%"=="0" exit

:DECISIONCODEC
REM Decision Codec
if "%CODEC%"=="libvvenc" GoTo VVC
if "%CODEC%"=="libaom-av1" GoTo AV1

if "%CODEC%"=="h264_nvenc" GoTo HARDENC
if "%CODEC%"=="hevc_nvenc" GoTo HARDENC
if "%CODEC%"=="libx264" GoTo SOFTENC
if "%CODEC%"=="libx265" GoTo SOFTENC



:HARDENC

set /a BUFSIZE = %VBITRATE% * %BUFFACTOR%
REM Avoid negative timestamps and DTS error
if %SR% GTR 20 if %SR% LSS 36 SET MAXINTERLEAVE=0
if %SR% GTR 20 if %SR% LSS 36 SET MAXDELAY=2000

echo ------------------------------------------
echo Hardware FFMPEG Encoder H.264/H.265
echo TX-Frequency: %TXFREQUENCY%
echo Gain: %GAIN%
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo Codec: %CODEC%
echo Resolution: %IMAGESIZE%
echo FPS: %FPS%
echo TS-Bitrate: %TSBITRATE%K
echo Videobitrate: %VBITRATE%K
echo Audiobitrate: %ABITRATE%K
echo Buffersize: %BUFSIZE%K
echo Maxdelay: %MAXDELAY%ms
echo Maxinterleave: %MAXINTERLEAVE%s
echo ------------------------------------------

if "%INPUTTYPE%"=="NETWORK" GoTo HWENCNETWORK
if "%INPUTTYPE%"=="FILE" GoTo HWENCFILE

REM Nvidia-Driver bug: -bf 0 switches of check of B-Frames
REM Raus  -shortest -shortest_buf_duration 1 VVC -dts_delta_threshold 1 -dts_error_threshold 1

REM Hardware encoder via DSHOW
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b_ref_mode 0 -bf 0 -b:v %VBITRATE%K -r %FPS% -cbr true -g %KEYHARD% -rc-lookahead 10 -no-scenecut 1 -zerolatency 1 -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -bufsize %BUFSIZE%K -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

pause

REM Kill Control and MQTT Browser
if "%FW%"=="yes" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%FW%"=="yes" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")
exit


:HWENCNETWORK
REM Hardware encoder via NETWORK
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -i %STREAM% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b_ref_mode 0 -bf 0 -b:v %VBITRATE%K -r %FPS% -cbr true -g %KEYHARD% -rc-lookahead 10 -no-scenecut 1 -zerolatency 1 -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -bufsize %BUFSIZE%K -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

pause

REM Kill Control and MQTT Browser
if "%FW%"=="yes" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%FW%"=="yes" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")
exit


:HWENCFILE
REM Hardware encoder read file
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -re -stream_loop %STREAMLOOP% -i %STREAM% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b_ref_mode 0 -bf 0 -b:v %VBITRATE%K -r %FPS% -cbr true -g %KEYHARD% -rc-lookahead 10 -no-scenecut 1 -zerolatency 1 -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -bufsize %BUFSIZE%K -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

pause

REM Kill Control and MQTT Browser
if "%FW%"=="yes" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%FW%"=="yes" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")
exit



:SOFTENC

set /a BUFSIZE = %VBITRATE% * %BUFFACTOR%
REM Avoid negative timestamps and DTS error
if %SR% GTR 20 if %SR% LSS 36 SET MAXINTERLEAVE=0
if %SR% GTR 20 if %SR% LSS 36 SET MAXDELAY=2000

echo ------------------------------------------
echo Software FFMPEG Encoder H.264/H.265
echo TX-Frequency: %TXFREQUENCY%
echo Gain: %GAIN%
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo Codec: %CODEC%
echo Resolution: %IMAGESIZE%
echo FPS: %FPS%
echo TS-Bitrate: %TSBITRATE%K
echo Videobitrate: %VBITRATE%K
echo Audiobitrate: %ABITRATE%K
echo Buffersize: %BUFSIZE%K
echo Maxdelay: %MAXDELAY%ms
echo Maxinterleave: %MAXINTERLEAVE%s
echo ------------------------------------------

if "%INPUTTYPE%"=="NETWORK" GoTo SWENCNETWORK
if "%INPUTTYPE%"=="FILE" GoTo SWENCFILE

REM Software encoder via DSHOW
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b:v %VBITRATE%K -r %FPS% -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYSOFT% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

pause

REM Kill Control and MQTT Browser
if "%FW%"=="yes" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%FW%"=="yes" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")

exit


:SWENCNETWORK
REM Software encoder via network
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -i %STREAM% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b:v %VBITRATE%K -r %FPS% -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYSOFT% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

pause

REM Kill Control and MQTT Browser
if "%FW%"=="yes" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%FW%"=="yes" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")

exit


:SWENCFILE

REM set FC_CONFIG_DIR=.\ffmpeg\fonts
REM set FONTCONFIG_FILE=fonts.conf
REM set FONTCONFIG_PATH=.\ffmpeg\fonts
REM -vf subtitles=subtitle.srt

REM Software encoder read file
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -re -stream_loop %STREAMLOOP% -i %STREAM% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -b:v %VBITRATE%K -r %FPS% -minrate %VBITRATE%K -maxrate %VBITRATE%K -bufsize %BUFSIZE%K -g %KEYSOFT% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

pause

REM Kill Control and MQTT Browser
if "%FW%"=="yes" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%FW%"=="yes" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")

exit



:VVC

set /a VBITRATEVVC = %VBITRATE% * 100 / 100
set /a BUFSIZE = %VBITRATEVVC% * %BUFFACTOR%

REM Avoid negative timestamps and DTS error
if %SR% GTR 20 if %SR% LSS 36 SET MAXINTERLEAVE=0
if %SR% GTR 20 if %SR% LSS 36 SET MAXDELAY=2000
REM More stable
set /a MAXDELAY = %MAXDELAY% * 10

echo -----------------------------------
echo Warning! Experimental VVC Encoder
echo TX-Frequency: %TXFREQUENCY%
echo Gain: %GAIN%
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo Codec: %CODEC%
echo Resolution: %IMAGESIZE%
echo FPS: %FPS%
echo TS-Bitrate: %TSBITRATE%K
echo Videobitrate for VVC: %VBITRATEVVC%K
echo Audiobitrate for VVC: %ABITRATE%K
echo Buffersize for VVC: %BUFSIZE%K
echo Maxdelay for VVC: %MAXDELAY%ms
echo Maxinterleave for VVC: %MAXINTERLEAVE%s
echo -----------------------------------

if "%INPUTTYPE%"=="NETWORK" GoTo VVCENCNETWORK
if "%INPUTTYPE%"=="FILE" GoTo VVCENCFILE

REM VVC encoder via DSHOW
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -preset faster -r %FPS% -b:v %VBITRATEVVC%K -minrate %VBITRATEVVC%K -maxrate %VBITRATEVVC%K -bufsize %BUFSIZE%K -g %KEYVVC% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

pause

REM Kill Control and MQTT Browser
if "%FW%"=="yes" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%FW%"=="yes" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")

exit


:VVCENCNETWORK
REM VVC encoder via NETWORK
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -i %STREAM% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -preset faster -r %FPS% -b:v %VBITRATEVVC%K -minrate %VBITRATEVVC%K -maxrate %VBITRATEVVC%K -bufsize %BUFSIZE%K -g %KEYVVC% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

pause

REM Kill Control and MQTT Browser
if "%FW%"=="yes" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%FW%"=="yes" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")

exit


:VVCENCFILE
REM VVC encoder read file
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -re -stream_loop %STREAMLOOP% -i %STREAM% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -preset faster -r %FPS% -b:v %VBITRATEVVC%K -minrate %VBITRATEVVC%K -maxrate %VBITRATEVVC%K -bufsize %BUFSIZE%K -g %KEYVVC% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

pause

REM Kill Control and MQTT Browser
if "%FW%"=="yes" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%FW%"=="yes" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")

exit



:AV1

set /a VBITRATEAV1 = %VBITRATE% * 100 / 100
set /a BUFSIZE = %VBITRATEAV1% * %BUFFACTOR%

REM Avoid negative timestamps and DTS error
if %SR% GTR 20 if %SR% LSS 36 SET MAXINTERLEAVE=0
if %SR% GTR 20 if %SR% LSS 36 SET MAXDELAY=2000
REM Test
set /a MAXDELAY = %MAXDELAY% * 1

echo -----------------------------------
echo Warning! Experimental AV1 Encoder
echo TX-Frequency: %TXFREQUENCY%
echo Gain: %GAIN%
echo SR: %SR%KS
echo Mode: %MODE%
echo FEC: %FEC%
echo Codec: %CODEC%
echo Resolution: %IMAGESIZE%
echo FPS: %FPS%
echo TS-Bitrate: %TSBITRATE%K
echo Videobitrate for AV1: %VBITRATEAV1%K
echo Audiobitrate for AV1: %ABITRATE%K
echo Buffersize for AV1: %BUFSIZE%K
echo Maxdelay for AV1: %MAXDELAY%ms
echo Maxinterleave for AV1: %MAXINTERLEAVE%s
echo -----------------------------------

if "%INPUTTYPE%"=="NETWORK" GoTo AV1ENCNETWORK
if "%INPUTTYPE%"=="FILE" GoTo AV1ENCFILE

REM DVB-GSE container will be the best. Wait for implementation or modify source of ffmpeg to accept AV1 in mpegts
REM -preset 8 -crf 30 -g 300 -usage realtime HDR -colorspace bt2020nc -color_trc smpte2084 -color_primaries bt2020 Test -svtav1-params tune=0 -svtav1-params fast-decode=1

REM AV1 encoder via DSHOW
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i video=%VIDEODEVICE% -f dshow -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -i audio=%AUDIODEVICE% -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -crf %AV1QUAL% -usage realtime -b:v %VBITRATEAV1%K -minrate %VBITRATEAV1%K -maxrate %VBITRATEAV1%K -bufsize %BUFSIZE%K -g %KEYAV1% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

pause

REM Kill Control and MQTT Browser
if "%FW%"=="yes" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%FW%"=="yes" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")

exit


:AV1ENCNETWORK
REM AV1 encoder via NETWORK
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -i %STREAM% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -crf %AV1QUAL% -usage realtime -b:v %VBITRATEAV1%K -minrate %VBITRATEAV1%K -maxrate %VBITRATEAV1%K -bufsize %BUFSIZE%K -g %KEYAV1% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

pause

REM Kill Control and MQTT Browser
if "%FW%"=="yes" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%FW%"=="yes" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")

exit


:AV1ENCFILE
REM AV1 encoder read file
.\ffmpeg\ffmpeg -itsoffset %OFFSET% -re -stream_loop %STREAMLOOP% -i %STREAM% -thread_queue_size %THREADQUEUE%K -rtbufsize %RTBUF%M -ar %ABITRATE%K -vcodec %CODEC% -s %IMAGESIZE% -crf %AV1QUAL% -usage realtime -b:v %VBITRATEAV1%K -minrate %VBITRATEAV1%K -maxrate %VBITRATEAV1%K -bufsize %BUFSIZE%K -g %KEYAV1% -acodec %AUDIOCODEC% -ac %AUDIO% -b:a %ABITRATE%k -f mpegts -muxrate %TSBITRATE%K -streamid 0:%VIDEOPID% -streamid 1:%AUDIOPID% -max_delay %MAXDELAY%K -max_interleave_delta %MAXINTERLEAVE%M -pcr_period %PCRPERIOD% -pat_period %PATPERIOD% -mpegts_service_id %SERVICEID% -mpegts_original_network_id %NETWORKID% -mpegts_transport_stream_id %STREAMID% -mpegts_pmt_start_pid %PMTPID% -mpegts_start_pid %MPEGTSSTARTPID% -metadata service_provider=%SERVICEPROVIDER% -metadata service_name=%CALLSIGN% -af aresample=async=1 "udp://%PLUTOIP%:%PLUTOPORT%?pkt_size=1316&overrun_nonfatal=1&fifo_size=%FIFOBUF%M"

pause

REM Kill Control and MQTT Browser
if "%FW%"=="yes" if "%REBOOT%"=="yes" (%mosquitto% -t %CMD_ROOT%/system/reboot -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (%mosquitto% -t %CMD_ROOT%/tx/mute -m 1 -h %PLUTOIP%)
if "%FW%"=="yes" (taskkill /T /F /IM MQTT-Explorer-0.4.0-beta1.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq CONTROL*")
if "%FW%"=="yes" (taskkill /T /F /IM mpvnet-vvceasy.exe)
if "%FW%"=="yes" (taskkill /F /FI "WINDOWTITLE eq FFPLAY*")

exit
