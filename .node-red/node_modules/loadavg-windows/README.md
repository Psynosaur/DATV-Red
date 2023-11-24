<!--
  Title: Loadavg-windows
  Description: Node.js module that enables os.loadavg() on Windows OS
  Author: fider
  -->

# About
Use `require('loadavg-windows')` to enjoy `os.loadavg()` on Windows OS  (or force using custom implementation on any other OS).

# Motivation

Currently Node.js on Windows platform do not implements `os.loadavg()` functionality - it returns `[0,0,0]`

# Important details
- os.loadavg\(\) returns [**A**, **B**, **C**]
  - A - expect value different than 0 **after few seconds**.
  - B - expect value different than 0 after first **5 minutes**.
  - C - expect value different than 0 after first **15 minutes**.
- **Requiring it on other operating systems have NO influence,**
  unless `require('loadavg-windows').enableCustomLoadavg()` called manually.

# Usage
Just one line required to enjoy `os.loadavg()` on Windows OS:
```js
require('loadavg-windows');

setInterval( () => {
  console.log( os.loadavg() );
}, 3000);
```

Can be activated on any other OS in case native version not working
(on Windows OS it is enabled by default)
```js
const { useCustomLoadavg } = require('loadavg-windows');
useCustomLoadavg();
```

# Installation
Requires [Node.js](https://nodejs.org/) v4.8.7

`npm install loadavg-windows`

# Not important details:

This is pure JavaScript, platform-independent implementation of `os.loadavg()` that can be used on Windows system
(or any other system that for some reasons do not supports loadavg)

It uses only `os.cpus()` for proper calculations.
