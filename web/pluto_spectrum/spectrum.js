/*
 * Copyright (c) 2019 Jeppe Ledet-Pedersen
 * This software is released under the MIT license.
 * See the LICENSE file for further details.
 */
/*
 * Copyright (c) 2024 Ohan Smit
 * This software is released under the MIT license.
 * See the LICENSE file for further details.
 */

"use strict";

// Most of these are from the BATC spectrum code, "internet_spectrum" folder
// const beacon_strength = 0;
let mouse_in_canvas = false;
let mouse_x = 0;
let mouse_y = 0;
let signals = [];
let background_colour = "black";
/* This controls the pluto via HTTP request to the node-red API endpoint 'setRadio' */
let downlink, uplink, canvasClickBW;
let busy = false;
let storageSupport = false;
let tunedBox = {};
let clickBox = {};
let signal_selected;

if (typeof Storage !== "undefined") {
    storageSupport = true;
    if (localStorage.tunedBox) {
        tunedBox = JSON.parse(localStorage.tunedBox);
    }
}

function setRxClickState(minSpan, spanHz) {
    let scale = minSpan / spanHz ;
    tunedBox = clickBox;
    tunedBox.minSpanHz = minSpan;
    tunedBox.spanHz = spanHz;
    tunedBox.w = clickBox.w * scale * (spanHz / minSpan);
    if (storageSupport) {
        localStorage.tunedBox = JSON.stringify(tunedBox);
    }
}

function drawRxBox(ctx, xText, minSpan, spanHz) {
    let scale = minSpan / spanHz;
    let boxScale = tunedBox?.spanHz / tunedBox?.minSpanHz;
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(tunedBox.x, tunedBox.y, tunedBox.w * scale * boxScale, tunedBox.h);
    ctx.fillStyle = "rgb(32,246,137)";
    ctx.fillText(`${(tunedBox.freq / 1_000_000).toFixed(3)}`, xText, 50);
}

function render_signal_box(ctx, mouse_x, mouse_y, canvasHeight, canvasWidth) {
    let i;
    let top_line_y = 2;
    if (mouse_y < (canvasHeight * 8) / 8) {
        for (i = 0; i < signals.length; i++) {
            if (mouse_x > signals[i].start && mouse_x < signals[i].end
                // && mouse_y > signals[i].top
            ) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = background_colour === "black" ? "white" : "black";

                /* LEFT LINE */
                ctx.beginPath();
                ctx.moveTo(signals[i].start, canvasHeight * (7 / 8));
                ctx.lineTo(signals[i].start, canvasHeight * (1 / 100));
                ctx.stroke();

                /* Top LINE */
                ctx.beginPath();
                ctx.moveTo(signals[i].start, top_line_y);
                ctx.lineTo(signals[i].end, top_line_y);
                ctx.stroke();

                /* RIGHT LINE */
                ctx.beginPath();
                ctx.moveTo(signals[i].end, canvasHeight * (7 / 8));
                ctx.lineTo(signals[i].end, canvasHeight * (1 / 100));
                ctx.stroke();

                if (signals[i].start > canvasWidth / 1000) {
                    canvasClickBW = signals[i].symbolrate / 1000;
                    downlink = round(signals[i].frequency);

                    clickBox = {
                        x: signals[i].end,
                        y: canvasHeight * (1 / 100),
                        w: signals[i].start - signals[i].end,
                        h: canvasHeight * (99 / 100),
                        freq: round(signals[i].frequency)
                    };
                    busy = true;
                    let freq = `${(signals[i].frequency / 1_000_000).toFixed(3)}MHz`
                    ctx.fillText(freq, signals[i].start - (signals[i].start - signals[i].end) / 2, 75);
                }
                busy = true;
                ctx.restore();
                return;
            }
        }
        busy = false;
    }
}

function print_symbolrate(symrate) {
    if (symrate < 0.7) {
        return Math.round(symrate * 1000) + "KS";
    } else {
        return Math.round(symrate * 10) / 10 + "MS";
    }
}

