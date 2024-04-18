#!/usr/bin/bash

CWD=${pwd}
cd "$CWD"

echo "Starting DATV-Red..."

node ./npm/node_modules/node-red/red.js --settings ./.node-red/settings.js --userDir ./.node-red/
exit
