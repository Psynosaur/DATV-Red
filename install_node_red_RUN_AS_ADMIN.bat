SET BASEDIR=%~dp0
powershell -Command "(New-Object Net.WebClient).DownloadFile('https://nodejs.org/dist/v18.18.2/node-v18.18.2-x64.msi', 'node-v18.18.2-x64.msi')"
powershell -Command "Invoke-WebRequest https://nodejs.org/dist/v18.18.2/node-v18.18.2-x64.msi -OutFile %BASEDIR%node-v18.18.2-x64.msi"
%BASEDIR%node-v18.18.2-x64.msi
npm install -g --unsafe-perm node-red
del %BASEDIR%node-v18.18.2-x64.msi