function align_symbolrate(width) {
    return round(width, 0.001)
}

function round(value, step) {
    step || (step = 1.0);
    const inv = 1.0 / step;
    return Math.round(value * inv) / inv;
}

Spectrum.prototype.squeeze = function (value, out_min, out_max) {
    if (value <= this.min_db) return out_min; else if (value >= this.max_db) return out_max; else return Math.round(((value - this.min_db) / (this.max_db - this.min_db)) * out_max);
};

Spectrum.prototype.rowToImageData = function (bins) {
    for (let i = 0; i < this.imagedata.data.length; i += 4) {
        const cindex = this.squeeze(bins[i / 4], 0, 255);
        const color = this.colormap[cindex];
        this.imagedata.data[i] = color[0];
        this.imagedata.data[i + 1] = color[1];
        this.imagedata.data[i + 2] = color[2];
        this.imagedata.data[i + 3] = 255;
    }
};


Spectrum.prototype.addWaterfallRow = function (bins) {

    // Shift waterfall 1 row down
    this.ctx_wf.drawImage(this.ctx_wf.canvas, 0, 0, this.wf_size, this.wf_rows - 1, 0, 1, this.wf_size, this.wf_rows - 1);

    this.wfrowcount++;

    // Draw new line on waterfall canvas
    this.rowToImageData(bins);
    this.ctx_wf.putImageData(this.imagedata, 0, 0);

    if (this.wfrowcount % 100 === 0) {
        const timeString = new Date().toISOString();

        // Font scaling over all spans... using magic(constant) numbers 612 and 1552
        // change this in proportion to increase or decrease text
        this.ctx_wf.save();
        this.ctx_wf.scale(this.ctx_wf.canvas.width / 750, this.ctx_wf.canvas.height / 1552);
        // keep constant scale regardless

        this.ctx_wf.font = `13px sans-serif`
        this.ctx_wf.fillStyle = "white";

        this.ctx_wf.textBaseline = "top";
        this.ctx_wf.fillText(timeString, 3, 3);

        this.ctx_wf.restore();
    }
    const width = this.ctx.canvas.width;
    const height = this.ctx.canvas.height;

    // Copy scaled FFT canvas to screen. Only copy the number of rows that will
    // fit in waterfall area to avoid vertical scaling.
    this.ctx.imageSmoothingEnabled = false;
    const rows = Math.min(this.wf_rows, height - this.spectrumHeight);
    this.ctx.drawImage(this.ctx_wf.canvas, 0, 0, this.wf_size, rows, 0, this.spectrumHeight, width, height - this.spectrumHeight);

};

Spectrum.prototype.drawFFT = function (bins) {
    this.ctx.beginPath();
    this.ctx.moveTo(-1, this.spectrumHeight + 1);
    for (let i = 0; i < bins.length; i++) {
        let y = this.spectrumHeight - this.squeeze(bins[i], 0, this.spectrumHeight);
        if (y > this.spectrumHeight - 1) y = this.spectrumHeight + 1; // Hide underflow
        if (y < 0) y = 0;
        if (i === 0) this.ctx.lineTo(-1, y);
        this.ctx.lineTo(i, y);
        if (i === bins.length - 1) this.ctx.lineTo(this.wf_size + 1, y);
    }

    this.ctx.lineTo(this.wf_size + 1, this.spectrumHeight + 1);
    this.ctx.strokeStyle = "#fefefe";
    this.ctx.stroke();

};

