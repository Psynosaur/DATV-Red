function mqtt_client_2() {
  // Create a client instance
  if(hosting_url !== "" && window.location.hostname === hosting_url){
    pluto_url = hosting_url;
    console.log("MQTT hostname: " + window.location.hostname)
    console.log("MQTT pluto_url: " + pluto_url)
  }
  const serverUrl = pluto_url; // i.e. "great-server.cloudmqtt.com"
  const serverPort = 9001; // cloudmqtt only accepts WSS sockets on this port. Others will use 9001, 8883 or others
  const clientId = "datv_red_spectrum_" + new Date().getUTCMilliseconds(); // make client name unique
  const client = new Paho.MQTT.Client(serverUrl, serverPort, clientId);

  // set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  // connect the client
  client.connect({ onSuccess: onConnect });

  // called when the client connects
  function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    // spectrum.toggleAutoScale();
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/frequency`);
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/span`);
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/minSpan`);
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/min_db`);
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/max_db`);
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/percent`);
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/color`);
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/avg`);
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/signal_threshold`);
    //message = new Paho.MQTT.Message("Hello");
    //message.destinationName = "World";
    //client.send(message);
  }

  // called when the client loses its connection
  function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:" + responseObject.errorMessage);
    }
  }

  // called when a message arrives
  function onMessageArrived(message) {
    let topic = message.destinationName;
    if (topic === `dt/pluto/${callsign}/rx/webfft/frequency`) {
      let Hz = Number(message.payloadString);
      spectrum.setCenterHz(Hz);
      // console.log("setCenterHz: " + Hz);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/span`) {
      let spanHz = Number(message.payloadString);
      spectrum.setSpanHz(spanHz);
      // console.log("setSpanHz: " + spanHz);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/minSpan`) {
      let spanHz = Number(message.payloadString);
      spectrum.setMinSpanHz(spanHz);
      // console.log("minSpan: " + spanHz);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/min_db`) {
      let db = Number(message.payloadString);
      spectrum.setMinRange(db);
      // console.log("min db: " + db);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/max_db`) {
      let db = Number(message.payloadString);
      spectrum.setMaxRange(db);
      // console.log("max db: " + db);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/avg`) {
      let num = Number(message.payloadString);
      spectrum.setAveraging(num);
      // console.log("avg: " + num);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/signal_threshold`) {
      let num = Number(message.payloadString);
      spectrum.setThreshold(num);
      // console.log("avg: " + num);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/percent`) {
      let num = Number(message.payloadString);
      spectrum.setSpectrumPercent(num);
      // console.log("avg: " + num);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/color`) {
      let num = Number(message.payloadString);
      spectrum.setColor(num);
      // console.log("avg: " + num);
    }
  }
}
function mqtt_client() {
  if(hosting_url !== "" && window.location.hostname === hosting_url){
    pluto_url = hosting_url;
    console.log("MQTT hostname: " + window.location.hostname)
    console.log("MQTT pluto_url: " + pluto_url)
  }
  let url = `ws://${pluto_url}:9001`;
  const options = {
    // Clean session
    clean: true,
    connectTimeout: 4000,
    // Authentication
    clientId: "pluto_spectrum_" + new Date().getUTCMilliseconds(),
    username: "root",
    password: "analog",
    protocolVersion: 5
  };
  const client = mqtt.connect(url, options);

  console.log("callsign: " + callsign);
  console.log("url: " + url);
  client.on("connect", function () {
    console.log("Connected MQTT");
    // Subscribe to a topic
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/frequency`, () => {});
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/span`, () => {});
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/minSpan`, () => {});
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/min_db`, () => {});
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/max_db`, () => {});
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/avg`, () => {});
    client.subscribe(`dt/pluto/${callsign}/rx/webfft/signal_threshold`, () => {});
  });
  client.on("message", function (topic, message) {
    if (topic === `dt/pluto/${callsign}/rx/webfft/frequency`) {
      let Hz = Number(message.toString());
      spectrum.setCenterHz(Hz);
      // console.log("setCenterHz: " + Hz);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/span`) {
      let spanHz = Number(message.toString());
      spectrum.setSpanHz(spanHz);
      // console.log("setSpanHz: " + spanHz);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/minSpan`) {
      let spanHz = Number(message.toString());
      spectrum.setMinSpanHz(spanHz);
      // console.log("minSpan: " + spanHz);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/min_db`) {
      let db = Number(message.toString());
      spectrum.setMinRange(db);
      // console.log("min db: " + db);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/max_db`) {
      let db = Number(message.toString());
      spectrum.setMaxRange(db);
      // console.log("max db: " + db);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/avg`) {
      let num = Number(message.toString());
      spectrum.setAveraging(num);
      // console.log("avg: " + num);
    }
    if (topic === `dt/pluto/${callsign}/rx/webfft/signal_threshold`) {
      let num = Number(message.toString());
      spectrum.setThreshold(num);
      // console.log("avg: " + num);
    }
  });
}


