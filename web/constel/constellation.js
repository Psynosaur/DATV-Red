let data = [];
let dataPoints = 2500;
let graph = document.getElementById("graph");
const ctx = graph.getContext('2d', {alpha: false});

ctx.lineWidth = 1;
ctx.canvas.width = 2500;
ctx.canvas.height = 2500;
ctx.strokeStyle = '#333';
const W = ctx.canvas.width, H = ctx.canvas.height;
ctx.fillStyle = `rgb(0, 255, 128)`
let endAngle = Math.PI * 2;

function mqtt_client() {
    let x, y = 0;
    if (hosting_url !== "" && window.location.hostname === hosting_url) {
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
        clientId: "pluto" + new Date().getUTCMilliseconds(),
        username: "root",
        password: "analog",
    };
    const client = mqtt.connect(url, options);
    console.log("callsign: " + call_sign);
    console.log("url: " + url);
    client.on("connect", function () {
        console.log("Connected MQTT");
        // Subscribe to a topic
        client.subscribe(`dt/longmynd/constel_q`, () => {
        });
        client.subscribe(`dt/longmynd/constel_i`, () => {
        });
        client.subscribe(`dt/longmynd/rx_state`, () => {
        });
        client.subscribe(`cmd/longmynd/frequency`, () => {
        });
    });
    client.on("message", function (topic, message) {
        if (data.length > dataPoints) {
            data = data.slice(2);
        }
        if (topic === `dt/longmynd/rx_state`) {
            if (message.toString() === "Hunting") {
                console.log("clear");
                data = []
                return;
            }
        }
        if (topic === `cmd/longmynd/frequency`) {
            console.log("clear");
            data = []
            return;
        }
        if (topic === `dt/longmynd/constel_i`) {
            x = Number(message.toString());
        }
        if (topic === `dt/longmynd/constel_q`) {
            y = Number(message.toString());
        }
        let obj = {
            x: x,
            y: y
        };
        data.push(obj)
    });
}


mqtt_client();

const t = setInterval(
    () => drawConstellationPoints(data),
    200
);

function drawConstellationPoints(data) {
    console.log(data.length)
    // Draw the dots
    ctx.setTransform(15, 0, 0, 15, 0, 0); // resets the transform to clear
    ctx.clearRect(0, 0, W, H); // clears the canvas
    ctx.setTransform(15, 0, 0, 15, W / 2, H / 2)

    // Chart axis
    ctx.strokeRect(0,0, 90, 90);
    ctx.strokeRect(-90,0, 90, 90);
    ctx.strokeRect(0,-90, 90, 90);
    ctx.strokeRect(-90,-90, 90, 90);

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
        ctx.fill();
    }
}