#!/usr/bin/bash

# DATV-Red start script by DL5OCD

BASEDIR=$(pwd)
cd $BASEDIR

echo "Starting DATV-Red..."

node ./npm/node_modules/node-red/red.js --settings ./.node-red/settings.js --userDir ./.node-red/
exit
