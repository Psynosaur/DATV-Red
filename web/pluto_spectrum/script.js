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

  ws.onconnect = function (evt) {
    ws.binaryType = "arraybuffer";
  };

  ws.onopen = function (evt) {
    ws.binaryType = "arraybuffer";
    console.log("connected!");
  };
  ws.onclose = function (evt) {
    console.log("closed");
    setTimeout(function () {
      connectWebSocket(spectrum);
    }, 1000);
  };
  ws.onerror = function (evt) {
    console.log("error: " + evt.message);
  };
  ws.onmessage = function (evt) {
    //spectrum.addData(evt.data);

    if (evt.data instanceof ArrayBuffer) {
      spectrum.addData(evt.data);
    } else {
      var data = JSON.parse(evt.data);
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

var freq_info = [];
function main() {
  // Create spectrum object on canvas with ID "waterfall"
  spectrum = new Spectrum("waterfall", {
    spectrumPercent: 65,
    logger: "log",
    wf_size: 35
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
  mqtt_client();
}

window.onload = main;
