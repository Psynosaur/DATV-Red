@ECHO OFF
SET BASEDIR=%~dp0
cd %BASEDIR%
ECHO Starting DATV-Red...
start "Node Red" .\npm\node-red.cmd --settings .\.node-red\settings.js --userDir .\.node-red\
TIMEOUT /T 5 /NOBREAK
start "" "http://127.0.0.1:1880/ui/"