Spectrum.prototype.detect_signals = function (fft_data, ctx, canvasHeight, canvasWidth, sr) {
    let i;
    let j;
    // Dynamic signal threshold variables
    let spectrum_y_range = this.max_db - this.min_db;
    let spectrum_threshold_step = spectrum_y_range / 100;
    const noise_level = this.min_db;
    const signal_threshold = this.max_db - (spectrum_y_range - spectrum_threshold_step * this.threshold);
    let in_signal = false;
    let start_signal = 0;
    let end_signal;
    let mid_signal;
    let strength_signal;
    let signal_bw;
    let signal_freq;
    let acc;
    let acc_i;
    let text_x_position;

    /* Clear signals array */
    signals = [];

    for (i = 0; i < fft_data.length; i++) {
        if (!in_signal) {
            if ((fft_data[i] + fft_data[i - 1] + fft_data[i - 2]) / 3.0 > signal_threshold) {
                in_signal = true;
                start_signal = i;
            }
        } /* in_signal == true */ else {
            if ((fft_data[i] + fft_data[i - 1] + fft_data[i - 2]) / 3.0 < signal_threshold) {
                in_signal = false;

                end_signal = i;
                acc = 0;
                acc_i = 0;
                for (j = (start_signal + 0.3 * (end_signal - start_signal)) | 0; j < start_signal + 0.7 * (end_signal - start_signal); j++) {
                    acc = acc + fft_data[j];
                    acc_i = acc_i + 1;
                }

                strength_signal = acc / acc_i;

                /* Find real start of top of signal */
                for (j = start_signal; fft_data[j] - noise_level < 0.75 * (strength_signal - noise_level); j++) {
                    start_signal = j;
                }

                /* Find real end of the top of signal */
                for (j = end_signal; fft_data[j] - noise_level < 0.75 * (strength_signal - noise_level); j--) {
                    end_signal = j;
                }

                mid_signal = start_signal + (end_signal - start_signal) / 2.0;
                let divider = sr / this.minSpanHz;
                this.divider = divider;
                signal_bw = align_symbolrate((end_signal - start_signal) * (sr / 1_000_000) / 1000 / divider);
                if (isNaN(signal_bw) && signal_bw !== 0) break;


                signal_freq = ((mid_signal + 1) / fft_data.length) * 10.0;
                // RX offset for GPSDO
                let rx_offset = 16500;
                let freq = (this.centerHz - (sr / 2)) + (sr * (10 * signal_freq) / 100) - rx_offset;

                let signal = {
                    start: (start_signal / fft_data.length) * canvasWidth,
                    end: (end_signal / fft_data.length) * canvasWidth,
                    top: canvasHeight - (strength_signal / 65536) * canvasHeight,
                    frequency: freq, // symbolrate: 1000.0 * signal_bw * (Number(sr)/this.spanHz) ,
                    symbolrate: 1000.0 * signal_bw,
                    offset: (((Math.round(freq / 250_000) * 250_000) - freq) * -1)/2
                }
                signals.push(signal);

                if (Math.round(tunedBox.freq / 125_000) * 125_000 === Math.round(freq / 125_000) * 125_000) {
                    tunedBox.x = signal.end;
                    tunedBox.freq = freq;
                    tunedBox.minSpanHz = this.minSpanHz;
                    let xText = (mid_signal / fft_data.length) * canvasWidth;
                    drawRxBox(ctx, xText, this.minSpanHz, this.spanHz)
                }

                if (signal_bw !== 0) {
                    text_x_position = (mid_signal / fft_data.length) * canvasWidth;
                    ctx.font = "10px Arial";
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center";
                    ctx.fillText(print_symbolrate(signal_bw), text_x_position, 30);
                    ctx.restore();
                    if (signal.offset > -5_000 && signal.offset < 5_000) {
                        ctx.fillStyle = "Green";
                    }
                    ctx.fillText(Math.round(signal.offset) + "Hz", text_x_position, 15);
                    ctx.fillStyle = "white";
                }
            }
        }
    }

    if (mouse_in_canvas) {
        render_signal_box(ctx, mouse_x, mouse_y, canvasHeight, canvasWidth);
    }
};

Spectrum.prototype.draw_signal_threshold = function (ctx, canvasHeight, canvasWidth) {
    let spectrum_height = (canvasHeight * (this.spectrumPercent / 100));
    // let spectrum_y_range = this.max_db - this.min_db;
    let spectrum_threshold_step = spectrum_height / 100;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'red';
    ctx.setLineDash([5, 3])
    ctx.beginPath();
    ctx.moveTo(0, spectrum_height - spectrum_threshold_step * this.threshold);
    ctx.lineTo(canvasWidth, spectrum_height - spectrum_threshold_step * this.threshold);
    ctx.stroke();
    ctx.setLineDash([0, 0])
};

