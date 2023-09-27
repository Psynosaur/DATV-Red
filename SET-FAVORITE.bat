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
more .\ini\favorite-1.ini
echo ----------------------------
echo ----------------------------
echo Profile 2 parameters:
more .\ini\favorite-2.ini
echo ----------------------------
echo ----------------------------
echo Profile 3 parameters:
more .\ini\favorite-3.ini
echo ----------------------------
echo ----------------------------
echo Profile 4 parameters:
more .\ini\favorite-4.ini
echo ----------------------------
echo ----------------------------
echo Profile 5 parameters:
more .\ini\favorite-5.ini
echo ----------------------------

:START
set /p CHANGE=Do you want to edit a normal or GSE profile? Normal (1), GSE (2) :
REM Set Change

:PROFILE
set /p PROFILECHOICE=Which profile do you want to change: Profile 1 (1), profile 2 (2), profile 3 (3), profile 4 (4) or profile 5 (5) :
if /I "%PROFILECHOICE%"=="1" (SET PROFILECOUNT=1)
if /I "%PROFILECHOICE%"=="2" (SET PROFILECOUNT=2)
if /I "%PROFILECHOICE%"=="3" (SET PROFILECOUNT=3)
if /I "%PROFILECHOICE%"=="4" (SET PROFILECOUNT=4)
if /I "%PROFILECHOICE%"=="5" (SET PROFILECOUNT=5)

if "%CHANGE%"=="2" GoTo MODE

:CODEC
if "%ENCTYPE%"=="soft" GoTo CODECSOFT 
if "%ENCTYPE%"=="nvidia" GoTo CODECHARD

:CODECHARD
set /p CODECCHOICE=Please, choose your Codec (HW-ENC): H264 (1), H265 (2), VVC (H266) (3) :
if /I "%CODECCHOICE%"=="1" (SET CODEC=h264_nvenc)
if /I "%CODECCHOICE%"=="2" (SET CODEC=hevc_nvenc)
if /I "%CODECCHOICE%"=="3" (SET CODEC=libvvenc)
if /I "%CODECCHOICE%"=="4" (SET CODEC=libaom-av1)

GoTo FPS

:CODECSOFT
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

set /p AUDIOCHOICE=Please, choose Mono (1), or Stereo (2) :
if /I "%AUDIOCHOICE%"=="1" (SET AUDIO=1)
if /I "%AUDIOCHOICE%"=="2" (SET AUDIO=2)

:MODE
set /p MODECHOICE=Please, choose your TX-Mode : QPSK (1), 8PSK (2), 16APSK (3) :
if /I "%MODECHOICE%"=="1" (SET MODE=qpsk)
if /I "%MODECHOICE%"=="2" (SET MODE=8psk)
if /I "%MODECHOICE%"=="3" (SET MODE=16apsk)

if "%CHANGE%"=="2" GoTo FREQUENCYTX

set /p IMAGECHOICE=Please, choose your Image size : 640x360 (1), 960x540 (2), 1280x720 (3), 1920x1080 (4), 2560x1440 (5) :
if /I "%IMAGECHOICE%"=="1" (SET IMAGESIZE=640x360)
if /I "%IMAGECHOICE%"=="2" (SET IMAGESIZE=960x540)
if /I "%IMAGECHOICE%"=="3" (SET IMAGESIZE=1280x720)
if /I "%IMAGECHOICE%"=="4" (SET IMAGESIZE=1920x1080)
if /I "%IMAGECHOICE%"=="5" (SET IMAGESIZE=2560x1440)

set /p ABITCHOICE=Please, choose your Audiobitrate 8k (1), 16k (2), 32k (3), 48k (4), 64 (5), 96k (6) :
if /I "%ABITCHOICE%"=="1" (SET ABITRATE=8)
if /I "%ABITCHOICE%"=="2" (SET ABITRATE=16)
if /I "%ABITCHOICE%"=="3" (SET ABITRATE=32)
if /I "%ABITCHOICE%"=="4" (SET ABITRATE=48)
if /I "%ABITCHOICE%"=="5" (SET ABITRATE=64)
if /I "%ABITCHOICE%"=="6" (SET ABITRATE=96)

REM Decision for F5OEO Firmware
if "%FW%"=="no" GoTo MODES

