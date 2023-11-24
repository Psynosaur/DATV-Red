const os = require('os');
const process = require('process');

const NODE_ENV = process.env.NODE_ENV;

const {LoadavgWindows} = require('./loadavg-windows');



let enabled = false;

function enableCustomLoadavg() {

    if ( ! enabled) {
        enabled = true;

        let loadavg_windows = new LoadavgWindows();
        loadavg_windows.init();

        os.loadavg = loadavg_windows.loadavg.bind(loadavg_windows);


        if(NODE_ENV == 'development' || NODE_ENV == 'dev') {
            // For testing purposes only
            exports.loadavg_windows = loadavg_windows;
            console.log(`[loadavg-windows] Using platform-independent loadavg implementation.`);
        }
    }
}



if (os.platform() === 'win32') {
    enableCustomLoadavg();
}



exports.enableCustomLoadavg = enableCustomLoadavg;