Spectrum.prototype.drawSpectrum = function (bins) {
    const width = this.ctx.canvas.width;
    const height = this.ctx.canvas.height;
    // Fill with black
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, width, height);

    // FFT averaging
    if (this.averaging > 0) {
        if (!this.binsAverage || this.binsAverage.length !== bins.length) {
            this.binsAverage = Array.from(bins);
        } else {
            for (var i = 0; i < bins.length; i++) {
                this.binsAverage[i] += this.alpha * (bins[i] - this.binsAverage[i]);
            }
        }
        bins = this.binsAverage;
    }

    // Max hold
    if (this.maxHold) {
        if (!this.binsMax || this.binsMax.length !== bins.length) {
            this.binsMax = Array.from(bins);
        } else {
            for (var i = 0; i < bins.length; i++) {
                if (bins[i] > this.binsMax[i]) {
                    this.binsMax[i] = bins[i];
                } else {
                    // Decay
                    this.binsMax[i] = 1.0025 * this.binsMax[i];
                }
            }
        }
    }

    // Do not draw anything if spectrum is not visible
    if (this.ctx_axes.canvas.height < 1) return;

    // Scale for FFT
    this.ctx.save();
    this.ctx.scale(width / this.wf_size, 1);

    // Draw maxhold
    if (this.maxHold) this.drawFFT(this.binsMax);

    // Do autoscale axes
    if (this.autoScale) this.doAutoScale(bins);
    // Draw FFT bins
    this.drawFFT(bins);

    // Restore scale
    this.ctx.restore();
    // drawRxBox(this.ctx)
    // this.drawChannels(this.ctx);

    // Fill scaled path
    this.ctx.fillStyle = this.gradient;
    this.ctx.fill();
    this.draw_signal_threshold(this.ctx, height, width);

    // Copy axes from offscreen canvas
    this.ctx.drawImage(this.ctx_axes.canvas, 0, 0);

    this.detect_signals(bins, this.ctx, height, width, this.spanHz);

};

Spectrum.prototype.detect_movement = function (event) {
    mouse_in_canvas = true;
    // if (mouse_in_canvas) {
    const el_boundingRectangle = this.ctx.canvas.getBoundingClientRect();
    mouse_x = event.clientX - el_boundingRectangle.left;
    mouse_y = event.clientY - el_boundingRectangle.top;
};
Spectrum.prototype.detect_movement_1 = function (event) {
    mouse_in_canvas = false;
};

Spectrum.prototype.updateAxes = function () {
    let i;
    const width = this.ctx_axes.canvas.width;
    const height = this.ctx_axes.canvas.height;

    // Clear axes canvas
    this.ctx_axes.clearRect(0, 0, width, height);

    // Draw axes
    this.ctx_axes.font = "12px sans-serif";
    this.ctx_axes.fillStyle = "white";
    this.ctx_axes.textBaseline = "middle";

    this.ctx_axes.textAlign = "left";
    const step = 10;
    for (i = this.min_db + 10; i <= this.max_db - 10; i += step) {
        const y = height - this.squeeze(i, 0, height);
        this.ctx_axes.fillText(i, 5, y);

        this.ctx_axes.beginPath();
        this.ctx_axes.moveTo(20, y);
        this.ctx_axes.lineTo(width, y);
        this.ctx_axes.strokeStyle = "rgba(200, 200, 200, 0.10)";
        this.ctx_axes.stroke();
    }

    this.ctx_axes.textBaseline = "bottom";
    for (i = 0; i < 11; i++) {
        const x = Math.round(width / 10) * i;

        if (this.spanHz > 0) {
            let adjust = 0;
            if (i === 0) {
                this.ctx_axes.textAlign = "left";
                adjust = 3;
            } else if (i === 10) {
                this.ctx_axes.textAlign = "right";
                adjust = -3;
            } else {
                this.ctx_axes.textAlign = "center";
            }

            let freq = this.centerHz + (this.spanHz / 10) * (i - 5);
            if (this.centerHz + this.spanHz > 1e6) freq = Number(freq / 1e6).toFixed(2) + "M"; else if (this.centerHz + this.spanHz > 1e3) freq = freq / 1e3 + "k";
            this.ctx_axes.fillText(freq, x + adjust, height - 3);
        }

        this.ctx_axes.beginPath();
        this.ctx_axes.moveTo(x, 0);
        this.ctx_axes.lineTo(x, height);
        this.ctx_axes.strokeStyle = "rgba(200, 200, 200, 0.10)";
        this.ctx_axes.stroke();
    }
};

