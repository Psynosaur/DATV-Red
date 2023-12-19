function mqtt_client() {
    let x, y = 0;
    let data = [];
    let chart = new Chart("constellationChart", {
        type: "scatter",
        data: {
            datasets: [
                {
                    pointRadius: 2,
                    pointBackgroundColor: "rgb(11,193,11)",
                    data: data
                },
                {
                    type: 'scatter',
                    data: [{x: 0, y: 0}],
                    backgroundColor: "rgba(0,0,0,0)",
                    borderColor: "#737272D3",
                    pointRadius: 66,
                    pointHoverRadius: 7,
                    borderWidth: 3
                }
            ]
        },
        options: {
            legend: {display: false},
            showLines: false,
            scales: {
                xAxes: [
                    {
                        scaleLabel: { // To format the scale label
                            display: false,
                            labelString: 'X axis name',
                            fontColor: '#FFFFFF',
                            fontSize: 10
                        },
                        ticks: {
                            fontColor: "white", // To format the ticks, coming on the axis/labels which we are passing
                            fontSize: 14,
                            min: -90,
                            max: 90,
                            display: false
                        },
                        gridLines: {
                            display: false,
                            color: "#727575",
                            zeroLineColor: '#727575'
                        },
                        suggestedMin: -90
                    }],
                yAxes: [
                    {
                        scaleLabel: { // To format the scale label
                            display: false,
                            labelString: 'X axis name',
                            fontColor: '#FFFFFF',
                            fontSize: 10
                        },
                        ticks: {
                            fontColor: "white", // To format the ticks, coming on the axis/labels which we are passing
                            fontSize: 14,
                            min: -90,
                            max: 90,
                            display: false
                        },
                        gridLines: {
                            display: false,
                            color: "#727575",
                            zeroLineColor: '#727575'
                        },
                        suggestedMin: -90
                    }],
            }
        }
    });

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
        if (data.length > 1200) {
            data = data.slice(2)
            updateChart(chart, data)
            removeData(chart);
            removeData(chart);
        }
        if (topic === `dt/longmynd/rx_state`) {
            if (message.toString() === "Hunting") {
                console.log("clear");
                data = []
                updateChart(chart, data)
                // updateChart(chart, 1, {x:0, y:0})
                return;
            }
        }
        if (topic === `cmd/longmynd/frequency`) {
            console.log("clear");
            data = []
            updateChart(chart, data)
            // updateChart(chart, 1, {x:0, y:0})
            return;
        }
        if (topic === `dt/longmynd/constel_i`) {
            x = Number(message.toString());
            // y = Number(message.toString());
            // console.log("constel_i: " + x);
        }
        if (topic === `dt/longmynd/constel_q`) {
            // x = Number(message.toString());
            y = Number(message.toString());
            // console.log("constel_q: " + y);
        }
        // if(y === 0 || x === 0) return;
        let obj = {
            x: x,
            y: y
        };
        data.push(obj)

        addData(chart, "xy", obj);
    });
}


mqtt_client();

// function updateChart(chart, dataSetIndex, data) {
//     // chart.data.labels.push(label);
//     chart.data.datasets[dataSetIndex].data = data;
//     chart.update('none');
// }
//
// function addData(chart, dataSetIndex, data) {
//     // chart.data.labels.push(label);
//     chart.data.datasets[dataSetIndex].data.push(data);
//     chart.update();
// }
//
// function removeData(chart, dataSetIndex) {
//     // chart.data.labels.pop();
//     chart.data.datasets[dataSetIndex].data.pop();
//     chart.update();
// }

function updateChart(chart, data) {
    // chart.data.labels.push(label);
    chart.data.datasets[0].data = data;
    chart.data.datasets[1].data = [{x: 0, y: 0}];
    chart.update();
}

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(data);
    chart.update();
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets[0].data.pop();
    chart.update();
}