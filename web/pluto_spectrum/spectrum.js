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

/**
 * @function setRxClickState
 * @memberof undefined
 * @description Sets the click state for the receiver. It modifies the state of the tunedBox and saves it into local storage if storage is supported.
 * @param {number} minSpan - Minimum span of the state.
 * @param {number} spanHz - Span of the state in Hertz's.
 * @returns {void}
 */
function setRxClickState(minSpan, spanHz) {
    let scale = minSpan / spanHz;
    tunedBox = clickBox;
    tunedBox.minSpanHz = minSpan;
    tunedBox.spanHz = spanHz;
    tunedBox.w = clickBox.w * scale * (spanHz / minSpan);
    if (storageSupport) {
        localStorage.tunedBox = JSON.stringify(tunedBox);
    }
}

/**
 * @function drawRxBox
 * @memberof undefined
 * @description Draw the receiver's box context with filled rectangle and frequency text. It calculates the scale and box scale in addition to setting the fill style for the context.
 * @param {Object} ctx - The canvas context.
 * @param {number} xText - The x-coordinate of the text.
 * @param {number} minSpan - Minimum span of the box.
 * @param {number} spanHz - Span of the box in Hertzs.
 * @returns {void}
 */
function drawRxBox(ctx, xText, minSpan, spanHz) {
    let scale = minSpan / spanHz;
    let boxScale = tunedBox?.spanHz / tunedBox?.minSpanHz;
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(tunedBox.x, tunedBox.y, tunedBox.w * scale * boxScale, tunedBox.h);
    ctx.fillStyle = "rgb(32,246,137)";
    ctx.fillText(`${(tunedBox.freq / 1_000_000).toFixed(3)}`, xText, 50);
}

/**
 * @function render_signal_box
 * @memberof Spectrum.prototype
 * @description Renders the signal box on the canvas. It loops through each signal and determines if the mouse_x is within the start and end of the signal, set the box width then draw the canvas accordingly.
 * @param {Object} ctx - The canvas context.
 * @param {number} mouse_x - The x-coordinate of the mouse click.
 * @param {number} mouse_y - The y-coordinate of the mouse click.
 * @param {number} canvasHeight - The height of the canvas.
 * @param {number} canvasWidth - The width of the canvas.
 * @param {Array} signals - The list of signals.
 * @returns {void}
 */