:FREQUENCYTX
type .\ini\frequency.ini
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

:FREQUENCYRX
more .\ini\frequency.ini
set /p RXFREQCHOICE=Please, choose your RX-Frequency 0-28 :

if /I "%RXFREQCHOICE%"=="0" if "%DATVOUT%"=="yes" set /p RXFREQUENCY=Please, choose your RX-Frequency, input in kHz :
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
type .\ini\qpsk.ini
set /p SRCHOICE=Please, choose your TX-SR 0-9 :

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

type .\ini\qpsk-fec.ini
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
if "%FW%"=="yes" more .\ini\longmynd-sr.ini
if "%FW%"=="yes" set /p SRCHOICE=Please, choose your RX-SR 0-9 :

if "%FW%"=="yes" if /I "%SRCHOICE%"=="0" set /p RXSR=Please, choose your RX-SR (25-4000) :
if "%FW%"=="yes" if /I "%SRCHOICE%"=="1" (SET RXSR=35)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="2" (SET RXSR=66)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="3" (SET RXSR=125)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="4" (SET RXSR=250)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="5" (SET RXSR=333)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="6" (SET RXSR=500)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="7" (SET RXSR=1000)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="8" (SET RXSR=1500)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="9" (SET RXSR=2000)

if "%CHANGE%"=="2" GoTo GSE

REM Calculation QPSK
if "%DVBMODE%"=="DVB-S2" set /a TSBITRATE = 2 * %SR% * 188 / 204 * %FEC% * 1075 / 1000
if "%DVBMODE%"=="DVB-S" set /a TSBITRATE = 2 * %SR% * 188 / 204 * %FEC%

GoTo FREESR

:8PSK
type .\ini\8psk.ini
set /p SRCHOICE=Please, choose your SR 0-9 :

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


type .\ini\8psk-fec.ini
set /p FECCHOICE=Please, choose your TX-FEC 1-6 :

if /I "%FECCHOICE%"=="1" (SET FEC=3/5)
if /I "%FECCHOICE%"=="2" (SET FEC=2/3)
if /I "%FECCHOICE%"=="3" (SET FEC=3/4)
if /I "%FECCHOICE%"=="4" (SET FEC=5/6)
if /I "%FECCHOICE%"=="5" (SET FEC=8/9)
if /I "%FECCHOICE%"=="6" (SET FEC=9/10)

:8PSKRX
if "%FW%"=="yes" more .\ini\longmynd-sr.ini
if "%FW%"=="yes" set /p SRCHOICE=Please, choose your RX-SR 0-9 :

if "%FW%"=="yes" if /I "%SRCHOICE%"=="0" set /p RXSR=Please, choose your RX-SR (25-4000) :
if "%FW%"=="yes" if /I "%SRCHOICE%"=="1" (SET RXSR=35)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="2" (SET RXSR=66)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="3" (SET RXSR=125)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="4" (SET RXSR=250)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="5" (SET RXSR=333)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="6" (SET RXSR=500)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="7" (SET RXSR=1000)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="8" (SET RXSR=1500)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="9" (SET RXSR=2000)

if "%CHANGE%"=="2" GoTo GSE

REM Calculation 8PSK
if "%DVBMODE%"=="DVB-S2" set /a TSBITRATE = 3 * %SR% * 188 / 204 * %FEC% * 1075 / 1000
if "%DVBMODE%"=="DVB-S" set /a TSBITRATE = 3 * %SR% * 188 / 204 * %FEC%

GoTo FREESR

:16APSK
type .\ini\16apsk.ini
set /p SRCHOICE=Please, choose your SR 0-9 :

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


type .\ini\16apsk-fec.ini
set /p FECCHOICE=Please, choose your TX-FEC 1-5 :

if /I "%FECCHOICE%"=="1" (SET FEC=2/3)
if /I "%FECCHOICE%"=="2" (SET FEC=3/4)
if /I "%FECCHOICE%"=="3" (SET FEC=5/6)
if /I "%FECCHOICE%"=="4" (SET FEC=8/9)
if /I "%FECCHOICE%"=="5" (SET FEC=9/10)

:16APSKRX
if "%FW%"=="yes" more .\ini\longmynd-sr.ini
if "%FW%"=="yes" set /p SRCHOICE=Please, choose your RX-SR 0-9 :

