REM Script to start MPV for Longmynd on Pluto, by DL5OCD

@echo off

SET BASEDIR=%~dp0
cd %BASEDIR%

REM ############## Global configuration ###############

REM Read configuration from config-tx.ini

for /f "delims=" %%i in (..\config-tx.ini) do (
set %%i
 )

REM ###################################################

start "MPV" ..\MPV\mpvnet-vvceasy.exe udp://@%DATVOUTIP%:%DATVOUTPORT%

exit

