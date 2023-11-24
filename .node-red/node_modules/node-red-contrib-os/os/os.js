/**
 * Copyright 2016 Argonne National Laboratory.
 *
 * Licensed under the BSD 3-Clause License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    const settings = RED.settings;
    require("loadavg-windows");
    const os = require("os");
    const nodeDiskInfo = require("node-disk-info");

    function OS(config) {
        RED.nodes.createNode(this,config);
        const node = this;
        this.name = config.name;

        node.on("input", function(msg) {
            msg.payload = {
                hostname: os.hostname(),
                type: os.type(),
                platform: os.platform(),
                arch: os.arch(),
                release: os.release(),
                endianness: os.endianness(),
                tmpdir: os.tmpdir()
            };
            node.send(msg);
        });

    }

    RED.nodes.registerType("OS",OS);

    function Drives(config) {
        RED.nodes.createNode(this,config);
        const node = this;
        this.name = config.name;

        node.on("input", function(msg) {
            try {
                const disks = nodeDiskInfo.getDiskInfoSync();
                const payload = [];
                disks.forEach((disk) => {
                    payload.push({
                        "filesystem": disk.filesystem,
                        "size": disk.blocks,
                        "used": disk.used,
                        "available": disk.available,
                        "capacity": parseFloat(disk.capacity.replace("%", "")) / 100,
                        "mount": disk.mounted
                    });
                });
                /** old node-df output:
                 * "filesystem": "/dev/disk0s2",
                 * "size": 487546976,
                 * "used": 164493356,
                 * "available": 322797620,
                 * "capacity": 0.34,
                 * "mount": "/" 
                 * */
                /** new node-disk-info output:
                 * Filesystem: "Local Fixed Disk"
                 * Blocks: 499344470016
                 * Used: 166232281088
                 * Available: 333112188928
                 * Capacity: "33%"
                 * Mounted: "C:"
                 * */
                msg.payload = payload;
                node.send(msg);
            } catch (error) {
                node.error(error);
            }
        });

    }

    RED.nodes.registerType("Drives",Drives);

    function Uptime(config) {
        RED.nodes.createNode(this,config);
        const node = this;
        this.name = config.name;

        node.on("input", function(msg) {
            msg.payload = {uptime: os.uptime()};
            node.send(msg);
        });
    }

    RED.nodes.registerType("Uptime",Uptime);

    function CPUs(config) {
        RED.nodes.createNode(this,config);
        const node = this;
        this.name = config.name;

        node.on("input", function(msg) {
            msg.payload = {cpus: os.cpus()};
            node.send(msg);
        });
    }

    RED.nodes.registerType("CPUs",CPUs);

    function Loadavg(config) {
        RED.nodes.createNode(this,config);
        const node = this;
        this.name = config.name;
        node.on("input", function(msg) {
            msg.payload = {loadavg: os.loadavg()};
            node.send(msg);
        });
    }

    RED.nodes.registerType("Loadavg",Loadavg);

    function Memory(config) {
        RED.nodes.createNode(this,config);
        const node = this;
        this.name = config.name;
        const scale = config.scale;

        node.on("input", function(msg) {
            let tmem = os.totalmem();
            let fmem = os.freemem();
            const pmem = parseFloat((100 - (fmem / tmem) * 100).toFixed(2));
            switch(scale) {
                case "Byte":
                    break;
                case "Kilobyte":
                    tmem = parseFloat((tmem / 1024).toFixed(3));
                    fmem = parseFloat((fmem / 1024).toFixed(3));
                    break;
                case "Megabyte":
                    tmem = parseFloat((tmem / (1024 * 1024)).toFixed(3));
                    fmem = parseFloat((fmem / (1024 * 1024)).toFixed(3));
                    break;
                case "Gigabyte":
                    tmem = parseFloat((tmem / (1024 * 1024 * 1024)).toFixed(3));
                    fmem = parseFloat((fmem / (1024 * 1024 * 1024)).toFixed(3));
                    break;
                default:
                    break;
            }
            msg.payload = {
                totalmem: tmem, 
                freemem: fmem, 
                memusage: pmem
            };
            node.send(msg);
        });
    }

    RED.nodes.registerType("Memory",Memory);

    function NetworkIntf(config) {
        RED.nodes.createNode(this,config);
        const node = this;
        this.name = config.name;

        node.on("input", function(msg) {
            msg.payload = {networkInterfaces: os.networkInterfaces()};
            node.send(msg);
        });
    }

    RED.nodes.registerType("NetworkIntf",NetworkIntf);
};