if "%FW%"=="yes" if /I "%SRCHOICE%"=="0" set /p RXSR=Please, choose your RX-SR (25-4000) :
if "%FW%"=="yes" if /I "%SRCHOICE%"=="1" (SET RXSR=35)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="2" (SET RXSR=66)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="3" (SET RXSR=125)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="4" (SET RXSR=250)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="5" (SET RXSR=333)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="6" (SET RXSR=500)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="7" (SET RXSR=1000)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="8" (SET RXSR=1500)
if "%FW%"=="yes" if /I "%SRCHOICE%"=="9" (SET RXSR=2000)

if "%CHANGE%"=="2" GoTo GSE

REM Calculation 16APSK
if "%DVBMODE%"=="DVB-S2" set /a TSBITRATE = 4 * %SR% * 188 / 204 * %FEC% * 1075 / 1000
if "%DVBMODE%"=="DVB-S" set /a TSBITRATE = 4 * %SR% * 188 / 204 * %FEC%

GoTo FREESR


REM Videobitrate calculation
:FREESR
REM Up to 35K
if %SR% GTR 20 if %SR% LSS 36 set /a VBITRATE = (1000 * %TSBITRATE% * 50 / 100 / 1000) - %ABITRATE%
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
if %SR% GTR 1500 if %SR% LSS 3001 set /a VBITRATE = (1000 * %TSBITRATE% * 87 / 100 / 1000) - %ABITRATE%
REM Above 3000K leads to invalid parameter check
if %SR% GTR 3000 set /a VBITRATE = (1000 * %TSBITRATE% * 88 / 100 / 1000) - %ABITRATE%

REM Decision for adjustment
if "%MODE%"=="QPSK" GoTo ADJUSTQPSK
if "%MODE%"=="8PSK" GoTo ADJUST8PSK
if "%MODE%"=="16APSK" GoTo ADJUST16APSK


:ADJUSTQPSK
REM Adjusting for low/high FEC
if "%FEC%"=="1/4" (SET /a VBITRATE=%VBITRATE% * 92 / 100)
if "%FEC%"=="1/3" (SET /a VBITRATE=%VBITRATE% * 94 / 100)
if "%FEC%"=="2/5" (SET /a VBITRATE=%VBITRATE% * 96 / 100)
if "%FEC%"=="1/2" (SET /a VBITRATE=%VBITRATE% * 98 / 100)
if "%FEC%"=="3/5" (SET /a VBITRATE=%VBITRATE% * 99 / 100)
if "%FEC%"=="2/3" (SET /a VBITRATE=%VBITRATE% * 100 / 100)
if "%FEC%"=="3/4" (SET /a VBITRATE=%VBITRATE% * 101 / 100)
if "%FEC%"=="4/5" (SET /a VBITRATE=%VBITRATE% * 101 / 100)
if "%FEC%"=="5/6" (SET /a VBITRATE=%VBITRATE% * 102 / 100)
if "%FEC%"=="8/9" (SET /a VBITRATE=%VBITRATE% * 104 / 100)
if "%FEC%"=="9/10" (SET /a VBITRATE=%VBITRATE% * 105 / 100)

REM Adjust low VBITRATE
if %VBITRATE% GTR 150 if %VBITRATE% LSS 200 set /a VBITRATE = (%VBITRATE% * 92 / 100)
if %VBITRATE% GTR 80 if %VBITRATE% LSS 151 set /a VBITRATE = (%VBITRATE% * 90 / 100)
if %VBITRATE% GTR 20 if %VBITRATE% LSS 81 set /a VBITRATE = (%VBITRATE% * 68 / 100)
GoTo PRINT

:ADJUST8PSK
REM Adjusting for low/high FEC
if "%FEC%"=="3/5" (SET /a VBITRATE=%VBITRATE% * 102 / 100)
if "%FEC%"=="2/3" (SET /a VBITRATE=%VBITRATE% * 104 / 100)
if "%FEC%"=="3/4" (SET /a VBITRATE=%VBITRATE% * 104 / 100)
if "%FEC%"=="5/6" (SET /a VBITRATE=%VBITRATE% * 105 / 100)
if "%FEC%"=="8/9" (SET /a VBITRATE=%VBITRATE% * 106 / 100)
if "%FEC%"=="9/10" (SET /a VBITRATE=%VBITRATE% * 106 / 100)
GoTo PRINT

