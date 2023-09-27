REM Script to start up to 3 receivers, by DL5OCD

@echo off

REM ############## Global configuration ###############

REM Read configuration from config-rx.ini

for /f "delims=" %%i in (.\config-rx.ini) do (
set %%i
 )

REM ###################################################
cls
color 4F

more .\version.txt

set /p dual=Do you want to decode 1, 2 or 3 streams (press 1, 2 or 3):

if /I "%dual%"=="1" GoTo 1RX
if /I "%dual%"=="2" GoTo 2RX
if /I "%dual%"=="3" GoTo 3RX

REM #################### RX1 ############################
:1RX

more .\ini\rx.ini

set /p choice=Please, choose your scaling for the video  (0,1,2,3,4,9) :

REM if /I "%choice%"=="0" (start .\ffmpeg\ffplay -fflags nobuffer udp://@%IP1%:%PORT1%)
REM if /I "%choice%"=="0" (start .\ffmpeg\ffplay -bufsize 20 udp://@%IP1%:%PORT1%)
if /I "%choice%"=="0" (start .\ffmpeg\ffplay udp://@%IP1%:%PORT1%)
if /I "%choice%"=="9" (.\ffmpeg\ffplay on1rc@66KS.png)

if /I "%choice%"=="1" (SET x=930)
if /I "%choice%"=="1" (SET y=522)

if /I "%choice%"=="2" (SET x=1280)
if /I "%choice%"=="2" (SET y=720)

if /I "%choice%"=="3" (SET x=1980)
if /I "%choice%"=="3" (SET y=1080)

if /I "%choice%"=="4" (SET x=2560)
if /I "%choice%"=="4" (SET y=1440)

start .\ffmpeg\ffplay -x %x% -y %y% udp://@%IP1%:%PORT1%

exit

REM #################### RX1+2 ##########################
:2RX

more .\ini\rx.ini

set /p choice=Please, choose your scaling for the video  (0,1,2,3,4,9) :

if /I "%choice%"=="0" (start .\ffmpeg\ffplay udp://@%IP1%:%PORT1%)
if /I "%choice%"=="0" (start .\ffmpeg\ffplay udp://@%IP2%:%PORT2%)
if /I "%choice%"=="9" (.\ffmpeg\ffplay on1rc@66KS.png)

if /I "%choice%"=="1" (SET x=930)
if /I "%choice%"=="1" (SET y=522)

if /I "%choice%"=="2" (SET x=1280)
if /I "%choice%"=="2" (SET y=720)

if /I "%choice%"=="3" (SET x=1980)
if /I "%choice%"=="3" (SET y=1080)

if /I "%choice%"=="4" (SET x=2560)
if /I "%choice%"=="4" (SET y=1440)

start .\ffmpeg\ffplay -x %x% -y %y% udp://@%IP1%:%PORT1%
start .\ffmpeg\ffplay -x %x% -y %y% udp://@%IP2%:%PORT2%

exit

REM #################### RX1+2+3 ########################
:3RX

more .\ini\rx.ini

set /p choice=Please, choose your scaling for the video  (0,1,2,3,4,9) :

if /I "%choice%"=="0" (start .\ffmpeg\ffplay udp://@%IP1%:%PORT1%)
if /I "%choice%"=="0" (start .\ffmpeg\ffplay udp://@%IP2%:%PORT2%)
if /I "%choice%"=="0" (start .\ffmpeg\ffplay udp://@%IP3%:%PORT3%)
if /I "%choice%"=="9" (.\ffmpeg\ffplay on1rc@66KS.png)

if /I "%choice%"=="1" (SET x=930)
if /I "%choice%"=="1" (SET y=522)

if /I "%choice%"=="2" (SET x=1280)
if /I "%choice%"=="2" (SET y=720)

if /I "%choice%"=="3" (SET x=1980)
if /I "%choice%"=="3" (SET y=1080)

if /I "%choice%"=="4" (SET x=2560)
if /I "%choice%"=="4" (SET y=1440)

start .\ffmpeg\ffplay -x %x% -y %y% udp://@%IP1%:%PORT1%
start .\ffmpeg\ffplay -x %x% -y %y% udp://@%IP2%:%PORT2%
start .\ffmpeg\ffplay -x %x% -y %y% udp://@%IP3%:%PORT3%

exit
