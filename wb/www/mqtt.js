// function mqtt_client() {
//   // Create a client instance
//   var serverUrl = pluto_url; // i.e. "great-server.cloudmqtt.com"
//   var serverPort = 9001; // cloudmqtt only accepts WSS sockets on this port. Others will use 9001, 8883 or others
//   var clientId = "wsbrowser_" + new Date().getUTCMilliseconds(); // make client name unique
//   const client = new Paho.MQTT.Client(serverUrl, serverPort, clientId);

//   // set callback handlers
//   client.onConnectionLost = onConnectionLost;
//   client.onMessageArrived = onMessageArrived;

//   // connect the client
//   client.connect({ onSuccess: onConnect });

//   // called when the client connects
//   function onConnect() {
//     // Once a connection has been made, make a subscription and send a message.
//     console.log("onConnect");
//     spectrum.toggleAutoScale();
//     client.subscribe(`dt/pluto/${callsign}/rx/frequency`);
//     client.subscribe(`dt/pluto/${callsign}/sr`);
//     //message = new Paho.MQTT.Message("Hello");
//     //message.destinationName = "World";
//     //client.send(message);
//   }

//   // called when the client loses its connection
//   function onConnectionLost(responseObject) {
//     if (responseObject.errorCode !== 0) {
//       console.log("onConnectionLost:" + responseObject.errorMessage);
//     }
//   }

//   // called when a message arrives
//   function onMessageArrived(message) {
//     let topic = message.destinationName;
//     console.log(
//       "onMessageArrived:" + message.payloadString + message.destinationName
//     );
//     spectrum.setAveraging(10);
//     if (topic.includes("frequency")) {
//       spectrum.setCenterHz(message.payloadString);
//     }
//     if (topic.includes("sr")) {
//       spectrum.setSpanHz(message.payloadString);
//     }
//   }
// }
function mqtt_client() {
  let url = `ws://${pluto_url}:9001`;
  const options = {
    // Clean session
    clean: true,
    connectTimeout: 4000,
    // Authentication
    clientId: "pluto" + new Date().getUTCMilliseconds(),
    username: "root",
    password: "analog",
  };
  const client = mqtt.connect(url, options);
  console.log("callsign: " + callsign);
  console.log("url: " + url);
  client.on("connect", function () {
    console.log("Connected MQTT");
    // Subscribe to a topic
    client.subscribe(`dt/pluto/${callsign}/rx/frequency`, () => {});
    client.subscribe(`dt/pluto/${callsign}/sr`, () => {});
  });
  client.on("message", function (topic, message) {
    if (topic === `dt/pluto/${callsign}/rx/frequency`) {
      let Hz = Number(message.toString());
      spectrum.setCenterHz(Hz);
    //   console.log("setCenterHz: " + Hz);
    }
    if (topic === `dt/pluto/${callsign}/sr`) {
      let spanHz = Number(message.toString());
      spectrum.setSpanHz(spanHz);
    //   console.log("setSpanHz: " + spanHz);
    }
  });
}
