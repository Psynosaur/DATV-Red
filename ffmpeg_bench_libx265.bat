SET BASEDIR=%~dp0
cd %BASEDIR%
.\ffmpeg\ffmpeg -stream_loop 3 -i .\ffmpeg\in.mp4 -c:v libx265 -an .\ffmpeg\out.mp4
pause