@ECHO OFF
SET BASEDIR=%~dp0
SET pluto=%1
SET ts=%2
IF [%1] == [] GOTO NoIp
IF [%2] == [] GOTO NoTS
cd %BASEDIR%
ECHO Setting up NTP server on pluto
GOTO Gogo

:NoIp
@echo off
set /p "pluto=Please provide pluto address: "
:NoTS
@echo off
set /p "ts=Please enter time server address: "

:Gogo
SET entry="'1s/^/server %ts%\n/'"
ECHO ssh -o UserKnownHostsFile=\\.\NUL root@%pluto% /etc/init.d/S49ntp stop ; sed -i %entry% /etc/ntp.conf ; ntpd -gq ; /etc/init.d/S49ntp start ; cat /etc/ntp.conf ; sleep 2 ; ntpq -c lpeer
ssh -o UserKnownHostsFile=\\.\NUL root@%pluto% /etc/init.d/S49ntp stop ; sed -i %entry% /etc/ntp.conf ; cat /etc/ntp.conf ; ntpd -gq ; /etc/init.d/S49ntp start ; sleep 2 ; ntpq -c lpeer ; date
pause
exit