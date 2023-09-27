REM Script to start 1 receiver feeded by Longmynd on Pluto, by DL5OCD

@echo off

SET BASEDIR=%~dp0
cd %BASEDIR%

REM ############## Global configuration ###############

REM Read configuration from config-tx.ini

for /f "delims=" %%i in (..\config-tx.ini) do (
set %%i
 )

REM ###################################################
cls
color 4F

more ..\version.txt

REM #################### RX1 ############################
:1RX

more ..\ini\rx.ini

set /p choice=Please, choose your scaling for the video  (0,1,2,3,4,9) :

if /I "%choice%"=="0" (start "FFPLAY" ..\ffmpeg\ffplay udp://@%DATVOUTIP%:%DATVOUTPORT%)
if /I "%choice%"=="9" (start "FFPLAY" ..\ffmpeg\ffplay on1rc@66KS.png)

if /I "%choice%"=="1" (SET x=930)
if /I "%choice%"=="1" (SET y=522)

if /I "%choice%"=="2" (SET x=1280)
if /I "%choice%"=="2" (SET y=720)

if /I "%choice%"=="3" (SET x=1980)
if /I "%choice%"=="3" (SET y=1080)

if /I "%choice%"=="4" (SET x=2560)
if /I "%choice%"=="4" (SET y=1440)

start "FFPLAY" ..\ffmpeg\ffplay -x %x% -y %y% udp://@%DATVOUTIP%:%DATVOUTPORT%

exit