Spectrum.prototype.render_signal_box = function (ctx, mouse_x, mouse_y, canvasHeight, canvasWidth, signals) {
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

/**
 * @function print_symbol_rate
 * @memberof Spectrum.prototype
 * @description This method converts the given symbol rate into a number suitable for display. If the rate is less than 0.7, it is rounded to the nearest thousand and appended with "KS". Otherwise, it is rounded to one decimal place and appended with "MS".
 * @param {number} symrate - The symbol rate to print.
 * @returns {string} The symbol rate formatted for display.
 */
Spectrum.prototype.print_symbol_rate = function (symrate) {
    if (symrate < 0.7) {
        return Math.round(symrate * 1000) + "KS";
    } else {
        return Math.round(symrate * 10) / 10 + "MS";
    }
}

function align_symbol_rate(width) {
    return round(width, 0.001)
}

function round(value, step) {
    step || (step = 1.0);
    const inv = 1.0 / step;
    return Math.round(value * inv) / inv;
}

/**
 * @function squeeze
 * @memberof Spectrum.prototype
 * @description This function is used to manipulate the value within the provided range [out_min, out_max], based on the min_db and max_db values from the Spectrum context. The value is squeezed within the range, such that if it's less than or equal to min_db, the function returns out_min, if it's greater than or equal to max_db, the function returns out_max. Otherwise, the function returns a calculated value obtained by using the input value, min_db, max_db, and out_max.
 *
 * @param {number} value - The Input value that needs to be squeezed within the range.
 * @param {number} out_min - The minimum limit of the range into which input value should be squeezed.
 * @param {number} out_max - The maximum limit of the range into which input value should be squeezed.
 *
 * @returns {number} - Returns the squeezed value i.e., If the value is outside the Spectrum's min_db and max_db, return the corresponding out_min and out_max, respectively. If within the range, return the calculated value.
 */
Spectrum.prototype.squeeze = function (value, out_min, out_max) {
    if (value <= this.min_db) return out_min; else if (value >= this.max_db) return out_max; else return Math.round(((value - this.min_db) / (this.max_db - this.min_db)) * out_max);
};

/**
 * @function rowToImageData
 * @memberof Spectrum.prototype
 * @description Converts a row of binary data into image data for visualization using the instance's colormap.
 *
 * @param {Array} bins - An array of binary data representing a row.
 * @returns {undefined} This method does not return anything. It updates the instance's `imagedata` property.
 */
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

/**
 * @function addWaterfallRow
 * @memberof Spectrum.prototype
 * @description Adds a row to the waterfall display. Takes a bin of data, moves the existing waterfall display one row down, and draws the new data row at the top. Also applies a timestamp to every 100th row and scales the FFT canvas to fit the display.
 *
 * @param {array} bins - The array of data to add to the waterfall display.
 * @returns {void}
 */
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
/**
 * @function drawFFT
 * @memberof Spectrum.prototype
 * @description Draws the Fast Fourier Transformation spectrum based on the given bins data, making manipulations on object's context (ctx) by setting paths and applying styles.
 *
 * @param {Array} bins - Array containing the FFT data to be visualized in the Spectrum.
 * @returns {void}
 */
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
/**
 * @function detect_signals
 * @memberof Spectrum.prototype
 * @description Method to detect signals from provided Fast Fourier Transform (FFT) data and draw indicators for these signals on the provided canvas context.
 *
 * @param fft_data {Array<number>} Array of FFT data.
 * @param ctx {Object} The 2D rendering context for the drawing surface of a canvas.
 * @param canvasHeight {number} The height of the canvas on which signals will be drawn.
 * @param canvasWidth {number} The width of the canvas on which signals will be drawn.
 * @param sr {number} The sample rate.
 *
 * @returns {void}
 */
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
    let signals = [];

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
                signal_bw = align_symbol_rate((end_signal - start_signal) * (sr / 1_000_000) / 1000 / divider);
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
                    offset: (((Math.round(freq / 250_000) * 250_000) - freq) * -1) / 2
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
                    ctx.fillText(this.print_symbol_rate(signal_bw), text_x_position, 30);
                    // ctx.restore();
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
        this.render_signal_box(ctx, mouse_x, mouse_y, canvasHeight, canvasWidth, signals);
    }
};
/**
 * @function draw_signal_threshold
 * @memberof Spectrum.prototype
 * @description Draws the signal threshold on a Spectrum instance's canvas.
 *
 * @param {CanvasRenderingContext2D} ctx - The rendering context of the Canvas where the signal threshold will be drawn.
 * @param {number} canvasHeight - The height of the Canvas.
 * @param {number} canvasWidth - The width of the Canvas.
 *
 * @returns {void}
 */
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
/**
 * @function drawSpectrum
 * @memberof Spectrum.prototype
 * @description A function that draws a spectrum based on the calculated Fast Fourier Transform (FFT) bins. The spectrum drawing includes the application of FFT averaging and max hold, as well as suitably scaling the FFT drawn on the canvas. It also facilitates the drawing of FFT bins, signal thresholds and copying the axes from an offscreen canvas.
 *
 * @param {Array} bins - An array of FFT bins that will be drawn on the Spectrum.
 * @returns {void}
 */
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
/**
 * @function detect_movement
 * @memberof Spectrum.prototype
 * @description Calculates the mouse pointer's coordinates within the canvas
 * represented by the Spectrum object when a mouse event occurs in the canvas.
 * It updates the 'mouse_x' and 'mouse_y' global variables with the mouse pointer's
 * position relative to the canvas.
 *
 * @param {MouseEvent} event - The mouse event containing the pointer's current
 * document-relative coordinates.
 * @returns {void}
 */
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
/**
 * @function updateAxes
 * @memberof Spectrum.prototype
 * @description This function updates the axes of the Spectrum object. It clears the existing axes and plots new ones based on the current state (i.e., current frequency span, center frequency, and dB range). It adjusts the axes labels (dB values on the y-axis and frequency labels on the x-axis) according to the current state. Note that the dB range is from min_db to max_db (defined elsewhere), and the frequency range is determined by centerHz and spanHz (also defined elsewhere).
 *
 * @returns {undefined} The function does not return anything.
 */
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
/**
 * @function addData
 * @memberof Spectrum.prototype
 * @description Adds data to Spectrum and draw data on waveform as well as update the waterfall row. It depends on the pause state and if data length mismatches, the waveform size will be updated. The waveform's base canvas width would be adjusted as per data length and its 2D context fillstyle would be configured to black color. An image data for the waveform would be created considering data length as image width and 1 as its height.
 *
 * @param {Uint16Array} data - The data to add in Spectrum.
 * @returns {undefined}
 */
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
/**
 * @function updateSpectrumRatio
 * @memberof Spectrum
 * @description Updates the spectrumHeight and gradient properties based on the current state.
 *
 * @returns {undefined}
 */
