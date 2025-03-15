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

// Most of these are from the BATC spectrum code, "internet_spectrum" folder, glued onto this spectrum.
// const beacon_strength = 0;
let mouse_in_canvas = false;
let mouse_x = 0;
let mouse_y = 0;
let background_colour = "black";

function align_symbol_rate(width) {
  return round(width, 0.001);
}

function round(value, step) {
  step || (step = 1.0);
  const inv = 1.0 / step;
  return Math.round(value * inv) / inv;
}

/**
 * Initializes the Spectrum object.
 *
 * @param {string} id - The ID of the container element for the Spectrum.
 * @param {Object} options - The options to customize the Spectrum.
 */
class Spectrum {
  constructor(id, options) {
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
  /**
   * @function rangeDown
   * @memberof Spectrum
   * @description Increases the db range and updates it.
   *
   * @returns {undefined}
   */
  rangeDown() {
    this.setRange(this.min_db + 5, this.max_db + 5);
  }
  toggleAutoScale() {
    this.setAutoScale(!this.autoScale);
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
  squeeze(value, out_min, out_max) {
    if (value <= this.min_db) return out_min;
    else if (value >= this.max_db) return out_max;
    else
      return Math.round(
        ((value - this.min_db) / (this.max_db - this.min_db)) * out_max
      );
  }
  /**
   * @function rowToImageData
   * @memberof Spectrum.prototype
   * @description Converts a row of binary data into image data for visualization using the instance's colormap.
   *
   * @param {Array} bins - An array of binary data representing a row.
   * @returns {undefined} This method does not return anything. It updates the instance's `imagedata` property.
   */
  rowToImageData(bins) {
    for (let i = 0; i < this.imagedata.data.length; i += 4) {
      const cindex = this.squeeze(bins[i / 4], 0, 255);
      const color = this.colormap[cindex];
      this.imagedata.data[i] = color[0];
      this.imagedata.data[i + 1] = color[1];
      this.imagedata.data[i + 2] = color[2];
      this.imagedata.data[i + 3] = 255;
    }
  }
  /**
   * @function addWaterfallRow
   * @memberof Spectrum.prototype
   * @description Adds a row to the waterfall display. Takes a bin of data, moves the existing waterfall display one row down, and draws the new data row at the top. Also applies a timestamp to every 100th row and scales the FFT canvas to fit the display.
   *
   * @param {array} bins - The array of data to add to the waterfall display.
   * @returns {void}
   */
  addWaterfallRow(bins) {
    // Shift waterfall 1 row down
    this.ctx_wf.drawImage(
      this.ctx_wf.canvas,
      0,
      0,
      this.wf_size,
      this.wf_rows - 1,
      0,
      1,
      this.wf_size,
      this.wf_rows - 1
    );

    this.wfrowcount++;

    // Draw new line on waterfall canvas
    this.rowToImageData(bins);
    this.ctx_wf.putImageData(this.imagedata, 0, 0);

    if (this.wfrowcount % 100 === 0) {
      const timeString = new Date().toISOString();

      // Font scaling over all spans... using magic(constant) numbers 612 and 1552
      // change this in proportion to increase or decrease text
      this.ctx_wf.save();
      this.ctx_wf.scale(
        this.ctx_wf.canvas.width / 750,
        this.ctx_wf.canvas.height / 1552
      );
      // keep constant scale regardless
      this.ctx_wf.font = `13px sans-serif`;
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
    this.ctx.drawImage(
      this.ctx_wf.canvas,
      0,
      0,
      this.wf_size,
      rows,
      0,
      this.spectrumHeight,
      width,
      height - this.spectrumHeight
    );
  }
  /**
   * @function drawFFT
   * @memberof Spectrum.prototype
   * @description Draws the Fast Fourier Transformation spectrum based on the given bins data, making manipulations on object's context (ctx) by setting paths and applying styles.
   *
   * @param {Array} bins - Array containing the FFT data to be visualized in the Spectrum.
   * @returns {void}
   */
  drawFFT(bins) {
    this.ctx.beginPath();
    this.ctx.moveTo(-1, this.spectrumHeight + 1);
    for (let i = 0; i < bins.length; i++) {
      let y =
        this.spectrumHeight - this.squeeze(bins[i], 0, this.spectrumHeight);
      if (y > this.spectrumHeight - 1) y = this.spectrumHeight + 1; // Hide underflow
      if (y < 0) y = 0;
      if (i === 0) this.ctx.lineTo(-1, y);
      this.ctx.lineTo(i, y);
      if (i === bins.length - 1) this.ctx.lineTo(this.wf_size + 1, y);
    }
    this.ctx.lineTo(this.wf_size + 1, this.spectrumHeight + 1);
    this.ctx.strokeStyle = "#fefefe";
    this.ctx.stroke();
  }
  
  /**
   * @function drawSpectrum
   * @memberof Spectrum.prototype
   * @description A function that draws a spectrum based on the calculated Fast Fourier Transform (FFT) bins. The spectrum drawing includes the application of FFT averaging and max hold, as well as suitably scaling the FFT drawn on the canvas. It also facilitates the drawing of FFT bins, signal thresholds and copying the axes from an offscreen canvas.
   *
   * @param {Array} bins - An array of FFT bins that will be drawn on the Spectrum.
   * @returns {void}
   */
  drawSpectrum(bins) {
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
    draw_signal_threshold(this.ctx, height, width, this);

    // Copy axes from offscreen canvas
    this.ctx.drawImage(this.ctx_axes.canvas, 0, 0);
    
    detect_signals(bins, this.ctx, height, width, this.spanHz, this);
  }
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
  detect_movement(event) {
    mouse_in_canvas = true;
    // if (mouse_in_canvas) {
    const el_boundingRectangle = this.ctx.canvas.getBoundingClientRect();
    mouse_x = event.clientX - el_boundingRectangle.left;
    mouse_y = event.clientY - el_boundingRectangle.top;
  }
  detect_movement_1(event) {
    mouse_in_canvas = false;
  }
  /**
   * @function updateAxes
   * @memberof Spectrum.prototype
   * @description This function updates the axes of the Spectrum object. It clears the existing axes and plots new ones based on the current state (i.e., current frequency span, center frequency, and dB range). It adjusts the axes labels (dB values on the y-axis and frequency labels on the x-axis) according to the current state. Note that the dB range is from min_db to max_db (defined elsewhere), and the frequency range is determined by centerHz and spanHz (also defined elsewhere).
   *
   * @returns {undefined} The function does not return anything.
   */
  updateAxes() {
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
        if (this.centerHz + this.spanHz > 1e6)
          freq = Number(freq / 1e6).toFixed(2) + "M";
        else if (this.centerHz + this.spanHz > 1e3) freq = freq / 1e3 + "k";
        this.ctx_axes.fillText(freq, x + adjust, height - 3);
      }

      this.ctx_axes.beginPath();
      this.ctx_axes.moveTo(x, 0);
      this.ctx_axes.lineTo(x, height);
      this.ctx_axes.strokeStyle = "rgba(200, 200, 200, 0.10)";
      this.ctx_axes.stroke();
    }
  }
  /**
   * @function addData
   * @memberof Spectrum.prototype
   * @description Adds data to Spectrum and draw data on waveform as well as update the waterfall row. It depends on the pause state and if data length mismatches, the waveform size will be updated. The waveform's base canvas width would be adjusted as per data length and its 2D context fillstyle would be configured to black color. An image data for the waveform would be created considering data length as image width and 1 as its height.
   *
   * @param {Uint16Array} data - The data to add in Spectrum.
   * @returns {undefined}
   */
  addData(data) {
    this.databin = new Uint16Array(data);

    if (!this.paused) {
      if (this.databin.length !== this.wf_size) {
        this.wf_size = this.databin.length;
        this.ctx_wf.canvas.width = this.databin.length;
        this.ctx_wf.fillStyle = "black";
        this.ctx_wf.fillRect(0, 0, this.wf.width, this.wf.height);
        this.imagedata = this.ctx_wf?.createImageData(
          this.databin.length ?? 1,
          1
        );
      }
      this.drawSpectrum(this.databin);
      this.addWaterfallRow(this.databin);
      this.resize();
    }
  }
  /**
   * @function updateSpectrumRatio
   * @memberof Spectrum
   * @description Updates the spectrumHeight and gradient properties based on the current state.
   *
   * @returns {undefined}
   */
  updateSpectrumRatio() {
    this.spectrumHeight = Math.round(
      (this.canvas.height * this.spectrumPercent) / 100.0
    );

    this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.spectrumHeight);
    for (let i = 0; i < this.colormap.length; i++) {
      const c = this.colormap[this.colormap.length - 1 - i];
      this.gradient.addColorStop(
        i / this.colormap.length,
        "rgba(" + c[0] + "," + c[1] + "," + c[2] + ", 1.0)"
      );
    }
  }
  /**
   * @function resize
   * @memberof Spectrum
   * @description Updates the canvas and axes sizes if they have changed, and calls to update the spectrum ratio.
   *
   * @returns {undefined}
   */
  resize() {
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
  }
  /**
   * @function setSpectrumPercent
   * @memberof Spectrum
   * @description Sets the spectrumPercent property and calls to update the spectrum ratio.
   * @param {number} percent - The percent value to set.
   *
   * @returns {undefined}
   */
  setSpectrumPercent(percent) {
    if (percent >= 0 && percent <= 100) {
      this.spectrumPercent = percent;
      this.updateSpectrumRatio();
    }
  }
  /**
   * @function incrementSpectrumPercent
   * @memberof Spectrum
   * @description Increases the spectrumPercent by the spectrumPercentStep while making sure it doesn't exceed 100.
   *
   * @returns {undefined}
   */
  incrementSpectrumPercent() {
    if (this.spectrumPercent + this.spectrumPercentStep <= 100) {
      this.setSpectrumPercent(this.spectrumPercent + this.spectrumPercentStep);
    }
  }
  /**
   * @function decrementSpectrumPercent
   * @memberof Spectrum
   * @description Decreases the spectrumPercent by the spectrumPercentStep while making sure it doesn't go below 0.
   *
   * @returns {undefined}
   */
  decrementSpectrumPercent() {
    if (this.spectrumPercent - this.spectrumPercentStep >= 0) {
      this.setSpectrumPercent(this.spectrumPercent - this.spectrumPercentStep);
    }
  }
  /**
   * @function toggleColor
   * @memberof Spectrum
   * @description Toggles the colormap between different sets and updates the spectrum ratio.
   *
   * @returns {undefined}
   */
  toggleColor() {
    this.colorindex++;
    if (this.colorindex >= colormaps.length) this.colorindex = 0;
    this.colormap = colormaps[this.colorindex];
    this.updateSpectrumRatio();
  }
  /**
   * @function setColor
   * @memberof Spectrum
   * @description Sets the colormap to a specific set and updates the spectrum ratio.
   * @param {number} index - The index of the colormap to set.
   *
   * @returns {undefined}
   */
  setColor(index) {
    this.colormap = colormaps[index];
    this.updateSpectrumRatio();
  }
  /**
   * @function setRange
   * @memberof Spectrum
   * @description Sets the min_db and max_db properties and calls to update the axes.
   * @param {number} min_db - The minimum db to set.
   * @param {number} max_db - The maximum db to set.
   *
   * @returns {undefined}
   */
  setRange(min_db, max_db) {
    console.log(`min: ${min_db} max: ${max_db}`);
    this.min_db = min_db;
    this.max_db = max_db;
    this.updateAxes();
  }
  /**
   * @function rangeUp
   * @memberof Spectrum
   * @description Decreases the db range and updates it.
   *
   * @returns {undefined}
   */
  rangeUp() {
    this.setRange(this.min_db - 5, this.max_db - 5);
  }
  /**
   * @function rangeDown
   * @memberof Spectrum
   * @description Increases the db range and updates it.
   *
   * @returns {undefined}
   */
  rangeDown() {
    this.setRange(this.min_db + 5, this.max_db + 5);
  }
  /**
   * @function setMinRange
   * @memberof Spectrum
   * @description Sets the min_db property and calls to update the axes.
   * @param {number} min - The minimum db to set.
   *
   * @returns {undefined}
   */
  setMinRange(min) {
    this.min_db = min;
    this.updateAxes();
  }
  /**
   * @function setMaxRange
   * @memberof Spectrum
   * @description Sets the max_db property and calls to update the axes.
   * @param {number} max - The maximum db to set.
   *
   * @returns {undefined}
   */
  setMaxRange(max) {
    this.max_db = max;
    this.updateAxes();
  }
  /**
   * @function rangeIncrease
   * @memberof Spectrum
   * @description Increases both the minimum and maximum db range.
   *
   * @returns {undefined}
   */
  rangeIncrease() {
    this.setRange(this.min_db - 5, this.max_db + 5);
  }
  /**
   * @function rangeDecrease
   * @memberof Spectrum
   * @description Decreases both the minimum and maximum db range if the difference between them is greater than 10.
   *
   * @returns {undefined}
   */
  rangeDecrease() {
    if (this.max_db - this.min_db > 10)
      this.setRange(this.min_db + 5, this.max_db - 5);
  }
  /**
   * @function doAutoScale
   * @memberof Spectrum
   * @description Sets the db range based on the provided bins and toggles auto scale.
   * @param {Array<number>} bins - The bins to calculate the range from.
   *
   * @returns {undefined}
   */
  doAutoScale(bins) {
    const maxbinval = Math.max(...bins);
    const minbinval = Math.min(...bins);

    this.setRange(
      Math.ceil(minbinval * 0.075) * 10,
      Math.ceil(maxbinval * 0.075) * 10
    ); // 75% to nearest 10
    this.toggleAutoScale();
  }
  /**
   * @function setCenterHz
   * @memberof Spectrum
   * @description Sets the centerHz property and calls to update the axes.
   * @param {number} hz - The frequency in Hertz to set as center.
   *
   * @returns {undefined}
   */
  setCenterHz(hz) {
    this.centerHz = hz;
    this.updateAxes();
  }
  /**
   * @function setSpanHz
   * @memberof Spectrum
   * @description Sets the spanHz property and calls to update the axes.
   * @param {number} hz - The frequency span in Hertz to set.
   *
   * @returns {undefined}
   */
  setSpanHz(hz) {
    this.spanHz = hz;
    this.updateAxes();
  }
  /**
   * @function setMinSpanHz
   * @memberof Spectrum
   * @description Sets the minSpanHz property.
   * @param {number} hz - The minimum span frequency in Hertz to set.
   *
   * @returns {undefined}
   */
  setMinSpanHz(hz) {
    this.minSpanHz = hz;
  }
  /**
   * @function setGain
   * @memberof Spectrum
   * @description Sets the gain property and calls to update the axes.
   * @param {number} gain - The gain value to set.
   *
   * @returns {undefined}
   */
  setGain(gain) {
    this.gain = gain;
    this.updateAxes();
  }
  /**
   * @function setFps
   * @memberof Spectrum
   * @description Sets the fps property and calls to update the axes.
   * @param {number} fps - The frames per second value to set.
   *
   * @returns {undefined}
   */
  setFps(fps) {
    this.fps = fps;
    this.updateAxes();
  }
  /**
   * @function setThreshold
   * @memberof Spectrum
   * @description Sets the threshold property.
   * @param {number} threshold - The threshold value to set.
   *
   * @returns {undefined}
   */
  setThreshold(threshold) {
    this.threshold = threshold;
  }
  /**
   * @function setAveraging
   * @memberof Spectrum
   * @description Sets the averaging properties, keeping their values above 0.
   * @param {number} num - The averaging value to set.
   *
   * @returns {undefined}
   */
  setAveraging(num) {
    if (num >= 0) {
      this.averaging = num;
      this.alpha = 2 / (this.averaging + 1);
    }
  }
  /**
   * @function setTuningStep
   * @memberof Spectrum
   * @description Sets the tuningStep property, keeping its value between 0 and 10e6.
   * @param {number} num - The tuning step value to set.
   *
   * @returns {undefined}
   */
  setTuningStep(num) {
    if (num > 0 && num < 10e6) this.tuningStep = num;
    this.log("Step: " + this.tuningStep);
  }
  /**
   * @function incrementAveraging
   * @memberof Spectrum
   * @description Increases the averaging property.
   *
   * @returns {undefined}
   */
  incrementAveraging() {
    this.setAveraging(this.averaging + 1);
  }
  /**
   * @function decrementAveraging
   * @memberof Spectrum
   * @description Decreases the averaging property while making sure it doesn't go below 0.
   *
   * @returns {undefined}
   */
  decrementAveraging() {
    if (this.averaging > 0) {
      this.setAveraging(this.averaging - 1);
    }
  }
  /**
   * @function incrementFrequency
   * @memberof Spectrum
   * @description Increments the centerHz by the tuningStep and sends the updated frequency over websocket.
   *
   * @returns {undefined}
   */
  incrementFrequency() {
    const freq = { freq: this.centerHz + this.tuningStep };
    this.ws.send(JSON.stringify(freq));
  }
  /**
   * @function decrementFrequency
   * @memberof Spectrum
   * @description Decreases the centerHz by the tuningStep and sends the updated frequency over websocket.
   *
   * @returns {undefined}
   */
  decrementFrequency() {
    const freq = { freq: this.centerHz - this.tuningStep };
    this.ws.send(JSON.stringify(freq));
  }
  /**
   * @function incrementGain
   * @memberof Spectrum
   * @description Increments the gain property and sends the updated gain over websocket.
   *
   * @returns {undefined}
   */
  incrementGain() {
    const gain = { gain: this.gain + 1 };
    this.ws.send(JSON.stringify(gain));
  }
  /**
   * @function decrementGain
   * @memberof Spectrum
   * @description Decreases the gain property and sends the updated gain over websocket.
   *
   * @returns {undefined}
   */
  decrementGain() {
    const gain = { gain: this.gain - 1 };
    this.ws.send(JSON.stringify(gain));
  }
  /**
   * @function incrementFps
   * @memberof Spectrum
   * @description Increments the fps property by 5 and sends the updated fps over websocket.
   *
   * @returns {undefined}
   */
  incrementFps() {
    const fps = { fps: this.fps + 5 };
    this.ws.send(JSON.stringify(fps));
  }
  /**
   * @function decrementFps
   * @memberof Spectrum
   * @description Decreases the fps property by 5 and sends the updated fps over websocket.
   *
   * @returns {undefined}
   */
  decrementFps() {
    const fps = { fps: this.fps - 5 };
    this.ws.send(JSON.stringify(fps));
  }
  /**
   * @function decrementTuningStep
   * @memberof Spectrum
   * @description Decrements the tuningStep property, using a dynamic decrement value based on the current tuningStep value.
   *
   * @returns {undefined}
   */
  decrementTuningStep() {
    // 1ex, 2.5ex, 5ex
    if (this.tuningStep > 1) {
      let step;
      const firstDigit = parseInt(
        this.tuningStep / Math.pow(10, parseInt(Math.log10(this.tuningStep)))
      );

      if (firstDigit === 2) step = 2.5;
      else step = 2;

      this.setTuningStep(this.tuningStep / step);
    }
  }
  /**
   * @function incrementTuningStep
   * @memberof Spectrum
   * @description Increments the tuningStep property, using a dynamic increment value based on the current tuningStep value.
   *
   * @returns {undefined}
   */
  incrementTuningStep() {
    if (this.tuningStep > 0) {
      let step;
      const firstDigit = parseInt(
        this.tuningStep / Math.pow(10, parseInt(Math.log10(this.tuningStep)))
      );

      if (firstDigit > 1) step = 2;
      else step = 2.5;

      this.setTuningStep(this.tuningStep * step);
    }
  }
  /**
   * @function downloadWFImage
   * @memberof Spectrum
   * @description Downloads the wf as an image.
   *
   * @returns {undefined}
   */
  downloadWFImage() {
    const link = document.createElement("a");
    const dateString = new Date().toISOString().replace(/:/g, "-");
    link.download = "capture-" + dateString + ".png";
    link.href = this.wf.toDataURL();
    link.click();
  }
  /**
   * @function downloadCanvasImage
   * @memberof Spectrum.prototype
   * @description Downloads the canvas image with a unique filename in PNG format.
   *
   * @returns {void}
   */
  downloadCanvasImage() {
    const link = document.createElement("a");
    const dateString = new Date().toISOString().replace(/:/g, "-");
    link.download = "capture-" + dateString + ".png";
    link.href = this.canvas.toDataURL();
    link.click();
  }
  /**
   * @function setPaused
   * @memberof Spectrum.prototype
   * @description Sets the pause state of the spectrum visual.
   *
   * @param {boolean} paused - The state of pause to be set for the spectrum.
   * @returns {void}
   */
  setPaused(paused) {
    this.paused = paused;
  }
  /**
   * @function togglePaused
   * @memberof Spectrum.prototype
   * @description Toggles the pause state of the spectrum visual.
   *
   * @returns {void}
   */
  togglePaused() {
    this.setPaused(!this.paused);
  }
  /**
   * @function setMaxHold
   * @memberof Spectrum.prototype
   * @description Sets the maximum hold value for the spectrum.
   *
   * @param {number} maxhold - The maximum hold value to be set.
   * @returns {void}
   */
  setMaxHold(maxhold) {
    this.maxHold = maxhold;
    this.binsMax = undefined;
  }
  /**
   * @function setAutoScale
   * @memberof Spectrum.prototype
   * @description Sets the autoscale property of the spectrum.
   *
   * @param {boolean} autoscale - The autoscale setting to be applied to the spectrum.
   * @returns {void}
   */
  setAutoScale(autoscale) {
    this.autoScale = autoscale;
  }
  /**
   * @function toggleMaxHold
   * @memberof Spectrum.prototype
   * @description Toggles the maximum hold value for the spectrum.
   *
   * @returns {void}
   */
  toggleMaxHold() {
    this.setMaxHold(!this.maxHold);
  }
  /**
   * @function toggleAutoScale
   * @memberof Spectrum
   * @description Toggles the auto-scale functionality. If auto-scale is currently enabled, it will be disabled and vice versa.
   * @returns {undefined} Returns nothing
   */
  toggleAutoScale() {
    this.setAutoScale(!this.autoScale);
  }
  /**
   * @function log
   * @memberof Spectrum.prototype
   * @description Logs a given message inside the logger element, adding it as HTML content and automatically scrolling to the bottom of the logger. It assumes that `this.logger` is a reference to an HTML element.
   *
   * @param {string} message - The message to be logged.
   * @returns {void}
   */
  log(message) {
    this.logger.innerHTML = message + "<br/>";
    this.logger.scrollTop = this.logger.scrollHeight;
  }
  /**
   * @function setWebSocket
   * @memberof Spectrum
   * @description Sets the WebSocket connection to be used by the Spectrum instance
   *
   * @param {Object} ws - The WebSocket connection to be set.
   * @returns {void}
   */
  setWebSocket(ws) {
    this.ws = ws;
  }
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
  toggleFullscreen() {
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
  }
  /**
   * @function onKeypress
   * @memberof Spectrum.prototype
   * @description onKeypress event handler.
   *
   * @returns {void}
   */
  onKeypress(e) {
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
  }
  // we could use drag to change frequency...
  onDrag(event) {
    console.log(event);

    let dragStart = {
      x: event.pageX - this.canvas.offsetLeft,
      y: event.pageY - this.canvas.offsetTop,
    };
    console.log(dragStart);
  }
  /**
   * @function on_canvas_click
   * @memberof Spectrum.prototype
   * @description Event handler for canvas click.
   *
   * @returns {void}
   */
  on_canvas_click() {
    // let magicSpaceUnderSignal = canvasHeight * (4 / 8);
    // let magicSpaceAboveSignal = canvasHeight * (1.59 / 8);
    const url = localPage ? "http://127.0.0.1:1880" : "";
    console.log(`SR ${canvasClickBW} downlink ${downlink}`);

    /* we clicked on a signal... */
    if (downlink !== undefined && canvasClickBW !== undefined && busy) {
      const lookupTable = [
        { symbol_rate: 0.033, tolerance: 0.01 },
        { symbol_rate: 0.066, tolerance: 0.01 },
        { symbol_rate: 0.125, tolerance: 0.015 },
        { symbol_rate: 0.25, tolerance: 0.02 },
        { symbol_rate: 0.333, tolerance: 0.04 },
        { symbol_rate: 0.5, tolerance: 0.09 },
        { symbol_rate: 1, tolerance: 0.1 },
        { symbol_rate: 1.5, tolerance: 0.15 },
        { symbol_rate: 2, tolerance: 0 },
      ];

      for (let { symbol_rate, tolerance } of lookupTable) {
        if (Math.abs(canvasClickBW - symbol_rate) < tolerance) {
          canvasClickBW = symbol_rate;
          break;
        }
      }

      const queryParams = new URLSearchParams({
        downlink,
        uplink,
        SR: canvasClickBW,
      });

      fetch(`${url}/setLocalRx?${queryParams}`).then(() => {});
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
  handleOptions(options) {
    this.centerHz = options && options.centerHz ? options.centerHz : 0;
    this.spanHz = options && options.spanHz ? options.spanHz : 0;
    this.gain = options && options.gain ? options.gain : 0;
    this.fps = options && options.fps ? options.fps : 50;
    this.wf_size = options && options.wf_size ? options.wf_size : 0;
    this.wf_rows = options && options.wf_rows ? options.wf_rows : 2048;
    this.spectrumPercent =
      options && options.spectrumPercent ? options.spectrumPercent : 25;
    this.spectrumPercentStep =
      options && options.spectrumPercentStep ? options.spectrumPercentStep : 5;
    this.averaging = options && options.averaging ? options.averaging : 5;
    this.maxHold = options && options.maxHold ? options.maxHold : false;
    this.autoScale = options && options.autoScale ? options.autoScale : false;
    this.minSpanHz = options && options.minSpanHz ? options.minSpanHz : 560000;
    this.logger =
      options && options.logger
        ? document.getElementById(options.logger)
        : document.getElementById("log");
    this.min_db = options && options.min_db ? options.min_db : 420;
    this.max_db = options && options.max_db ? options.max_db : 490;
    this.threshold = options && options.threshold ? options.threshold : 30;
    this.offset = options && options.offset ? options.offset : 0;
  }
  /**
   * @function setupCanvas
   * @memberof Spectrum.prototype
   * @description setupCanvas helper
   *
   * @returns {void}
   */
  setupCanvas(id) {
    this.canvas = document.getElementById(id);
    this.canvas.height = this.canvas.clientHeight;
    this.canvas.width = this.canvas.clientWidth;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.canvas.addEventListener(
      "click",
      () => this.on_canvas_click(this.ctx),
      false
    );

    this.axes = document.createElement("canvas");
    this.axes.height = 1; // Updated later
    this.axes.width = this.canvas.width;
    this.ctx_axes = this.axes.getContext("2d");

    this.wf = document.createElement("canvas");
    this.wf.height = this.wf_rows;
    this.wf.width = this.wf_size;
    this.ctx_wf = this.wf.getContext("2d");
  }
}
