@echo off
setlocal enabledelayedexpansion
SET ADDR=%1
SET TITLE=%2
SET BASEDIR=%~dp0
start %BASEDIR%..\ffmpeg\ffplay udp://@%ADDR% -window_title %TITLE% -volume 15 -seek_interval 3 -x 1280 -y 720 -hide_banner 
@REM -alwaysontop