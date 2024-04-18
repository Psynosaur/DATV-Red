"use strict";

var spectrum, logger, ws;

function connectWebSocket(spectrum) {
    if (hosting_url !== undefined && window.location.hostname === hosting_url) {
        pluto_url = hosting_url;
        console.log("WS hostname: " + window.location.hostname)
        console.log("WS pluto_url: " + pluto_url)
    }
    ws = new WebSocket(`ws://${pluto_url}:7681/websocket`);

    spectrum.setWebSocket(ws);

    ws.onconnect = function () {
        ws.binaryType = "arraybuffer";
    };

    ws.onopen = function () {
        ws.binaryType = "arraybuffer";
        console.log("connected!");
    };
    ws.onclose = function () {
        console.log("closed");
        let cnt = 0;
        setTimeout(function () {
            connectWebSocket(spectrum);
            cnt++;
        }, cnt * 1000);
    };
    ws.onerror = function (evt) {
        console.log("error: " + evt.message);
    };
    ws.onmessage = function (evt) {
        //spectrum.addData(evt.data);

        if (evt.data instanceof ArrayBuffer) {
            spectrum.addData(evt.data);
        } else {
            const data = JSON.parse(evt.data);
            console.dir(data);
            if (data.center) {
                spectrum.setCenterHz(data.center);
            }
            if (data.span) {
                spectrum.setSpanHz(data.span);
            }
            if (data.gain) {
                spectrum.setGain(data.gain);
            }
            if (data.framerate) {
                spectrum.setFps(data.framerate);
            }
            spectrum.log(
                " > Freq:" +
                data.center / 1000000 +
                " MHz | Span: " +
                data.span / 1000000 +
                " MHz | Gain: " +
                data.gain +
                "dB | Fps: " +
                data.framerate
            );
        }
    };
}

function main() {
    const defaultConfig = {
        "BATC": "wss://eshail.batc.org.uk/wb/fft",
        "DL5OCD": "ws://46.41.2.20:7681",
        "DL5OCD HAMNET": "ws://44.149.67.245:7681",
        "ZS1SCI_LOCAL": "ws://192.168.1.114:7681",
        "ZS1SCI": "ws://197.155.17.207:7681",
        "selected": "wss://eshail.batc.org.uk/wb/fft",
        "receivers": [{
            "ip_address": "232.0.0.11",
            "port": "6789",
            "offset": "9750000",
            "rx_socket": "A",
            "lnb_volts": "0",
            "lnb_22khz": "off",
            "dvb_mode": "DVB-S2",
            "wide_scan": "0",
            "low_sr": "0",
            "type": "Minitioune"
        }],
        "rx_sr": "10656000",
        "rx_freq": 748750000,
        "settings": {
            "spectrum": {
                "gain": 21,
                "max_db": 525,
                "min_db": 430,
                "signal_threshold": 47,
                "averaging": 15,
                "spectrum_percent": 60,
                "color": 10,
                "percent": 75,
                "freq": 748.75,
                "35ks": 1120000,
                "66ks": 1056000,
                "125ks": 2000000,
                "250ks": 8000000,
                "333ks": 10656000,
                "500ks": 8000000,
                "1000ks": 16000000,
                "1500ks": 24000000,
                "2000ks": 16000000,
                "3000ks": 12000000,
                "4000ks": 16000000
            },
        },
        "offset": 9750000000
    };
    const config = JSON.parse(localStorage.getItem("config_global"));
    if(!config){
        localStorage.setItem("config_global", JSON.stringify(defaultConfig));
    }
    // Create spectrum object on canvas with ID "waterfall"
    spectrum = new Spectrum("waterfall", {
        spectrumPercent: config.settings.spectrum.percent,
        logger: "log",
        wf_size: 35,
        max_db: config.settings.spectrum.max_db,
        min_db: config.settings.spectrum.min_db,
        threshold: config.settings.spectrum.signal_threshold,
        color: config.settings.spectrum.color,
        averaging: config.settings.spectrum.averaging,
        offset: config.offset
    });

    // Connect to websocket
    connectWebSocket(spectrum);

    // Bind keypress handler
    window.addEventListener("keydown", function (e) {
        spectrum.onKeypress(e);
    });

    // Drag keypress handler
    window.addEventListener("mousemove", function (event) {
        spectrum.detect_movement(event);
    });
    window.addEventListener("mouseout", function (event) {
        spectrum.detect_movement_1(event);
    });
    // mqtt_client();
    mqtt_client_2();

}

window.onload = main;
