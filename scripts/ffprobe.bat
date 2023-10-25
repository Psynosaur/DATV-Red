@echo off
setlocal enabledelayedexpansion
SET ADDR=%1
SET BASEDIR=%~dp0

%BASEDIR%..\ffmpeg\ffprobe -hide_banner "udp://@%ADDR%?timeout=1000" -loglevel quiet -print_format json -show_programs 