Spectrum.prototype.updateSpectrumRatio = function () {
    this.spectrumHeight = Math.round((this.canvas.height * this.spectrumPercent) / 100.0);

    this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.spectrumHeight);
    for (let i = 0; i < this.colormap.length; i++) {
        const c = this.colormap[this.colormap.length - 1 - i];
        this.gradient.addColorStop(i / this.colormap.length, "rgba(" + c[0] + "," + c[1] + "," + c[2] + ", 1.0)");
    }
};
/**
 * @function resize
 * @memberof Spectrum
 * @description Updates the canvas and axes sizes if they have changed, and calls to update the spectrum ratio.
 *
 * @returns {undefined}
 */
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
/**
 * @function setSpectrumPercent
 * @memberof Spectrum
 * @description Sets the spectrumPercent property and calls to update the spectrum ratio.
 * @param {number} percent - The percent value to set.
 *
 * @returns {undefined}
 */
Spectrum.prototype.setSpectrumPercent = function (percent) {
    if (percent >= 0 && percent <= 100) {
        this.spectrumPercent = percent;
        this.updateSpectrumRatio();
    }
};
/**
 * @function incrementSpectrumPercent
 * @memberof Spectrum
 * @description Increases the spectrumPercent by the spectrumPercentStep while making sure it doesn't exceed 100.
 *
 * @returns {undefined}
 */
Spectrum.prototype.incrementSpectrumPercent = function () {
    if (this.spectrumPercent + this.spectrumPercentStep <= 100) {
        this.setSpectrumPercent(this.spectrumPercent + this.spectrumPercentStep);
    }
};
/**
 * @function decrementSpectrumPercent
 * @memberof Spectrum
 * @description Decreases the spectrumPercent by the spectrumPercentStep while making sure it doesn't go below 0.
 *
 * @returns {undefined}
 */
Spectrum.prototype.decrementSpectrumPercent = function () {
    if (this.spectrumPercent - this.spectrumPercentStep >= 0) {
        this.setSpectrumPercent(this.spectrumPercent - this.spectrumPercentStep);
    }
};
/**
 * @function toggleColor
 * @memberof Spectrum
 * @description Toggles the colormap between different sets and updates the spectrum ratio.
 *
 * @returns {undefined}
 */
Spectrum.prototype.toggleColor = function () {
    this.colorindex++;
    if (this.colorindex >= colormaps.length) this.colorindex = 0;
    this.colormap = colormaps[this.colorindex];
    this.updateSpectrumRatio();
};
/**
 * @function setColor
 * @memberof Spectrum
 * @description Sets the colormap to a specific set and updates the spectrum ratio.
 * @param {number} index - The index of the colormap to set.
 *
 * @returns {undefined}
 */
Spectrum.prototype.setColor = function (index) {
    this.colormap = colormaps[index];
    this.updateSpectrumRatio();
};
/**
 * @function setRange
 * @memberof Spectrum
 * @description Sets the min_db and max_db properties and calls to update the axes.
 * @param {number} min_db - The minimum db to set.
 * @param {number} max_db - The maximum db to set.
 *
 * @returns {undefined}
 */
Spectrum.prototype.setRange = function (min_db, max_db) {
    console.log(`min: ${min_db} max: ${max_db}`);
    this.min_db = min_db;
    this.max_db = max_db;
    this.updateAxes();
};
/**
 * @function rangeUp
 * @memberof Spectrum
 * @description Decreases the db range and updates it.
 *
 * @returns {undefined}
 */
