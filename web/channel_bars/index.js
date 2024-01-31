let freq_info = [];
let channels = document.getElementById("channels");
const ctx = channels.getContext('2d', {alpha: false});
ctx.lineWidth = 1;
ctx.canvas.width = 750;
ctx.canvas.height = 100;
drawChannels(ctx);
function drawChannels (ctx) {
    ctx.fillStyle = "red";
    const rolloff = 1.35 / 2.0;
    const _start_freq = 491.5;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    function draw_channel(center_frequency, bandwidth, line_height) {
        if (typeof freq_info !== "undefined") {
            if (freq_info.length === 44) freq_info = []; // hack to avoid continued push(). better to precompute all points and draw.
            freq_info.push({
                x1: (center_frequency - rolloff * bandwidth - _start_freq) * (width / 9),
                x2: (center_frequency + rolloff * bandwidth - _start_freq) * (width / 9),
                y: height * line_height,
                center_frequency: center_frequency,
                bandwidth: bandwidth,
            });
        }

        ctx.fillRect((center_frequency - rolloff * bandwidth - _start_freq) * (width / 9), height * line_height, 2 * (rolloff * bandwidth) * (width / 9), 6);
    }

    /* 1MS */
    for (let i = 493.25; i <= 496.25; i = i + 1.5) {
        // draw_channel(f, 1.0, 7.475 / 8);
        draw_channel(i, 1.0, 8.975 / 20);
    }

    /* 333Ks */
    for (let j = 492.75; j <= 499.25; j = j + 0.5) {
        draw_channel(j, 0.333, 7.2 / 20);
    }

    /* 125Ks */
    for (let f = 492.75; f <= 499.25; f = f + 0.25) {
        draw_channel(f, 0.125, 5.425 / 20);
    }

    /* Annotate Bands - Text */
    ctx.font = "19px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    // ctx.fillText("A71A DATV Beacon", ((491.5) - _start_freq) * (width / 9), height - 45);
    // ctx.fillText("10491.500", ((491.5) - _start_freq) * (width / 9), height - 28);
    // ctx.fillText("(1.5MS/s QPSK, 4/5)", ((491.5) - _start_freq) * (width / 9), height - 12);
    ctx.fillText("Click to tune wide & narrow channels", (494.75 - _start_freq) * (width / 9), 75);

    /* ctx.fillText("", ((494.75) - _start_freq) * (canvasWidth / 15), canvasHeight - 6);
    ctx.fillText("", ((494.75) - _start_freq) * (canvasWidth / 6.42), canvasHeight - 6); */

    ctx.fillText("Narrow channels", (498.25 - _start_freq) * (width / 9), 75);
    ctx.restore();
};