@ECHO OFF
SET BASEDIR=%~dp0
SET pluto=%1
IF [%1] == [] GOTO Done
cd %BASEDIR%
ECHO Copying firmware to pluto
scp ./pluto.frm root@%pluto%:/root
ECHO Updating firmware
ssh -o UserKnownHostsFile=\\.\NUL root@%pluto% ./update_frm_reboot.sh ./pluto.frm
ECHO Rebooting pluto
pause
:Done
ECHO Please provide pluto network IP
pause