Spectrum.prototype.rangeUp = function () {
    this.setRange(this.min_db - 5, this.max_db - 5);
};
/**
 * @function rangeDown
 * @memberof Spectrum
 * @description Increases the db range and updates it.
 *
 * @returns {undefined}
 */
Spectrum.prototype.rangeDown = function () {
    this.setRange(this.min_db + 5, this.max_db + 5);
};
/**
 * @function setMinRange
 * @memberof Spectrum
 * @description Sets the min_db property and calls to update the axes.
 * @param {number} min - The minimum db to set.
 *
 * @returns {undefined}
 */
Spectrum.prototype.setMinRange = function (min) {
    this.min_db = min;
    this.updateAxes();
};
/**
 * @function setMaxRange
 * @memberof Spectrum
 * @description Sets the max_db property and calls to update the axes.
 * @param {number} max - The maximum db to set.
 *
 * @returns {undefined}
 */
Spectrum.prototype.setMaxRange = function (max) {
    this.max_db = max;
    this.updateAxes();
};
/**
 * @function rangeDown
 * @memberof Spectrum
 * @description Increases the db range and updates it.
 *
 * @returns {undefined}
 */
Spectrum.prototype.rangeDown = function () {
    this.setRange(this.min_db + 5, this.max_db + 5);
};
/**
 * @function rangeIncrease
 * @memberof Spectrum
 * @description Increases both the minimum and maximum db range.
 *
 * @returns {undefined}
 */
Spectrum.prototype.rangeIncrease = function () {
    this.setRange(this.min_db - 5, this.max_db + 5);
};
/**
 * @function rangeDecrease
 * @memberof Spectrum
 * @description Decreases both the minimum and maximum db range if the difference between them is greater than 10.
 *
 * @returns {undefined}
 */
Spectrum.prototype.rangeDecrease = function () {
    if (this.max_db - this.min_db > 10) this.setRange(this.min_db + 5, this.max_db - 5);
};
/**
 * @function doAutoScale
 * @memberof Spectrum
 * @description Sets the db range based on the provided bins and toggles auto scale.
 * @param {Array<number>} bins - The bins to calculate the range from.
 *
 * @returns {undefined}
 */
Spectrum.prototype.doAutoScale = function (bins) {
    const maxbinval = Math.max(...bins);
    const minbinval = Math.min(...bins);

    this.setRange(Math.ceil(minbinval * 0.075) * 10, Math.ceil(maxbinval * 0.075) * 10); // 75% to nearest 10
    this.toggleAutoScale();
};
/**
 * @function setCenterHz
 * @memberof Spectrum
 * @description Sets the centerHz property and calls to update the axes.
 * @param {number} hz - The frequency in Hertz to set as center.
 *
 * @returns {undefined}
 */
Spectrum.prototype.setCenterHz = function (hz) {
    this.centerHz = hz;
    this.updateAxes();
};
/**
 * @function setSpanHz
 * @memberof Spectrum
 * @description Sets the spanHz property and calls to update the axes.
 * @param {number} hz - The frequency span in Hertz to set.
 *
 * @returns {undefined}
 */
Spectrum.prototype.setSpanHz = function (hz) {
    this.spanHz = hz;
    this.updateAxes();
};
/**
 * @function setMinSpanHz
 * @memberof Spectrum
 * @description Sets the minSpanHz property.
 * @param {number} hz - The minimum span frequency in Hertz to set.
 *
 * @returns {undefined}
 */
Spectrum.prototype.setMinSpanHz = function (hz) {
    this.minSpanHz = hz;
};
/**
 * @function setGain
 * @memberof Spectrum
 * @description Sets the gain property and calls to update the axes.
 * @param {number} gain - The gain value to set.
 *
 * @returns {undefined}
 */
Spectrum.prototype.setGain = function (gain) {
    this.gain = gain;
    this.updateAxes();
};
/**
 * @function setFps
 * @memberof Spectrum
 * @description Sets the fps property and calls to update the axes.
 * @param {number} fps - The frames per second value to set.
 *
 * @returns {undefined}
 */
Spectrum.prototype.setFps = function (fps) {
    this.fps = fps;
    this.updateAxes();
};
/**
 * @function setThreshold
 * @memberof Spectrum
 * @description Sets the threshold property.
 * @param {number} threshold - The threshold value to set.
 *
 * @returns {undefined}
 */