:ADJUST16APSK
REM Adjusting for low/high FEC
if "%FEC%"=="2/3" (SET /a VBITRATE=%VBITRATE% * 106 / 100)
if "%FEC%"=="3/4" (SET /a VBITRATE=%VBITRATE% * 107 / 100)
if "%FEC%"=="5/6" (SET /a VBITRATE=%VBITRATE% * 108 / 100)
if "%FEC%"=="8/9" (SET /a VBITRATE=%VBITRATE% * 108 / 100)
if "%FEC%"=="9/10" (SET /a VBITRATE=%VBITRATE% * 109 / 100)
GoTo PRINT

:PRINT
echo -----------------------------------
echo Setting favorite parameters....
echo -----------------------------------

REM Check parameters
if %SR% GTR 4000 (echo Invalid SR ^>4000KS)&(GoTo CODEC)
if %VBITRATE% LSS 20 (echo Invalid parameters, Video-Bitrate below 20K)&(GoTo CODEC)
if %VBITRATE% LSS 50 if %FPS% GTR 30 (echo Invalid parameters, FPS too high)&(GoTo CODEC)

REM Write to favorite-x.ini
echo SR=%SR% > .\ini\favorite-%PROFILECOUNT%.ini
echo MODE=%MODE% >> .\ini\favorite-%PROFILECOUNT%.ini
echo FEC=%FEC% >> .\ini\favorite-%PROFILECOUNT%.ini
echo IMAGESIZE=%IMAGESIZE% >> .\ini\favorite-%PROFILECOUNT%.ini
echo FPS=%FPS% >> .\ini\favorite-%PROFILECOUNT%.ini
echo AUDIO=%AUDIO% >> .\ini\favorite-%PROFILECOUNT%.ini
echo CODEC=%CODEC% >> .\ini\favorite-%PROFILECOUNT%.ini
echo TSBITRATE=%TSBITRATE% >> .\ini\favorite-%PROFILECOUNT%.ini
echo VBITRATE=%VBITRATE% >> .\ini\favorite-%PROFILECOUNT%.ini
echo ABITRATE=%ABITRATE% >> .\ini\favorite-%PROFILECOUNT%.ini

echo TXFREQUENCY=%TXFREQUENCY% >> .\ini\favorite-%PROFILECOUNT%.ini
echo RXFREQUENCY=%RXFREQUENCY% >> .\ini\favorite-%PROFILECOUNT%.ini
echo RXSR=%RXSR% >> .\ini\favorite-%PROFILECOUNT%.ini
echo GAIN=%GAIN% >> .\ini\favorite-%PROFILECOUNT%.ini



:GSE
REM Write to favorite-x.ini
if "%CHANGE%"=="2" echo -----------------------------------
if "%CHANGE%"=="2" echo Setting favorite parameters....
if "%CHANGE%"=="2" echo -----------------------------------

if "%CHANGE%"=="2" echo GSE=1 > .\ini\favorite-%PROFILECOUNT%.ini
if "%CHANGE%"=="2" echo TXFREQUENCY=%TXFREQUENCY% >> .\ini\favorite-%PROFILECOUNT%.ini
if "%CHANGE%"=="2" echo RXFREQUENCY=%RXFREQUENCY% >> .\ini\favorite-%PROFILECOUNT%.ini
if "%CHANGE%"=="2" echo GAIN=%GAIN% >> .\ini\favorite-%PROFILECOUNT%.ini
if "%CHANGE%"=="2" echo SR=%SR% >> .\ini\favorite-%PROFILECOUNT%.ini
if "%CHANGE%"=="2" echo RXSR=%RXSR% >> .\ini\favorite-%PROFILECOUNT%.ini
if "%CHANGE%"=="2" echo MODE=%MODE% >> .\ini\favorite-%PROFILECOUNT%.ini
if "%CHANGE%"=="2" echo FEC=%FEC% >> .\ini\favorite-%PROFILECOUNT%.ini



echo --------------------------------------
echo Profile %PROFILECOUNT% parameters are set
echo --------------------------------------

set /p CHANGEMORE=Do you want to change another profile? YES (1), NO (2) :
if /I "%CHANGEMORE%"=="1" GoTo START

pause
exit

