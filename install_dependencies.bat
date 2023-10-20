SET BASEDIR=%~dp0
cd /D %UserProfile%
cd .node-red
copy %BASEDIR%package.json package.json
npm i