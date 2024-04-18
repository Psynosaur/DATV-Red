@ECHO off
SETLOCAL
CALL :find_dp0
start "Node Red" %dp0%npm\node-red.cmd --userDir .\.node-red\
:find_dp0
SET dp0=%~dp0
EXIT /b