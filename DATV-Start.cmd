@ECHO OFF
SET BASEDIR=%~dp0
cd %BASEDIR%
ECHO Please wait, programs starting...

start "Node Red" .\DATV-Simple-NR.exe
TIMEOUT /T 4 /NOBREAK
start "" "http://127.0.0.1:1880/ui/"
REM start "" "https://eshail.batc.org.uk/wb/"
ECHO All programs started!
