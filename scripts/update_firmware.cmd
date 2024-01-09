@ECHO OFF
SET BASEDIR=%~dp0
SET pluto=%1
SET file=%2
IF [%1] == [] GOTO NoIp
IF [%2] == [] GOTO NoFile
cd %BASEDIR%
GOTO Gogo

:NoIp
@echo off
set /p "pluto=Please provide pluto address: "
:NoFile
@echo off
set /p "file=Please provide 'pluto.frm' path: "

:Gogo
scp -o UserKnownHostsFile=\\.\NUL %file% root@%pluto%:/root
ECHO Updating firmware
ssh -o UserKnownHostsFile=\\.\NUL root@%pluto% ./update_frm_reboot.sh ./pluto.frm
ECHO Rebooting pluto
pause
exit


