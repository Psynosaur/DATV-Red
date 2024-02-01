
let canvas = document.getElementById("bars");
const ctx = canvas.getContext('2d', {alpha: false});
ctx.lineWidth = 1;
const W = ctx.canvas.width, H = ctx.canvas.height;
let mouse_in_canvas = false;
ctx.canvas.addEventListener("click", on_canvas_click, false);
ctx.canvas.addEventListener("mousemove", function (e) {
    mouse_in_canvas = true;

    const el_boundingRectangle = canvas.getBoundingClientRect();
    mouse_x = e.clientX - el_boundingRectangle.left;
    mouse_y = e.clientY - el_boundingRectangle.top;

    render_frequency_info(mouse_x, mouse_y);

});

ctx.canvas.addEventListener("mouseout", function () {
    mouse_in_canvas = false;
});
let offset = 1910;
let band_colour = "rgb(144,148,148)";
let activeColor, activeXd1, activeYd, activeXd2;
let activeColor_tx, activeXd1_tx, activeYd_tx, activeXd2_tx;
let downlink, uplink, canvasClickBW;
let x1,x2,y1;

/* Load vars from local storage */
if (typeof Storage !== "undefined") {
    storageSupport = true;
    if (localStorage.activeColor_tx) {
        activeColor_tx = localStorage.activeColor_tx;
    }
    if (localStorage.activeXd1_tx) {
        activeXd1_tx = localStorage.activeXd1_tx;
    }
    if (localStorage.activeYd_tx) {
        activeYd_tx = localStorage.activeYd_tx;
    }
    if (localStorage.activeXd2_tx) {
        activeXd2_tx = localStorage.activeXd2_tx;
    }
}

function on_canvas_click(ev) {
    console.log(mouse_x)
    console.log(mouse_y)
    console.log(`${uplink}:${canvasClickBW}`)
    let u = uplink
    let sr = canvasClickBW
    if(canvasClickBW === undefined || uplink === undefined) return

    const url = localPage ? 'http://127.0.0.1:1880' : '';
    /* we clicked on a channel bar... */

    // 333KS on > 500KS channel
    if (ev.shiftKey && canvasClickBW > 0.333) {
        canvasClickBW = 0.333;
    }
    // 250KS on mid channels
    if (ev.altKey && canvasClickBW >= 0.333) {
        canvasClickBW = 0.25;
    }

    fetch(
        `${url}/setTx?` +
        new URLSearchParams({
            uplink: u,
            downlink,
            SR: sr,
        })
    );
    activeColor_tx = activeColor;
    activeXd1_tx = activeXd1;
    activeYd_tx = activeYd;
    activeXd2_tx = activeXd2 + 1;
    if (storageSupport) {
        localStorage.activeColor_tx = activeColor_tx;
        localStorage.activeXd1_tx = activeXd1_tx;
        localStorage.activeYd_tx = activeYd_tx;
        localStorage.activeXd2_tx = activeXd2_tx;
    }
}

setInterval(() => drawChannels(ctx), 20);

function drawChannels(ctx) {
    let freq_info = [];
    resize(canvas)

    ctx.fillStyle = band_colour;
    let offset = 1910.5;
    const rolloff = 1.35 / 2.0;
    const _start_freq = 491.5;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    function draw_channel(center_frequency, bandwidth, line_height) {
        if (typeof freq_info !== "undefined") {
            freq_info.push({
                x1: Math.floor((center_frequency - rolloff * bandwidth - _start_freq) * (width / 9)),
                x2: Math.floor((center_frequency + rolloff * bandwidth - _start_freq) * (width / 9)),
                y: Math.floor(height * line_height),
                center_frequency: center_frequency + offset,
                bandwidth: bandwidth,
            });
        }

        ctx.fillRect((center_frequency - rolloff * bandwidth - _start_freq) * (width / 9), height * line_height, 2 * (rolloff * bandwidth) * (width / 9), 6);
    }

    ctx.fillStyle = band_colour;
    /* 1MS */
    for (let i = 493.25; i <= 496.25; i = i + 1.5) {
        // draw_channel(f, 1.0, 7.475 / 8);

        draw_channel(i, 1.0, 0.6);
    }

    /* 333Ks */
    for (let j = 492.75; j <= 499.25; j = j + 0.5) {

        draw_channel(j, 0.333, 0.5);
    }

    /* 125Ks */
    for (let f = 492.75; f <= 499.25; f = f + 0.25) {

        draw_channel(f, 0.125, 0.4);
    }
    if(mouse_in_canvas){
        // Mouse hover over rectangle
        ctx.fillStyle = invertColor(band_colour);
        ctx.fillRect(x1, y1, x2 - x1 +1, 7);
    }

    ctx.fillStyle = invertColor(band_colour);
    ctx.font = "bold 19px Arial";
    ctx.fillText("TX", activeXd1_tx - 20, activeYd_tx);

    ctx.fillRect(
        activeXd1_tx,
        activeYd_tx,
        activeXd2_tx - activeXd1_tx,
        7
    );
    /* Annotate Bands - Text */
    ctx.font = "19px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    // ctx.fillText("A71A DATV Beacon", ((491.5) - _start_freq) * (width / 9), height - 45);
    // ctx.fillText("10491.500", ((491.5) - _start_freq) * (width / 9), height - 28);
    // ctx.fillText("(1.5MS/s QPSK, 4/5)", ((491.5) - _start_freq) * (width / 9), height - 12);
    ctx.fillText("Click to tune wide & narrow channels", (494.75 - _start_freq) * (width / 9), 90);

    /* ctx.fillText("", ((494.75) - _start_freq) * (canvasWidth / 15), canvasHeight - 6);
    ctx.fillText("", ((494.75) - _start_freq) * (canvasWidth / 6.42), canvasHeight - 6); */

    ctx.fillText("Narrow channels", (498.25 - _start_freq) * (width / 9), 90);
    if (storageSupport) {
        localStorage.freq_info = JSON.stringify(freq_info)
    }
    ctx.restore();
}

