/*
 * Copyright (c) 2024 Ohan Smit
 * This software is released under the MIT license.
 * See the LICENSE file for further details.
 */

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
  ctx.fillRect(
    tunedBox.x,
    tunedBox.y,
    tunedBox.w * scale * boxScale,
    tunedBox.h
  );
  ctx.fillStyle = "rgb(32,246,137)";
  ctx.fillText(`${(tunedBox.freq / 1_000_000).toFixed(3)}`, xText, 50);
}
/**
 * @function render_signal_box
 * @description Renders the signal box on the canvas. It loops through each signal and determines if the mouse_x is within the start and end of the signal, set the box width then draw the canvas accordingly.
 * @param {Object} ctx - The canvas context.
 * @param {number} mouse_x - The x-coordinate of the mouse click.
 * @param {number} mouse_y - The y-coordinate of the mouse click.
 * @param {number} canvasHeight - The height of the canvas.
 * @param {number} canvasWidth - The width of the canvas.
 * @param {Array} signals - The list of signals.
 * @returns {void}
 */
function render_signal_box(
  ctx,
  mouse_x,
  mouse_y,
  canvasHeight,
  canvasWidth,
  signals,
  spectrum
) {
  let i;
  let top_line_y = 2;
  if (mouse_y < (canvasHeight * 8) / 8) {
    for (i = 0; i < signals.length; i++) {
      if (
        mouse_x > signals[i].start &&
        mouse_x < signals[i].end
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
          uplink = downlink + spectrum.offset;
          clickBox = {
            x: signals[i].end,
            y: canvasHeight * (1 / 100),
            w: signals[i].start - signals[i].end,
            h: canvasHeight * (99 / 100),
            freq: round(signals[i].frequency),
          };
          busy = true;
          let freq = `${(signals[i].frequency / 1000000).toFixed(3)}MHz`;
          ctx.fillText(
            freq,
            signals[i].start - (signals[i].start - signals[i].end) / 2,
            75
          );
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
function print_symbol_rate(symrate) {
  if (symrate < 0.7) {
    return Math.round(symrate * 1000) + "KS";
  } else {
    return Math.round(symrate * 10) / 10 + "MS";
  }
}
/**
 * @function detect_signals
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
function detect_signals(
  fft_data,
  ctx,
  canvasHeight,
  canvasWidth,
  sr,
  spectrum
) {
  let i;
  let j;
  // Dynamic signal threshold variables
  let spectrum_y_range = spectrum.max_db - spectrum.min_db;
  let spectrum_threshold_step = spectrum_y_range / 100;
  const noise_level = spectrum.min_db;
  const signal_threshold =
    spectrum.max_db -
    (spectrum_y_range - spectrum_threshold_step * spectrum.threshold);
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
      if (
        (fft_data[i] + fft_data[i - 1] + fft_data[i - 2]) / 3.0 >
        signal_threshold
      ) {
        in_signal = true;
        start_signal = i;
      }
    } /* in_signal == true */ else {
      if (
        (fft_data[i] + fft_data[i - 1] + fft_data[i - 2]) / 3.0 <
        signal_threshold
      ) {
        in_signal = false;
        end_signal = i;
        acc = 0;
        acc_i = 0;
        for (
          j = (start_signal + 0.3 * (end_signal - start_signal)) | 0;
          j < start_signal + 0.7 * (end_signal - start_signal);
          j++
        ) {
          acc = acc + fft_data[j];
          acc_i = acc_i + 1;
        }
        strength_signal = acc / acc_i;
        /* Find real start of top of signal */
        for (
          j = start_signal;
          fft_data[j] - noise_level < 0.75 * (strength_signal - noise_level);
          j++
        ) {
          start_signal = j;
        }
        /* Find real end of the top of signal */
        for (
          j = end_signal;
          fft_data[j] - noise_level < 0.75 * (strength_signal - noise_level);
          j--
        ) {
          end_signal = j;
        }
        mid_signal = start_signal + (end_signal - start_signal) / 2.0;
        let divider = sr / spectrum.minSpanHz;
        signal_bw = align_symbol_rate(
          ((end_signal - start_signal) * (sr / 1000000)) / 1000 / divider
        );
        if (isNaN(signal_bw) && signal_bw !== 0) break;

        signal_freq = ((mid_signal + 1) / fft_data.length) * 10.0;
        let freq = spectrum.centerHz - sr / 2 + (sr * (10 * signal_freq)) / 100;
        let signal = {
          start: (start_signal / fft_data.length) * canvasWidth,
          end: (end_signal / fft_data.length) * canvasWidth,
          top: canvasHeight - (strength_signal / 65536) * canvasHeight,
          frequency: freq, // symbolrate: 1000.0 * signal_bw * (Number(sr)/this.spanHz) ,
          symbolrate: 1000.0 * signal_bw,
          offset: (Math.round(freq / 250000) * 250000 - freq) * -1,
        };
        signals.push(signal);
        if (
          Math.round(tunedBox.freq / 125000) * 125000 ===
          Math.round(freq / 125000) * 125000
        ) {
          tunedBox.x = signal.end;
          tunedBox.freq = freq;
          tunedBox.minSpanHz = spectrum.minSpanHz;
          let xText = (mid_signal / fft_data.length) * canvasWidth;
          drawRxBox(ctx, xText, spectrum.minSpanHz, spectrum.spanHz);
        }
        if (signal_bw !== 0) {
          text_x_position = (mid_signal / fft_data.length) * canvasWidth;
          ctx.font = "10px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(print_symbol_rate(signal_bw), text_x_position, 30);
          // ctx.restore();
          if (signal.offset > -5000 && signal.offset < 5000) {
            ctx.fillStyle = "Green";
          }
          ctx.fillText(Math.round(signal.offset) + "Hz", text_x_position, 15);
          ctx.fillStyle = "white";
        }
      }
    }
  }
  if (mouse_in_canvas) {
    render_signal_box(
      ctx,
      mouse_x,
      mouse_y,
      canvasHeight,
      canvasWidth,
      signals,
      spectrum
    );
  }
}

/**
 * @function draw_signal_threshold
 * @description Draws the signal threshold on a Spectrum instance's canvas.
 *
 * @param {CanvasRenderingContext2D} ctx - The rendering context of the Canvas where the signal threshold will be drawn.
 * @param {number} canvasHeight - The height of the Canvas.
 * @param {number} canvasWidth - The width of the Canvas.
 *
 * @returns {void}
 */
function draw_signal_threshold(ctx, canvasHeight, canvasWidth, spectrum) {
  let spectrum_height = canvasHeight * (spectrum.spectrumPercent / 100);
  // let spectrum_y_range = this.max_db - this.min_db;
  let spectrum_threshold_step = spectrum_height / 100;
  ctx.lineWidth = 1;
  ctx.strokeStyle = "red";
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  ctx.moveTo(0, spectrum_height - spectrum_threshold_step * spectrum.threshold);
  ctx.lineTo(
    canvasWidth,
    spectrum_height - spectrum_threshold_step * spectrum.threshold
  );
  ctx.stroke();
  ctx.setLineDash([0, 0]);
}