Spectrum.prototype.setThreshold = function (threshold) {
    this.threshold = threshold;
};
/**
 * @function setAveraging
 * @memberof Spectrum
 * @description Sets the averaging properties, keeping their values above 0.
 * @param {number} num - The averaging value to set.
 *
 * @returns {undefined}
 */
Spectrum.prototype.setAveraging = function (num) {
    if (num >= 0) {
        this.averaging = num;
        this.alpha = 2 / (this.averaging + 1);
    }
};
/**
 * @function setTuningStep
 * @memberof Spectrum
 * @description Sets the tuningStep property, keeping its value between 0 and 10e6.
 * @param {number} num - The tuning step value to set.
 *
 * @returns {undefined}
 */
Spectrum.prototype.setTuningStep = function (num) {
    if (num > 0 && num < 10e6) this.tuningStep = num;
    this.log("Step: " + this.tuningStep);
};
/**
 * @function incrementAveraging
 * @memberof Spectrum
 * @description Increases the averaging property.
 *
 * @returns {undefined}
 */
Spectrum.prototype.incrementAveraging = function () {
    this.setAveraging(this.averaging + 1);
};
/**
 * @function decrementAveraging
 * @memberof Spectrum
 * @description Decreases the averaging property while making sure it doesn't go below 0.
 *
 * @returns {undefined}
 */
Spectrum.prototype.decrementAveraging = function () {
    if (this.averaging > 0) {
        this.setAveraging(this.averaging - 1);
    }
};
/**
 * @function incrementFrequency
 * @memberof Spectrum
 * @description Increments the centerHz by the tuningStep and sends the updated frequency over websocket.
 *
 * @returns {undefined}
 */
Spectrum.prototype.incrementFrequency = function () {
    const freq = {freq: this.centerHz + this.tuningStep};
    this.ws.send(JSON.stringify(freq));
};
/**
 * @function decrementFrequency
 * @memberof Spectrum
 * @description Decreases the centerHz by the tuningStep and sends the updated frequency over websocket.
 *
 * @returns {undefined}
 */
Spectrum.prototype.decrementFrequency = function () {
    const freq = {freq: this.centerHz - this.tuningStep};
    this.ws.send(JSON.stringify(freq));
};
/**
 * @function incrementGain
 * @memberof Spectrum
 * @description Increments the gain property and sends the updated gain over websocket.
 *
 * @returns {undefined}
 */
Spectrum.prototype.incrementGain = function () {
    const gain = {gain: this.gain + 1};
    this.ws.send(JSON.stringify(gain));
};
/**
 * @function decrementGain
 * @memberof Spectrum
 * @description Decreases the gain property and sends the updated gain over websocket.
 *
 * @returns {undefined}
 */
Spectrum.prototype.decrementGain = function () {
    const gain = {gain: this.gain - 1};
    this.ws.send(JSON.stringify(gain));
};
/**
 * @function incrementFps
 * @memberof Spectrum
 * @description Increments the fps property by 5 and sends the updated fps over websocket.
 *
 * @returns {undefined}
 */
Spectrum.prototype.incrementFps = function () {
    const fps = {fps: this.fps + 5};
    this.ws.send(JSON.stringify(fps));
};
/**
 * @function decrementFps
 * @memberof Spectrum
 * @description Decreases the fps property by 5 and sends the updated fps over websocket.
 *
 * @returns {undefined}
 */
Spectrum.prototype.decrementFps = function () {
    const fps = {fps: this.fps - 5};
    this.ws.send(JSON.stringify(fps));
};
/**
 * @function decrementTuningStep
 * @memberof Spectrum
 * @description Decrements the tuningStep property, using a dynamic decrement value based on the current tuningStep value.
 *
 * @returns {undefined}
 */
Spectrum.prototype.decrementTuningStep = function () {
    // 1ex, 2.5ex, 5ex
    if (this.tuningStep > 1) {
        let step;
        const firstDigit = parseInt(this.tuningStep / Math.pow(10, parseInt(Math.log10(this.tuningStep))));

        if (firstDigit === 2) step = 2.5; else step = 2;

        this.setTuningStep(this.tuningStep / step);
    }
};
/**
 * @function incrementTuningStep
 * @memberof Spectrum
 * @description Increments the tuningStep property, using a dynamic increment value based on the current tuningStep value.
 *
 * @returns {undefined}
 */
