@echo off
setlocal enabledelayedexpansion
SET ADDR=%1
SET TITLE=%2
SET WIDTH=%3
SET HEIGHT=%4
SET VOLUME=%5
SET TOP=%6
SET LEFT=%7
SET ONTOP=%8
SET BASEDIR=%~dp0
start %BASEDIR%..\ffmpeg\ffplay udp://@%ADDR% -window_title %TITLE% -volume %VOLUME% -seek_interval 3 -x %WIDTH% -y %HEIGHT% -hide_banner -top %TOP% -left %LEFT% %ONTOP%
@REM -alwaysontop