SET BASEDIR=%~dp0

%BASEDIR%..\ffmpeg\ffmpeg -list_devices true -f dshow -i dummy