Spectrum.prototype.incrementTuningStep = function () {
    if (this.tuningStep > 0) {
        let step;
        const firstDigit = parseInt(this.tuningStep / Math.pow(10, parseInt(Math.log10(this.tuningStep))));

        if (firstDigit > 1) step = 2; else step = 2.5;

        this.setTuningStep(this.tuningStep * step);
    }
};
/**
 * @function downloadWFImage
 * @memberof Spectrum
 * @description Downloads the wf as an image.
 *
 * @returns {undefined}
 */
Spectrum.prototype.downloadWFImage = function () {
    const link = document.createElement("a");
    const dateString = new Date().toISOString().replace(/:/g, "-");
    link.download = "capture-" + dateString + ".png";
    link.href = this.wf.toDataURL();
    link.click();
};
/**
 * @function downloadCanvasImage
 * @memberof Spectrum.prototype
 * @description Downloads the canvas image with a unique filename in PNG format.
 *
 * @returns {void}
 */
Spectrum.prototype.downloadCanvasImage = function () {
    const link = document.createElement("a");
    const dateString = new Date().toISOString().replace(/:/g, "-");
    link.download = "capture-" + dateString + ".png";
    link.href = this.canvas.toDataURL();
    link.click();
};
/**
 * @function setPaused
 * @memberof Spectrum.prototype
 * @description Sets the pause state of the spectrum visual.
 *
 * @param {boolean} paused - The state of pause to be set for the spectrum.
 * @returns {void}
 */
Spectrum.prototype.setPaused = function (paused) {
    this.paused = paused;
};
/**
 * @function togglePaused
 * @memberof Spectrum.prototype
 * @description Toggles the pause state of the spectrum visual.
 *
 * @returns {void}
 */
Spectrum.prototype.togglePaused = function () {
    this.setPaused(!this.paused);
};
/**
 * @function setMaxHold
 * @memberof Spectrum.prototype
 * @description Sets the maximum hold value for the spectrum.
 *
 * @param {number} maxhold - The maximum hold value to be set.
 * @returns {void}
 */
Spectrum.prototype.setMaxHold = function (maxhold) {
    this.maxHold = maxhold;
    this.binsMax = undefined;
};
/**
 * @function setAutoScale
 * @memberof Spectrum.prototype
 * @description Sets the autoscale property of the spectrum.
 *
 * @param {boolean} autoscale - The autoscale setting to be applied to the spectrum.
 * @returns {void}
 */
Spectrum.prototype.setAutoScale = function (autoscale) {
    this.autoScale = autoscale;
};
/**
 * @function toggleMaxHold
 * @memberof Spectrum.prototype
 * @description Toggles the maximum hold value for the spectrum.
 *
 * @returns {void}
 */
Spectrum.prototype.toggleMaxHold = function () {
    this.setMaxHold(!this.maxHold);
};
/**
 * @function toggleAutoScale
 * @memberof Spectrum
 * @description Toggles the auto-scale functionality. If auto-scale is currently enabled, it will be disabled and vice versa.
 * @returns {undefined} Returns nothing
 */
Spectrum.prototype.toggleAutoScale = function () {
    this.setAutoScale(!this.autoScale);
};
Spectrum.prototype.toggleAutoScale = function () {
    this.setAutoScale(!this.autoScale);
};
/**
 * @function log
 * @memberof Spectrum.prototype
 * @description Logs a given message inside the logger element, adding it as HTML content and automatically scrolling to the bottom of the logger. It assumes that `this.logger` is a reference to an HTML element.
 *
 * @param {string} message - The message to be logged.
 * @returns {void}
 */
Spectrum.prototype.log = function (message) {
    this.logger.innerHTML = message + "<br/>";
    this.logger.scrollTop = this.logger.scrollHeight;
};
/**
 * @function setWebSocket
 * @memberof Spectrum
 * @description Sets the WebSocket connection to be used by the Spectrum instance
 *
 * @param {Object} ws - The WebSocket connection to be set.
 * @returns {void}
 */
