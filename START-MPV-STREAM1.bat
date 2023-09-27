REM Script to start MPV, by DL5OCD

@echo off

REM ############## Global configuration ###############

REM Read configuration from config-rx.ini

for /f "delims=" %%i in (.\config-rx.ini) do (
set %%i
 )

REM ###################################################

start .\MPV\mpvnet-vvceasy.exe udp://@%IP1%:%PORT1%

exit

