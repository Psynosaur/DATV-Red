# node-red-contrib-sum
A <a href="http://nodered.org/">Node-RED</a> node to calculate sum.

This node is based on <a href="https://github.com/eisbehr-/node-red-average/">Eisbehr's node-red-contrib-average</a>.

## Install

Use the "Manage palette" option inside Node-RED, or within your Node-RED user directory (typically `~/.node-red`), run the command:

`npm install node-red-contrib-sum`

## Usage

Calculate the sum of incoming `msg.payload` values from across a number of different `msg.topic`.

Incoming `msg.topic` has to be used to separate and identify values. Messages not containing a valid numeric value will be rejected.

Will return the current sum of all different `msg.topic` values as `msg.payload`. Every other datum will be pushed through.

The sum can be reset with an incoming message that contains `msg.reset`. Then all stored data will be removed and the initial sum starts at zero again.

## License

This project is licensed under the Apache 2.0 license.