Spectrum.prototype.setWebSocket = function (ws) {
    this.ws = ws;
};
/**
 * @function toggleFullscreen
 * @memberof Spectrum.prototype
 * @description
 * This function toggles the full-screen mode for the Spectrum instance.
 * If the Spectrum is currently not in full-screen, it enables full-screen mode and if it is in full-screen mode, it disables the full-screen mode.
 * The function also toggles the value of Spectrum's "fullscreen" state.
 *
 * @returns {void} This function does not return any value.
 */
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
/**
 * @function onKeypress
 * @memberof Spectrum.prototype
 * @description onKeypress event handler.
 *
 * @returns {void}
 */
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
        case "D":
            this.downloadCanvasImage();
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


/**
 * @function on_canvas_click
 * @memberof Spectrum.prototype
 * @description Event handler for canvas click.
 *
 * @returns {void}
 */
Spectrum.prototype.on_canvas_click = function () {
    // let magicSpaceUnderSignal = canvasHeight * (4 / 8);
    // let magicSpaceAboveSignal = canvasHeight * (1.59 / 8);

    const url = localPage ? 'http://127.0.0.1:1880' : '';
    console.log(`SR ${canvasClickBW} downlink ${downlink}`)

    /* we clicked on a signal... */
    if (downlink !== undefined && canvasClickBW !== undefined && busy) {
        const lookupTable = [
            {symbol_rate: 0.033, tolerance: 0.010},
            {symbol_rate: 0.066, tolerance: 0.010},
            {symbol_rate: 0.125, tolerance: 0.015},
            {symbol_rate: 0.250, tolerance: 0.020},
            {symbol_rate: 0.333, tolerance: 0.040},
            {symbol_rate: 0.5, tolerance: 0.090},
            {symbol_rate: 1, tolerance: 0.1},
            {symbol_rate: 1.5, tolerance: 0.15},
            {symbol_rate: 2, tolerance: 0}
        ];

        for (let {symbol_rate, tolerance} of lookupTable) {
            if (Math.abs(canvasClickBW - symbol_rate) < tolerance) {
                canvasClickBW = symbol_rate;
                break;
            }
        }

        const queryParams = new URLSearchParams({
            downlink: downlink, SR: canvasClickBW
        });

        fetch(`${url}/setLocalRx?${queryParams}`).then(() => {
        });
        setRxClickState(this.minSpanHz, this.spanHz);
    }
}

/**
 * @function handleOptions
 * @memberof Spectrum.prototype
 * @description handleOptions helper
 *
 * @returns {void}
 */
Spectrum.prototype.handleOptions = function (options) {
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
    this.min_db = options && options.min_db ? options.min_db : 420;
    this.max_db = options && options.max_db ? options.max_db : 490;
    this.threshold = options && options.threshold ? options.threshold : 30;
};

/**
 * @function setupCanvas
 * @memberof Spectrum.prototype
 * @description setupCanvas helper
 *
 * @returns {void}
 */
Spectrum.prototype.setupCanvas = function (id) {
    this.canvas = document.getElementById(id);
    this.canvas.height = this.canvas.clientHeight;
    this.canvas.width = this.canvas.clientWidth;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.canvas.addEventListener("click", () => this.on_canvas_click(this.ctx), false);

    this.axes = document.createElement("canvas");
    this.axes.height = 1; // Updated later
    this.axes.width = this.canvas.width;
    this.ctx_axes = this.axes.getContext("2d");

    this.wf = document.createElement("canvas");
    this.wf.height = this.wf_rows;
    this.wf.width = this.wf_size;
    this.ctx_wf = this.wf.getContext("2d");
};


/**
 * Initializes the Spectrum object.
 *
 * @param {string} id - The ID of the container element for the Spectrum.
 * @param {Object} options - The options to customize the Spectrum.
 */
function Spectrum(id, options) {
    this.handleOptions(options);

    // Setup state
    this.paused = false;
    this.fullscreen = false;
    this.spectrumHeight = 0;
    this.tuningStep = 100000;
    this.wfrowcount = 1;
    // Colors
    this.colorindex = 0;
    this.colormap = colormaps[options.color];
    this.setupCanvas(id);
    // Trigger first render
    this.setAveraging(this.averaging);
    this.updateSpectrumRatio();
    this.resize();
}