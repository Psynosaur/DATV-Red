/*
 * Copyright (c) 2024 Ohan Smit
 * This software is released under the MIT license.
 * See the LICENSE file for further details.
 */
let data = [{x: 0, y: 128}, {x: 128, y: 0}];
let dataPoints = 1500;
let graph = document.getElementById("graph");
const ctx = graph.getContext('2d', {alpha: false});

ctx.lineWidth = 1;
ctx.canvas.width = 2500;
ctx.canvas.height = 2500;
ctx.strokeStyle = '#333';
const W = ctx.canvas.width, H = ctx.canvas.height;
ctx.fillStyle = `rgb(0, 255, 128)`
let endAngle = Math.PI * 2;

function mqtt_client_v2(topics = []) {
    let x, y = 0;
    // Create a client instance
    if (hosting_url !== "" && window.location.hostname === hosting_url) {
        pluto_url = hosting_url;
        console.log("MQTT hostname: " + window.location.hostname)
        console.log("MQTT pluto_url: " + pluto_url)
    }
    const serverUrl = pluto_url; // i.e. "great-server.cloudmqtt.com"
    const serverPort = 9001; // cloudmqtt only accepts WSS sockets on this port. Others will use 9001, 8883 or others
    const clientId = "datv_red_constel_" + new Date().getUTCMilliseconds(); // make client name unique
    const client = new Paho.Client(serverUrl, serverPort, clientId);

    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // connect the client
    client.connect({onSuccess: onConnect});

    // called when the client connects
    function onConnect() {
        for (let i = 0; i < topics.length ;i++) {
            // console.log(topics[i])
            client.subscribe(topics[i])
        }
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
        if (data.length > dataPoints) {
            data = data.slice(2);
        }
        if (topic === `dt/longmynd/rx_state`) {
            if (message.payloadString === "Hunting") {
                // console.log("clear");
                data = []
                return;
            }
        }
        if (topic === `cmd/longmynd/frequency`) {
            // console.log("clear");
            data = []
            return;
        }
        if (topic === `dt/longmynd/constel_i`) {
            x = Number(message.payloadString);
        }
        if (topic === `dt/longmynd/constel_q`) {
            y = Number(message.payloadString);

        }

        // console.log("data[-1]?.x :" + data.at(-1)?.x)
        // console.log("data[-1]?.y :" + data.at(-1)?.y)
        // console.log("data[-2]?.x :" + data.at(-2)?.x)
        // console.log("data[-2]?.y :" + data.at(-2)?.y)

        // if the last two values of x and y in our array aren't the current values, we add the unique point(x,y).
        if (x !== data.at(-2)?.x && x !== data.at(-1)?.x && y !== data.at(-2)?.y && y !== data.at(-1)?.y) {
            let obj = {
                x: x, y: y
            };
            data.push(obj)
        }
    }
}


mqtt_client_v2([
    `dt/longmynd/constel_q`,
    `dt/longmynd/constel_i`,
    `dt/longmynd/rx_state`,
    `cmd/longmynd/frequency`]
);

const t = setInterval(() => drawConstellationPoints(data), 200);

function drawConstellationPoints(data) {
    // console.log(data.length)
    // Draw the dots
    let scale_factor = 12;
    let magicNumber = 1.85;
    ctx.setTransform(scale_factor, 0, 0, scale_factor, 0, 0); // resets the transform to clear
    ctx.clearRect(0, 0, W, H); // clears the canvas
    ctx.setTransform(scale_factor, 0, 0, scale_factor, W / 2, H / 2)

    // Chart axis
    ctx.lineWidth = 1.05;
    ctx.strokeRect(0, 0, 128, 128);
    ctx.strokeRect(-128, 0, 128, 128);
    ctx.strokeRect(0, -128, 128, 128);
    ctx.strokeRect(-128, -128, 128, 128);

    // dots for chart
    // ctx.scale(1-(1/scale_factor), 1-(1/scale_factor))
    // let spot_x1 = Math.floor(128/Math.sqrt(2));
    // let spot_x2 = Math.floor(-128/Math.sqrt(2));
    // let spot_y1 = Math.floor(128/Math.sqrt(2));
    // let spot_y2 = Math.floor(-128/Math.sqrt(2));
    // console.log(`${spot_x1}, ${spot_x2}, ${spot_y1}, ${spot_y2}`)
    // ctx.fillStyle = `rgb(255, 0, 30)`
    // ctx.font = `11px sans-serif`;
    // ctx.textBaseline = "bottom";
    //
    // ctx.fillText("01", spot_x1, spot_y1);
    // ctx.fillText("11", spot_x2, spot_y1);
    // ctx.fillText("00", spot_x1, spot_y2);
    // ctx.fillText("10", spot_x2, spot_y2);
    // ctx.beginPath();
    // ctx.arc(spot_x1, spot_y1, 1, 0, endAngle, true);
    // ctx.fill();
    // ctx.beginPath();
    // ctx.arc(spot_x2, spot_y1, 1, 0, endAngle, true);
    // ctx.fill();
    // ctx.beginPath();
    // ctx.arc(spot_x1, spot_y2, 1, 0, endAngle, true);
    // ctx.fill();
    // ctx.beginPath();
    // ctx.arc(spot_x2, spot_y2, 1, 0, endAngle, true);
    // ctx.fill();
    // ctx.fillStyle = `rgb(0, 255, 128)`
    let j = 0;
    for (let i = 0; i < data.length; i++) {
        // if (i >= 500 && i < 1000) {
        //     ctx.fillStyle = `rgb(200,255,${j})`;
        //     if (j === 255) j = 0;
        //     j++;
        // }
        // if (i === 1000) j = 0;
        // if (i >= 1000 && i < 1500) {
        //     ctx.fillStyle = `rgb(175,255,${j})`;
        //     if (j === 255) j = 0;
        //     j++;
        // }
        // if (i === 1500) j = 0;
        // if (i >= 1500 && i < 2000) {
        //     ctx.fillStyle = `rgb(150,255,${j})`;
        //     if (j === 255) j = 0;
        //     j++;
        // }
        // if (i === 2000) j = 0;
        // if (i >= 2000 && i < 2500) {
        //     ctx.fillStyle = `rgb(125,255,${j})`;
        //     if (j === 255) j = 0;
        //     j++;
        // }
        ctx.beginPath();
        ctx.arc(data[i].x, data[i].y, 1, 0, endAngle, true);
        // ctx.fillText(`${data[i].x}, ${data[i].y}`, data[i].x, data[i].y);
        ctx.fill();
    }
    // ctx.restore();

}