Spectrum.prototype.addData = async function (data) {
    this.databin = new Uint16Array(data);

    if (!this.paused) {
        if (this.databin.length !== this.wf_size) {
            this.wf_size = this.databin.length;
            this.ctx_wf.canvas.width = this.databin.length;
            this.ctx_wf.fillStyle = "black";
            this.ctx_wf.fillRect(0, 0, this.wf.width, this.wf.height);
            this.imagedata = this.ctx_wf.createImageData(this.databin.length, 1);
        }
        this.drawSpectrum(this.databin);
        this.addWaterfallRow(this.databin);
        this.resize();
    }
};

Spectrum.prototype.updateSpectrumRatio = function () {
    this.spectrumHeight = Math.round((this.canvas.height * this.spectrumPercent) / 100.0);

    this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.spectrumHeight);
    for (let i = 0; i < this.colormap.length; i++) {
        const c = this.colormap[this.colormap.length - 1 - i];
        this.gradient.addColorStop(i / this.colormap.length, "rgba(" + c[0] + "," + c[1] + "," + c[2] + ", 1.0)");
    }
};

Spectrum.prototype.resize = function () {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    if (this.canvas.width !== width || this.canvas.height !== height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.updateSpectrumRatio();
    }

    if (this.axes.width !== width || this.axes.height !== this.spectrumHeight) {
        this.axes.width = width;
        this.axes.height = this.spectrumHeight;
        this.updateAxes();
    }
};

Spectrum.prototype.setSpectrumPercent = function (percent) {
    if (percent >= 0 && percent <= 100) {
        this.spectrumPercent = percent;
        this.updateSpectrumRatio();
    }
};

Spectrum.prototype.incrementSpectrumPercent = function () {
    if (this.spectrumPercent + this.spectrumPercentStep <= 100) {
        this.setSpectrumPercent(this.spectrumPercent + this.spectrumPercentStep);
    }
};

Spectrum.prototype.decrementSpectrumPercent = function () {
    if (this.spectrumPercent - this.spectrumPercentStep >= 0) {
        this.setSpectrumPercent(this.spectrumPercent - this.spectrumPercentStep);
    }
};

Spectrum.prototype.toggleColor = function () {
    this.colorindex++;
    if (this.colorindex >= colormaps.length) this.colorindex = 0;
    this.colormap = colormaps[this.colorindex];
    this.updateSpectrumRatio();
};

Spectrum.prototype.setColor = function (index) {
    this.colormap = colormaps[index];
    this.updateSpectrumRatio();
};

Spectrum.prototype.setRange = function (min_db, max_db) {
    console.log(`min: ${min_db} max: ${max_db}`);
    this.min_db = min_db;
    this.max_db = max_db;
    this.updateAxes();
};

Spectrum.prototype.rangeUp = function () {
    this.setRange(this.min_db - 5, this.max_db - 5);
};

Spectrum.prototype.rangeDown = function () {
    this.setRange(this.min_db + 5, this.max_db + 5);
};

Spectrum.prototype.setMinRange = function (min) {
    this.min_db = min;
    this.updateAxes();
};

Spectrum.prototype.setMaxRange = function (max) {
    this.max_db = max;
    this.updateAxes();
};

