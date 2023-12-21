@ECHO OFF
SET BASEDIR=%~dp0
SET pluto=%1
SET file=%2
IF [%1] == [] GOTO NoIp
IF [%2] == [] GOTO NoFile
cd %BASEDIR%
ECHO Copying firmware to pluto
scp -o UserKnownHostsFile=\\.\NUL ./pluto.frm root@%pluto%:/root
ECHO Updating firmware
ssh -o UserKnownHostsFile=\\.\NUL root@%pluto% ./update_frm_reboot.sh ./pluto.frm
ECHO Rebooting pluto
pause
exit
:NoIp
ECHO Please provide pluto network IP
pause
exit
:NoFile
ECHO Please provide path to firmware file
pause
exit