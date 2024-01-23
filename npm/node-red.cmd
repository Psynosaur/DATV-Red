@ECHO off
SETLOCAL
CALL :find_dp0

IF EXIST "%dp0%nodes.exe" (
  SET "_prog=%dp0%nodes.exe"
) ELSE (
  SET "_prog=nodes"
  SET PATHEXT=%PATHEXT:;.JS;=;%
)

"%_prog%"  "%dp0%\node_modules\node-red\red.js" %*
ENDLOCAL
EXIT /b %errorlevel%
:find_dp0
SET dp0=%~dp0
EXIT /b