Spectrum.prototype.rangeDown = function () {
    this.setRange(this.min_db + 5, this.max_db + 5);
};

Spectrum.prototype.rangeIncrease = function () {
    this.setRange(this.min_db - 5, this.max_db + 5);
};

Spectrum.prototype.rangeDecrease = function () {
    if (this.max_db - this.min_db > 10) this.setRange(this.min_db + 5, this.max_db - 5);
};

Spectrum.prototype.doAutoScale = function (bins) {
    const maxbinval = Math.max(...bins);
    const minbinval = Math.min(...bins);

    this.setRange(Math.ceil(minbinval * 0.075) * 10, Math.ceil(maxbinval * 0.075) * 10); // 75% to nearest 10
    this.toggleAutoScale();
};

Spectrum.prototype.setCenterHz = function (hz) {
    this.centerHz = hz;
    this.updateAxes();
};

Spectrum.prototype.setSpanHz = function (hz) {
    this.spanHz = hz;
    this.updateAxes();
};

Spectrum.prototype.setMinSpanHz = function (hz) {
    this.minSpanHz = hz;
};

Spectrum.prototype.setGain = function (gain) {
    this.gain = gain;
    this.updateAxes();
};

Spectrum.prototype.setFps = function (fps) {
    this.fps = fps;
    this.updateAxes();
};
Spectrum.prototype.setThreshold = function (threshold) {
    this.threshold = threshold;
};
Spectrum.prototype.setAveraging = function (num) {
    if (num >= 0) {
        this.averaging = num;
        this.alpha = 2 / (this.averaging + 1);
    }
};

Spectrum.prototype.setTuningStep = function (num) {
    if (num > 0 && num < 10e6) this.tuningStep = num;
    this.log("Step: " + this.tuningStep);
};

Spectrum.prototype.incrementAveraging = function () {
    this.setAveraging(this.averaging + 1);
};

Spectrum.prototype.decrementAveraging = function () {
    if (this.averaging > 0) {
        this.setAveraging(this.averaging - 1);
    }
};

Spectrum.prototype.incrementFrequency = function () {
    const freq = {freq: this.centerHz + this.tuningStep};
    this.ws.send(JSON.stringify(freq));
};

Spectrum.prototype.decrementFrequency = function () {
    const freq = {freq: this.centerHz - this.tuningStep};
    this.ws.send(JSON.stringify(freq));
};

Spectrum.prototype.incrementGain = function () {
    const gain = {gain: this.gain + 1};
    this.ws.send(JSON.stringify(gain));
};

Spectrum.prototype.decrementGain = function () {
    const gain = {gain: this.gain - 1};
    this.ws.send(JSON.stringify(gain));
};

Spectrum.prototype.incrementFps = function () {
    const fps = {fps: this.fps + 5};
    this.ws.send(JSON.stringify(fps));
};

Spectrum.prototype.decrementFps = function () {
    const fps = {fps: this.fps - 5};
    this.ws.send(JSON.stringify(fps));
};

Spectrum.prototype.decrementTuningStep = function () {
    // 1ex, 2.5ex, 5ex
    if (this.tuningStep > 1) {
        let step;
        const firstDigit = parseInt(this.tuningStep / Math.pow(10, parseInt(Math.log10(this.tuningStep))));

        if (firstDigit === 2) step = 2.5; else step = 2;

        this.setTuningStep(this.tuningStep / step);
    }
};

Spectrum.prototype.incrementTuningStep = function () {
    if (this.tuningStep > 0) {
        let step;
        const firstDigit = parseInt(this.tuningStep / Math.pow(10, parseInt(Math.log10(this.tuningStep))));

        if (firstDigit > 1) step = 2; else step = 2.5;

        this.setTuningStep(this.tuningStep * step);
    }
};

Spectrum.prototype.downloadWFImage = function () {
    const link = document.createElement("a");
    const dateString = new Date().toISOString().replace(/:/g, "-");
    link.download = "capture-" + dateString + ".png";
    link.href = this.wf.toDataURL();
    link.click();
};

