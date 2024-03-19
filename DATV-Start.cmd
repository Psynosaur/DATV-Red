@ECHO OFF
SET BASEDIR=%~dp0
cd %BASEDIR%
ECHO Starting DATV-Red...
start "Node Red" .\npm\node-red.cmd --settings .\.node-red\settings.js --userDir .\.node-red\

