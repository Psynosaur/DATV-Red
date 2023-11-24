# node-red-contrib-os

[![NPM](https://nodei.co/npm/node-red-contrib-os.png)](https://nodei.co/npm/node-red-contrib-os/)

[Node-Red][1] nodes for obtaining cpu system information.  

These nodes utilize the [Node.js OS Library][2] to obtain basic operating-system related utility functions.

## Install

Run the following command in the root directory of your Node-RED install

    npm install node-red-contrib-os

## Nodes

### OS

Use this node to query the operating system.

Returns the hostname of the operating system.

Returns the operating system name. For example 'Linux' on Linux, 'Darwin' on OS X and 'Windows_NT' on Windows.

Returns the operating system platform. Possible values are 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'.

Returns the operating system CPU architecture. Possible values are 'x64', 'arm' and 'ia32'.

Returns the operating system release.

Returns the endianness of the CPU. Possible values are 'BE' for big endian or 'LE' for little endian.

Returns the operating system's default directory for temp files.

### Drives

Use this node to query the hard drives.

Values for size, used and available are expressed in KiB (1024 bytes).

Value for capacity is a number between 0 and 1. Capacity*100 is also known as percentage used.

### Uptime

Use this node to return the system uptime in seconds.

### CPUs

Returns an array of objects containing information about each CPU/core installed: model, speed (in MHz), and times (an object containing the number of milliseconds the CPU/core spent in: user, nice, sys, idle, and irq).

### Loadavg

Returns an array containing the 1, 5, and 15 minute load averages.

The load average is a measure of system activity, calculated by the operating system and expressed as a fractional number. As a rule of thumb, the load average should ideally be less than the number of logical CPUs in the system.

The load average is a very UNIX-y concept; there is no real equivalent on Windows platforms. That is why on Windows, loadavg-windows is used to have an approximation of the average load.

### Memory

Use this node to query the system''s memory.

Returns the total amount of system memory in bytes, kilobytes, megabytes or gigabytes.

Returns the amount of free system memory in bytes, kilobytes, megabytes or gigabytes.

Returns the memory in use as a percentage.

### NetworkIntf

Use this node to get a list of network interfaces on the system.

Note that due to the underlying implementation this will only return network interfaces that have been assigned an address.

## Author

[Jason D. Harper][3]

[1]:http://nodered.org  
[2]:https://nodejs.org/api/os.html  
[3]:https://github.com/jayharper