Spectrum.prototype.setPaused = function (paused) {
    this.paused = paused;
};

Spectrum.prototype.togglePaused = function () {
    this.setPaused(!this.paused);
};

Spectrum.prototype.setMaxHold = function (maxhold) {
    this.maxHold = maxhold;
    this.binsMax = undefined;
};

Spectrum.prototype.setAutoScale = function (autoscale) {
    this.autoScale = autoscale;
};

Spectrum.prototype.toggleMaxHold = function () {
    this.setMaxHold(!this.maxHold);
};

Spectrum.prototype.toggleAutoScale = function () {
    this.setAutoScale(!this.autoScale);
};

Spectrum.prototype.log = function (message) {
    this.logger.innerHTML = message + "<br/>";
    this.logger.scrollTop = this.logger.scrollHeight;
};

Spectrum.prototype.setWebSocket = function (ws) {
    this.ws = ws;
};

Spectrum.prototype.toggleFullscreen = function () {
    if (!this.fullscreen) {
        if (this.canvas.requestFullscreen) {
            this.canvas.requestFullscreen();
        } else if (this.canvas.mozRequestFullScreen) {
            this.canvas.mozRequestFullScreen();
        } else if (this.canvas.webkitRequestFullscreen) {
            this.canvas.webkitRequestFullscreen();
        } else if (this.canvas.msRequestFullscreen) {
            this.canvas.msRequestFullscreen();
        }
        this.fullscreen = true;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        this.fullscreen = false;
    }
};
// Keyboard shortcuts should have a helper popup...
Spectrum.prototype.onKeypress = function (e) {
    switch (e.key) {
        case " ":
            this.togglePaused();
            break;
        case "S":
            this.toggleFullscreen();
            break;
        case "c":
            this.toggleColor();
            break;
        case "ArrowUp":
            this.rangeUp();
            break;
        case "ArrowDown":
            this.rangeDown();
            break;
        case "ArrowLeft":
            this.rangeDecrease();
            break;
        case "ArrowRight":
            this.rangeIncrease();
            break;
        case "W":
            this.incrementSpectrumPercent();
            break;
        case "w":
            this.decrementSpectrumPercent();
            break;
        case "+":
            this.incrementAveraging();
            break;
        case "-":
            this.decrementAveraging();
            break;
        case "m":
            this.toggleMaxHold();
            break;
        case "a":
            this.toggleAutoScale();
            break;
        case "f":
            this.decrementFrequency();
            break;
        case "F":
            this.incrementFrequency();
            break;
        case "g":
            this.decrementGain();
            break;
        case "G":
            this.incrementGain();
            break;
        case "p":
            this.decrementFps();
            break;
        case "P":
            this.incrementFps();
            break;
        case "t":
            this.decrementTuningStep();
            break;
        case "T":
            this.incrementTuningStep();
            break;
        case "d":
            this.downloadWFImage();
            break;
    }
};
// we could use drag to change frequency...
Spectrum.prototype.onDrag = function (event) {
    console.log(event);

    let dragStart = {
        x: event.pageX - this.canvas.offsetLeft, y: event.pageY - this.canvas.offsetTop,
    };
    console.log(dragStart);
};

