#!/usr/bin/bash

CWD=${pwd}
cd "$CWD"

echo "Starting DATV-Red..."

./npm/node ./npm/node_modules/node-red/red.js --userDir ./.node-red/
exit