function resize(canvas) {

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);

    // console.log(width)
    // console.log(height)
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
    // if (this.axes.width !== width || this.axes.height !== this.spectrumHeight) {
    //     this.axes.width = width;
    //     this.axes.height = this.spectrumHeight;
    // }
}
function getMinY(data) {
    return data.reduce((min, p) => p.y < min ? p.y : min, data[0].y);
}
function getMaxY(data) {
    return data.reduce((max, p) => p.y > max ? p.y : max, data[0].y);
}
function getMinX(data) {
    return data.reduce((min, p) => p.x < min ? p.x : min, data[0].x);
}
function resetCanvasVariables() {
    canvasClickBW = undefined;
    uplink = undefined;
}

function render_frequency_info(mouse_x, mouse_y) {
    let freq = [];
    if (typeof Storage !== "undefined") {
        freq = JSON.parse(localStorage.freq_info);
    }
    let minX = getMinX(freq);
    let minY = getMinY(freq);
    let maxY = getMaxY(freq);
    let display_triggered = false;
    if (mouse_x < minX) {
        resetCanvasVariables();
        return
    }
    if (mouse_y < minY) {
        resetCanvasVariables();
        return
    }
    if (mouse_x > freq[43].x2) {
        resetCanvasVariables();
        return
    }
    if (mouse_y > freq[0].y + 6) {
        resetCanvasVariables();
        return
    }
    if (mouse_y > minY ) {
        for (let i = 0; i < freq.length; i++) {
            let xd1 = freq[i].x1;
            let xd2 = freq[i].x2;
            let yd = freq[i].y;
            if (
                mouse_x > xd1 - 1 &&
                mouse_x < xd2 + 1 &&
                mouse_y > yd - 1
                && mouse_y < yd + 6
            ) {
                downlink = 10000.0 + freq[i].center_frequency - offset;
                uplink = freq[i].center_frequency;
                canvasClickBW =
                    uplink < 2407.5 && freq[i].bandwidth === 0.333
                        ? 0.5
                        : freq[i].bandwidth;

                canvas.title =
                    "Downlink: " +
                    downlink +
                    " MHz\nUplink: " +
                    uplink +
                    " MHz\nSymbol Rate: " +
                    (freq[i].bandwidth === 0.125
                        ? "125/66/33 Ksps"
                        : freq[i].bandwidth === 0.333
                            ? freq[i].center_frequency < 497.0
                                ? "500/333/250 Ksps"
                                : "333/250 Ksps"
                            : "1 Msps");

                ctx.fillStyle = invertColor(band_colour);
                ctx.fillRect(xd1, yd, xd2 - xd1, 6);
                activeColor = invertColor(band_colour);
                activeXd1 = xd1;
                activeXd2 = xd2;
                activeYd = yd;
                display_triggered = true;
                x1 = xd1;
                x2 = xd2;
                y1 = yd;
                break;
            }
        }
    }
    if (!display_triggered) {
        canvas.title = "";
    }
}


function invertColor(hexTripletColor) {
    let color = hexTripletColor;
    color = `${color}`.substring(1); // remove #
    color = parseInt(color, 16); // convert to integer
    color = 0xffffff ^ color; // invert three bytes
    color = color.toString(16); // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color; // prepend #
    return color;
}