Spectrum.prototype.on_canvas_click = function (ctx) {
    // let magicSpaceUnderSignal = canvasHeight * (4 / 8);
    // let magicSpaceAboveSignal = canvasHeight * (1.59 / 8);

    const url = localPage ? 'http://127.0.0.1:1880' : '';
    console.log(`SR ${canvasClickBW} downlink ${downlink}`)

    /* we clicked on a signal... */
    if (downlink !== undefined && canvasClickBW !== undefined && busy) {
        // check if frequency span clicked is close to an expected channel
        const tolerance_35ks = 0.010;
        const tolerance_66ks = 0.010;
        const tolerance_125ks = 0.015;
        const tolerance_250ks = 0.020;
        const tolerance_333ks = 0.040;
        const tolerance_500ks = 0.090;
        const tolerance_1000ks = 0.1;
        const tolerance_1500ks = 0.15;
        if (Math.abs(canvasClickBW - 0.033) < tolerance_35ks) {
            canvasClickBW = 0.033;
        }
        if (Math.abs(canvasClickBW -  0.066) < tolerance_66ks) {
            canvasClickBW = 0.066;
        }
        if (Math.abs(canvasClickBW - 0.125) < tolerance_125ks) {
            canvasClickBW = 0.125;
        }
        if (Math.abs(canvasClickBW - 0.25) < tolerance_250ks) {
            canvasClickBW = 0.25;
        }
        if (Math.abs(canvasClickBW - 0.333) < tolerance_333ks) {
            canvasClickBW = 0.333;
        }
        if (Math.abs(canvasClickBW - 0.5) < tolerance_500ks) {
            canvasClickBW = 0.5;
        }
        if (Math.abs(canvasClickBW - 1) < tolerance_1000ks) {
            canvasClickBW = 1;
        }
        if (Math.abs(canvasClickBW - 1.5) < tolerance_1500ks) {
            canvasClickBW = 1.5;
        }
        if (canvasClickBW > 2) {
            canvasClickBW = 2;
        }
        fetch(`${url}/setLocalRx?` + new URLSearchParams({
            downlink: downlink, SR: canvasClickBW
            // channel: channelClicked,
        }));
        setRxClickState(this.minSpanHz, this.spanHz);
    }
}

function Spectrum(id, options) {
    // Handle options
    // console.dir(options)
    this.centerHz = options && options.centerHz ? options.centerHz : 0;
    this.spanHz = options && options.spanHz ? options.spanHz : 0;
    this.gain = options && options.gain ? options.gain : 0;
    this.fps = options && options.fps ? options.fps : 50;
    this.wf_size = options && options.wf_size ? options.wf_size : 0;
    this.wf_rows = options && options.wf_rows ? options.wf_rows : 2048;
    this.spectrumPercent = options && options.spectrumPercent ? options.spectrumPercent : 25;
    this.spectrumPercentStep = options && options.spectrumPercentStep ? options.spectrumPercentStep : 5;
    this.averaging = options && options.averaging ? options.averaging : 5;
    this.maxHold = options && options.maxHold ? options.maxHold : false;
    this.autoScale = options && options.autoScale ? options.autoScale : false;
    this.minSpanHz = options && options.minSpanHz ? options.minSpanHz : 560000;

    this.logger = options && options.logger ? document.getElementById(options.logger) : document.getElementById("log");

    // Setup state
    this.paused = false;
    this.fullscreen = false;
    this.min_db = options && options.min_db ? options.min_db : 420;
    this.max_db = options && options.max_db ? options.max_db : 490;
    this.threshold = options && options.threshold ? options.threshold : 30;
    this.spectrumHeight = 0;
    this.tuningStep = 100000;
    this.maxbinval = 0;
    this.minbinval = 0;
    this.wfrowcount = 1;
    this.divider = 1;

    // Colors
    this.colorindex = 0;
    this.colormap = colormaps[options.color];

    // Create main canvas and adjust dimensions to match actual
    this.canvas = document.getElementById(id);
    this.canvas.height = this.canvas.clientHeight;
    this.canvas.width = this.canvas.clientWidth;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Click to tune support
    this.ctx.canvas.addEventListener("click", () => this.on_canvas_click(this.ctx), false);

    // Create offscreen canvas for axes
    this.axes = document.createElement("canvas");
    this.axes.height = 1; // Updated later
    this.axes.width = this.canvas.width;
    this.ctx_axes = this.axes.getContext("2d");

    // Create offscreen canvas for waterfall
    this.wf = document.createElement("canvas");
    this.wf.height = this.wf_rows;
    this.wf.width = this.wf_size;
    this.ctx_wf = this.wf.getContext("2d");

    // Trigger first render
    this.setAveraging(this.averaging);
    this.updateSpectrumRatio();
    this.resize();
}