SET BASEDIR=%~dp0
cd %BASEDIR%
..\custom\ffmpeg -stream_loop 3 -i ..\ffmpeg\in.mp4 -c:v libx265 -an ..\ffmpeg\out.mp4
pause