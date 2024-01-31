"use strict";

var spectrum, logger, ws;
function connectWebSocket(spectrum) {
  if(hosting_url !== undefined && window.location.hostname === hosting_url){
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
async function getJSON(url) {
  return fetch(`${url}/config`)
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      });
}
async function getConfig(url) {
  return await getJSON(url);
}



function main() {
  (async () => {
    const url = localPage ? 'http://127.0.0.1:1880' : '';
    const config = await getConfig(url);
    // Create spectrum object on canvas with ID "waterfall"
    spectrum = new Spectrum("waterfall", {
      spectrumPercent: config.settings.spectrum.percent,
      logger: "log",
      wf_size: 35,
      max_db: config.settings.spectrum.max_db,
      min_db: config.settings.spectrum.min_db,
      threshold: config.settings.spectrum.signal_threshold,
      color: config.settings.spectrum.color,
      averaging: config.settings.spectrum.averaging
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
  })();
}

window.onload = main;
