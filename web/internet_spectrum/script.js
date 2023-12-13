let fft_url = "";
let ctx;

async function getJSON(url) {
  return fetch(`${url}/config`)
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    });
}
async function getConfig(url) {
  const json = await this.getJSON(url);
  return json;
}

let canvas_element;
let canvas_jqel;

let canvasWidth = 956;
let canvasHeight = 480;
let canvasHeightLast;

(async () => {

  const url = localPage ? 'http://127.0.0.1:1880' : '';
  const config = await getConfig(url);
  const rx_count = config.receivers.length;
  let ws_url = config.selected;
  /* var ws_url = "ws://44.149.67.245:82/wideband/"; */
  /* ws://46.41.2.20:7681 */
  let ws_name = "fft";

  /* On load */
 

  if (typeof ws_url_override !== "undefined") {
    ws_url = ws_url_override;
  }

  let render_timer;
  const render_interval_map = {
    /* ms */
    fft: 250,
    fft_fast: 100,
  };
  let render_interval = render_interval_map[ws_name];
  let render_busy = false;
  const render_buffer = [];


  let mouse_in_canvas = false;
  let mouse_x = 0;
  let mouse_y = 0;
  let clicked_x = 0;
  let clicked_y = 0;
  let channelClicked = 0;
  const channel_coords = {};
  let beacon_strength = 0;

  let highlighted_channel = {};
  let tuned_channels = Array(rx_count).fill({});
  function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }
  /* for (let j = 0; j < rx_count; j++) {
            tuned_channels.push(highlighted_channel);
        } */

  let fft_colour = "#0b0bc1";
  let band_colour = "#c1c10b";
  let background_colour = "white";
  let signals = [];
  let freq_info = [];

  /* This controls the pluto via HTTP request to the node-red API endpoint 'setRadio' */
  let downlink, uplink, canvasClickBW, lastUplink, lastCanvasClickBW;
  let busy = false;
  let activeColor, activeXd1, activeYd, activeXd2;
  let activeColor_1, activeXd1_1, activeYd_1, activeXd2_1;
  let activeColor_1_tx, activeXd1_1_tx, activeYd_1_tx, activeXd2_1_tx;

  /* Load vars from local storage */
  if (typeof Storage !== "undefined") {
    storageSupport = true;
    if (localStorage.wb_fft_colour) {
      fft_colour = localStorage.wb_fft_colour;
    }
    if (localStorage.highlighted_channel) {
      highlighted_channel = localStorage.highlighted_channel;
    }
    if (localStorage.tuned_channels) {
      tuned_channels = JSON.parse(localStorage.tuned_channels);
      if (tuned_channels.length !== rx_count) tuned_channels = [];
    }
    if (localStorage.wb_band_colour) {
      band_colour = localStorage.wb_band_colour;
    }
    if (localStorage.background_colour) {
      background_colour = localStorage.background_colour;
    }
    if (localStorage.wb_fft_speed) {
      ws_name = localStorage.wb_fft_speed;
      render_interval = render_interval_map[ws_name];
    }

    if (localStorage.activeColor_1) {
      activeColor_1 = localStorage.activeColor_1;
    }
    if (localStorage.activeXd1_1) {
      activeXd1_1 = localStorage.activeXd1_1;
    }
    if (localStorage.activeYd_1) {
      activeYd_1 = localStorage.activeYd_1;
    }
    if (localStorage.activeXd2_1) {
      activeXd2_1 = localStorage.activeXd2_1;
    }

    if (localStorage.activeColor_1_tx) {
      activeColor_1_tx = localStorage.activeColor_1_tx;
    }
    if (localStorage.activeXd1_1_tx) {
      activeXd1_1_tx = localStorage.activeXd1_1_tx;
    }
    if (localStorage.activeYd_1_tx) {
      activeYd_1_tx = localStorage.activeYd_1_tx;
    }
    if (localStorage.activeXd2_1_tx) {
      activeXd2_1_tx = localStorage.activeXd2_1_tx;
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

  const fft_ws = new u16Websocket(ws_url, ws_name, render_buffer);

  /* const urlParams = new URLSearchParams(window.location.search);
        var nodeRedIp = urlParams.get('nodeRed') === undefined ? "127.0.0.1:1880" : urlParams.get('nodeRed'); */
  function setRxClickState(
    activeColor_f,
    activeXd1_f,
    magicSpaceAboveSignal,
    activeXd2_f
  ) {
    activeColor_1 = activeColor_f;
    activeXd1_1 = activeXd1_f;
    activeYd_1 = magicSpaceAboveSignal;
    activeXd2_1 = activeXd2_f;
    if (storageSupport) {
      localStorage.activeColor_1 = activeColor_1;
      localStorage.activeXd1_1 = activeXd1_1;
      localStorage.activeYd_1 = activeYd_1;
      localStorage.activeXd2_1 = activeXd2_1;
    }
  }
  function setRxChannelState(channel) {
    let jsonChannel = JSON.stringify(channel);
    /* console.log(`update object in array at pos ${channel.number}`) */
    let someArray = tuned_channels;
    if (storageSupport) {
      localStorage.highlighted_channel = jsonChannel;
      for (let j = 0; j < rx_count; j++) {
        if (channel.number - 1 === j) {
          console.log(`update object in array at pos ${j}`);
          someArray[j] = jsonChannel;
        }
      }
      tuned_channels = someArray;
      localStorage.tuned_channels = JSON.stringify(someArray);
      console.log(`kaas bra  ${someArray}`);
    }
    return;
  }
  function on_canvas_click(ev) {
    let magicSpaceUnderSignal = canvasHeight * (4 / 8);
    let magicSpaceAboveSignal = canvasHeight * (1.59 / 8);
    /* we clicked on the beacon... */
    if (uplink === undefined && canvasClickBW === undefined && busy) {
      /* Tune longmynd on pluto */
      fetch(
        `${url}/setRx?` +
          new URLSearchParams({
            downlink: 10491.5,
            SR: 1.5,
            channel: channelClicked,
          })
      );
      /* console.log(channel_coords); */
      /* RX tuning bar */
      if (channelClicked === rx_count + 1) {
        setRxClickState(activeColor, 43, magicSpaceUnderSignal, canvasWidth * 1/5);
        return;
      }
      setRxChannelState(highlighted_channel);
    }
    /* we clicked on a signal... */
    if (uplink !== undefined && canvasClickBW !== undefined && busy) {
      if (ev.shiftKey && canvasClickBW > 0.333) {
        canvasClickBW = 0.333;
      }
      // 250KS on mid channels
      if (ev.altKey && canvasClickBW >= 0.333) {
        canvasClickBW = 0.25;
      }
      fetch(
        `${url}/setRx?` +
          new URLSearchParams({
            downlink: downlink,
            SR: canvasClickBW,
            channel: channelClicked,
          })
      );
      /* RX tuning bar */
      if (channelClicked === rx_count + 1) {
        setRxClickState(
          activeColor,
          activeXd1,
          magicSpaceUnderSignal,
          activeXd2
        );
        return;
      }
      setRxChannelState(highlighted_channel);
    }
    /* we clicked on a channel bar... */
    if (uplink !== undefined && canvasClickBW !== undefined && !busy) {
      /* Channel calibration mode */
      // if (ev.altKey && ev.shiftKey) {
      //   if (busy) return;
      //   lastUplink = uplink;
      //   lastCanvasClickBW = canvasClickBW;
      //   fetch(
      //     `${url}/setTx?` +
      //       new URLSearchParams({
      //         uplink,
      //         downlink,
      //         SR: canvasClickBW,
      //         busy: false,
      //         tune: true,
      //       })
      //   );
      //   return;
      // }

      // 333KS on > 500KS channel
      if (ev.shiftKey && canvasClickBW > 0.333) {
        canvasClickBW = 0.333;
      }
      // 250KS on mid channels
      if (ev.altKey && canvasClickBW >= 0.333) {
        canvasClickBW = 0.25;
      }
      lastUplink = uplink;
      lastCanvasClickBW = canvasClickBW;

      fetch(
        `${url}/setTx?` +
          new URLSearchParams({
            uplink,
            downlink,
            SR: canvasClickBW,
            busy: busy,
          })
      );
      activeColor_1_tx = activeColor;
      activeXd1_1_tx = activeXd1;
      activeYd_1_tx = activeYd;
      activeXd2_1_tx = activeXd2;
      if (storageSupport) {
        localStorage.activeColor_1_tx = activeColor_1_tx;
        localStorage.activeXd1_1_tx = activeXd1_1_tx;
        localStorage.activeYd_1_tx = activeYd_1_tx;
        localStorage.activeXd2_1_tx = activeXd2_1_tx;
      }

      /* set busy state as per time of click, outer busy variable changes on every render FFT */
      /* let busyFetch = busy; */
      /* we ask the node-red api, is the pluto transmitting? */
      /* only when busy is set eg, clicking on signal */
      /* fetch('/status')
                .then(res =>  res.text())
                .then(text => {
                    console.dir(text)
                    if(text === "0"){
                        // we do not set the tune bar since you clicked on a active signal... 
                        return;
                    }
                    // When we are not transmitting we set the tune bar 
                    if(text === "1"){
                        activeColor_1_tx = activeColor;
                        activeXd1_1_tx = activeXd1;
                        // clicking on a signal sets the busyFetch to 'true', so tune bar sits on the top row 
                        activeYd_1_tx = !busyFetch ? activeYd : magicSpaceUnderSignal;
                        activeXd2_1_tx = activeXd2;
                        if (storageSupport) {
                            localStorage.activeColor_1_tx = activeColor_1_tx;
                            localStorage.activeXd1_1_tx = activeXd1_1_tx;
                            localStorage.activeYd_1_tx = activeYd_1_tx;
                            localStorage.activeXd2_1_tx = activeXd2_1_tx;
                        }
                    }
                });          */
      /* if(busyFetch) return; */
    }
  }

  function loadAll() {
    // canvasHeight = document.body.clientHeight-50;
    canvasHeightLast = canvasHeight;
    /* JQuery */
   
    canvasWidth = document.body.clientWidth-10;
    canvas_element = document.getElementById("c");
    console.info("ele");
    console.dir(canvas_element);
    // el.background;
    /* JQuery */
    // canvas_jqel = $("#c");

    initCanvas(canvas_element);

    /* Event handlers */
    document.getElementById("fft-colour-select").onchange = function () {
      let backRGB = this.value;
      fft_colour = `${backRGB}`;
      if (storageSupport) {
        localStorage.wb_fft_colour = fft_colour;
      }
    };

    document.getElementById("band-colour-select").onchange = function () {
      backRGB = this.value;
      band_colour = `${backRGB}`;
      if (storageSupport) {
        localStorage.wb_band_colour = band_colour;
      }
    };
    document.getElementById("background-colour-select").onchange = function () {
      backRGB = this.value;
      background_colour = `${backRGB}`;
      if (storageSupport) {
        localStorage.background_colour = background_colour;
      }
    };
    /* Change fft speed handler */
    document.getElementById("fft-speed-select").onchange = function () {
      let value = this.value;
      ws_name = value;
      render_interval = render_interval_map[ws_name];
      clearInterval(render_timer);
      render_timer = setInterval(render_fft, render_interval);
      fft_ws.changeName(ws_name);
      if (storageSupport) {
        localStorage.wb_fft_speed = ws_name;
      }
    };

    /* We add canvas click event handler */
    ctx.canvas.addEventListener("click", on_canvas_click, false);
    updateFFT(null);

    /* Hide fullscreen link for iOS */
    const n = navigator.userAgent.toLowerCase();
    if (
      n.indexOf("iphone") != -1 ||
      n.indexOf("ipad") != -1 ||
      n.indexOf("ipod") != -1 ||
      n.indexOf("ios") != -1
    ) {
    //   $("#fullscreen-link").hide();
    }

    /* If we loaded value from localStorage then we probably need to set the colour */
    if (storageSupport && localStorage.wb_fft_colour) {
      document.getElementById("fft-colour-select").value = fft_colour;
    }

    /* If we loaded value from localStorage then we probably need to set the colour */
    if (storageSupport && localStorage.wb_band_colour) {
      document.getElementById("band-colour-select").value = band_colour;
    }

    /* If we loaded value from localStorage then we probably need to set the colour */
    if (storageSupport && localStorage.background_colour) {
      document.getElementById("background-colour-select").value =
        background_colour;
    }

    /* If we loaded value from localStorage then we probably need to set the fft speed */
    if (storageSupport && localStorage.wb_fft_speed) {
      document.getElementById("fft-speed-select").value = ws_name;
    }

    ctx.canvas.addEventListener("mousemove", function (e) {
      mouse_in_canvas = true;

      const el_boundingRectangle = canvas_element.getBoundingClientRect();
      mouse_x = e.clientX - el_boundingRectangle.left;
      mouse_y = e.clientY - el_boundingRectangle.top;

      render_frequency_info(mouse_x, mouse_y);

      render_signal_box(mouse_x, mouse_y);

      if (typeof signal_selected !== "undefined") {
        render_signal_selected_box(clicked_x, clicked_y);
      }
    });

    ctx.canvas.addEventListener("mouseleave", function (e) {
      mouse_in_canvas = false;
    });

    ctx.canvas.addEventListener("click", function (e) {
      const el_boundingRectangle = canvas_element.getBoundingClientRect();
      clicked_x = e.clientX - el_boundingRectangle.left;
      clicked_y = e.clientY - el_boundingRectangle.top;

      if (typeof signal_selected !== "undefined") {
        render_signal_selected_box(clicked_x, clicked_y);

        if (signal_selected != null && typeof signal_tune !== "undefined") {
          signal_tune(signal_selected.frequency, signal_selected.symbolrate);
        }
      }
    });
  }
  loadAll();
  /* JQuery */
  function initCanvas(canvas_element) {
    // console("i am emptry" + canvas_element)
    canvas_element.width = canvasWidth;
    canvas_element.height = canvasHeight;
    // $("#c").attr("width", canvasWidth);
    // $("#c").attr("height", canvasHeight);

    ctx = canvas_element.getContext("2d");

    (devicePixelRatio = window.devicePixelRatio || 1),
      (backingStoreRatio =
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1),
      (ratio = devicePixelRatio / backingStoreRatio);

    if (devicePixelRatio !== backingStoreRatio) {
      const oldWidth = canvas_element.width;
      const oldHeight = canvas_element.height;

      canvas_element.width = oldWidth * ratio;
      canvas_element.height = oldHeight * ratio;

      canvas_element.style.width = oldWidth + "px";
      canvas_element.style.height = oldHeight + "px";

      ctx.scale(ratio, ratio);
    }
  }

  function resetCanvasVariables() {
    canvasClickBW = undefined;
    uplink = undefined;
    busy = false;
  }

  function updateFFT(data) {
    let i;
    let obj;
    const _start_freq = 490.5;

    /* Clear Screen */
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();

    /* draw our spectrum colour */
    ctx.fillStyle = background_colour;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    /* Draw Dashed Vertical Lines and top headers */
    ctx.lineWidth = 1;
    ctx.strokeStyle = background_colour === "black" ? "white" : "black";
    ctx.setLineDash([5, 20]);
    ctx.font = "15px Arial";
    ctx.fillStyle = background_colour === "black" ? "white" : "black";
    ctx.textAlign = "center";
    for (i = 0; i < 18; i += 2) {
      /* Draw vertical line */
      ctx.beginPath();
      ctx.moveTo(canvasWidth / 18 + i * (canvasWidth / 18), 25);
      ctx.lineTo(
        canvasWidth / 18 + i * (canvasWidth / 18),
        canvasHeight * (7 / 8)
      );
      ctx.stroke();
      /* Draw Vertical Text */
      ctx.fillText(
        "10.4" + (91 + i * 0.5),
        canvasWidth / 18 + i * (canvasWidth / 18),
        17
      );
    }

    /* Draw Horizontal Lines */
    ctx.lineWidth = 1;
    ctx.strokeStyle = background_colour === "black" ? "white" : "black";
    ctx.setLineDash([5, 10]);
    ctx.font = "12px Arial";
    ctx.fillStyle = background_colour === "black" ? "white" : "black";
    ctx.textAlign = "center";
    for (i = 1; i <= 4; i++) {
      linePos = i * (canvasHeight / 4) - canvasHeight / 6;
      ctx.beginPath();
      ctx.moveTo(0 + 35, linePos);
      ctx.lineTo(canvasWidth - 35, linePos);
      ctx.stroke();
      /* Annotate lines above 0dB */
      if (i != 4) {
        ctx.fillText(5 * (4 - i) + "dB", 17, linePos + 4);
        ctx.fillText(5 * (4 - i) + "dB", canvasWidth - 17, linePos + 4);
      }
    }

    /* Draw Minor Horizontal Lines */
    ctx.lineWidth = 1;
    ctx.strokeStyle = background_colour === "black" ? "white" : "black";
    ctx.setLineDash([1, 10]);
    for (i = 1; i < 20; i++) {
      if (i % 5 != 0) {
        linePos = i * (canvasHeight / 20) - canvasHeight / 6;
        ctx.beginPath();
        ctx.moveTo(0 + 10, linePos);
        ctx.lineTo(canvasWidth - 10, linePos);
        ctx.stroke();
      }
    }

    ctx.restore();

    /* Draw Band Splits */
    ctx.lineWidth = 1;
    ctx.strokeStyle = background_colour === "black" ? "white" : "black";

    function draw_divider(frequency, height) {
      ctx.beginPath();
      ctx.moveTo(
        (frequency - _start_freq) * (canvasWidth / 9),
        canvasHeight * height
      );
      ctx.lineTo(
        (frequency - _start_freq) * (canvasWidth / 9),
        canvasHeight * (7.9 / 8)
      );
      ctx.stroke();
    }

    /* Beacon & Simplex / Simplex */
    draw_divider(492.5, 7.1 / 8.0);

    /* Simplex / RB-TV */
    draw_divider(497.0, 7.325 / 8.0);

    /* Draw channel allocations */
    ctx.fillStyle = band_colour;

    function draw_channel(center_frequency, bandwidth, line_height) {
      const rolloff = 1.35 / 2.0;

      if (typeof freq_info !== "undefined") {
        if (freq_info.length == 44) freq_info = []; // hack to avoid continued push(). better to precompute all points and draw.
        freq_info.push({
          x1:
            (center_frequency - rolloff * bandwidth - _start_freq) *
            (canvasWidth / 9),
          x2:
            (center_frequency + rolloff * bandwidth - _start_freq) *
            (canvasWidth / 9),
          y: canvasHeight * line_height,
          center_frequency: center_frequency,
          bandwidth: bandwidth,
        });
      }

      ctx.fillRect(
        (center_frequency - rolloff * bandwidth - _start_freq) *
          (canvasWidth / 9),
        canvasHeight * line_height,
        2 * (rolloff * bandwidth) * (canvasWidth / 9),
        10
      );
    }

    /* 1MS */
    for (var f = 493.25; f <= 496.25; f = f + 1.5) {
      resetCanvasVariables();
      draw_channel(f, 1.0, 7.475 / 8);
    }

    /* 333Ks */
    for (var f = 492.75; f <= 499.25; f = f + 0.5) {
      resetCanvasVariables();
      draw_channel(f, 0.333, 7.25 / 8);
    }

    /* 125Ks */
    for (var f = 492.75; f <= 499.25; f = f + 0.25) {
      resetCanvasVariables();
      draw_channel(f, 0.125, 7.025 / 8);
    }
    /* draw active rx and tx channels */
    ctx.font = "bold 19px Arial";
    ctx.fillStyle = invertColor(band_colour);
    ctx.textAlign = "center";
    ctx.fillText("RX", activeXd1_1 - 20, activeYd_1);
    ctx.fillRect(activeXd1_1, activeYd_1, activeXd2_1 - activeXd1_1, 10);

    for (let j = 0; j < tuned_channels.length; j++) {
      if (isEmpty(tuned_channels[j])) {
        console.log("not drawing");
        break;
      }
      obj = JSON.parse(tuned_channels[j]);
      ctx.fillStyle = invertColor(band_colour);
      ctx.font = "bold 15px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`CH${j + 1}`, obj.x1 - 20, obj.y1 + obj.height / 2);
      ctx.globalAlpha = 0.4;
      ctx.fillRect(obj.x1, obj.y1, obj.width, obj.height);
      ctx.globalAlpha = 1;
      /* console.log("drawing") */
    }
    ctx.font = "bold 19px Arial";
    ctx.fillText("TX", activeXd1_1_tx - 20, activeYd_1_tx);
    ctx.fillRect(
      activeXd1_1_tx,
      activeYd_1_tx,
      activeXd2_1_tx - activeXd1_1_tx,
      10
    );
    ctx.restore();

    /* Annotate Bands - Text */
    ctx.font = "15px Arial";
    ctx.fillStyle = background_colour === "black" ? "white" : "black";
    ctx.textAlign = "center";
    ctx.fillText(
      "A71A DATV Beacon",
      (491.5 - _start_freq) * (canvasWidth / 9),
      canvasHeight - 42
    );
    ctx.fillText(
      "10491.500",
      (491.5 - _start_freq) * (canvasWidth / 9),
      canvasHeight - 25
    );
    ctx.fillText(
      "(1.5MS/s QPSK, 4/5)",
      (491.5 - _start_freq) * (canvasWidth / 9),
      canvasHeight - 9
    );
    ctx.fillText(
      "Click to tune wide & narrow channels",
      (494.75 - _start_freq) * (canvasWidth / 9),
      canvasHeight - 5
    );

    /* ctx.fillText("", ((494.75) - _start_freq) * (canvasWidth / 15), canvasHeight - 6);
            ctx.fillText("", ((494.75) - _start_freq) * (canvasWidth / 6.42), canvasHeight - 6); */

    ctx.fillText(
      "Narrow channels",
      (498.25 - _start_freq) * (canvasWidth / 9),
      canvasHeight - 9
    );
    ctx.restore();

    /* Draw FFT */
    if (data != null) {
      const start_height = canvasHeight * (7 / 8);
      const data_length = data.length;

      let sample;
      let sample_index;
      let sample_index_f;

      ctx.lineWidth = 1;
      ctx.strokeStyle = fft_colour;
      for (i = 0; i < canvasWidth; i++) {
        sample_index = (i * data_length) / canvasWidth;
        sample_index_f = sample_index | 0;
        sample =
          data[sample_index_f] +
          (sample_index - sample_index_f) *
            (data[sample_index_f + 1] - data[sample_index_f]);
        sample = sample / 65536.0;

        if (sample > 1 / 8) {
          ctx.beginPath();
          ctx.moveTo(i, start_height);
          ctx.lineTo(i, canvasHeight - Math.min(sample, 1.0) * canvasHeight);
          ctx.stroke();
        }
      }
      ctx.restore();
    } else {
      ctx.font = "15px Arial";
      ctx.fillStyle = invertColor(background_colour);
      ctx.textAlign = "center";
      ctx.fillText(
        "Loading..",
        canvasWidth / 2 + canvasWidth / 35,
        3 * (canvasHeight / 4) - (1.1 / 6) * canvasHeight
      );
      ctx.restore();
    }
  }

  function draw_decoded() {
    let i;

    for (i = 0; i < signals_decoded.length; i++) {
      text_x_position =
        (signals_decoded[i].frequency - 10490.5) * (canvasWidth / 9.0);

      /* Adjust for right-side overlap */
      if (text_x_position > 0.97 * canvasWidth) {
        text_x_position = canvasWidth - 55;
      }

      ctx.font = "bold 14px Arial";
      ctx.fillStyle = invertColor(background_colour);
      ctx.textAlign = "center";
      ctx.fillText(
        signals_decoded[i].name,
        text_x_position,
        canvasHeight * (6.5 / 8)
      );
    }
    ctx.restore();
  }

  function render_fft() {
    if (!render_busy) {
      render_busy = true;
      if (render_buffer.length > 0) {
        /* Pull oldest frame off the buffer and render it */
        const data_frame = render_buffer.shift();
        updateFFT(data_frame);
        detect_signals(data_frame);

        if (typeof signals_decoded !== "undefined") {
          draw_decoded();
        }

        /* If we're buffering up, remove old queued frames (unsure about this) */
        if (render_buffer.length > 2) {
          render_buffer.splice(0, render_buffer.length - 2);
        }
      }
      render_busy = false;
    } else {
      console.log(
        "Slow render blocking next frame, configured interval is ",
        render_interval
      );
    }
  }
  render_timer = setInterval(render_fft, render_interval);

  function align_symbolrate(width) {
    //console.log(width);
    if (width < 0.022) {
      return 0;
    } else if (width < 0.06) {
      return 0.035;
    } else if (width < 0.086) {
      return 0.066;
    } else if (width < 0.185) {
      return 0.125;
    } else if (width < 0.277) {
      return 0.25;
    } else if (width < 0.388) {
      return 0.333;
    } else if (width < 0.7) {
      return 0.5;
    } else if (width < 1.2) {
      return 1.0;
    } else if (width < 1.6) {
      return 1.5;
    } else if (width < 2.2) {
      return 2.0;
    } else {
      return Math.round(width * 5) / 5.0;
    }
  }

  function print_symbolrate(symrate) {
    if (symrate < 0.7) {
      return Math.round(symrate * 1000) + "KS";
    } else {
      return Math.round(symrate * 10) / 10 + "MS";
    }
  }

  function print_frequency(freq, symrate) {
    if (symrate < 0.7) {
      return "'" + (Math.round(freq * 80) / 80.0).toFixed(3);
    } else {
      return "'" + (Math.round(freq * 40) / 40.0).toFixed(3);
    }
  }

  const scale_db = 3276.8;

  function is_overpower(beacon_strength, signal_strength, signal_bw) {
    if (beacon_strength != 0) {
      if (signal_bw < 0.4) {
        // < 1MS
        return false;
      }

      if (signal_strength > beacon_strength - 0.75 * scale_db) {
        // >= 1MS
        return true;
      }
    }
    return false;
  }

  function detect_signals(fft_data) {
    let i;
    let j;

    const noise_level = 11000;
    const signal_threshold = 16000;

    let in_signal = false;
    let start_signal;
    let end_signal;
    let mid_signal;
    let strength_signal;
    let signal_bw;
    let signal_freq;
    let acc;
    let acc_i;

    let db_per_pixel;
    let beacon_strength_pixel;

    let text_x_position;

    /* Clear signals array */
    signals = [];

    for (i = 2; i < fft_data.length; i++) {
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
          /*
                        ctx.lineWidth=1;
                        ctx.strokeStyle = 'white';
                        ctx.beginPath();
                        ctx.moveTo((start_signal/fft_data.length)*canvasWidth, canvasHeight * (1 - (signal_threshold/65536)));
                        ctx.lineTo((end_signal/fft_data.length)*canvasWidth, canvasHeight * (1 - (signal_threshold/65536)));
                        ctx.stroke();
                        ctx.restore();
                        */

          strength_signal = acc / acc_i;
          /*
                        ctx.lineWidth=1;
                        ctx.strokeStyle = 'white';
                        ctx.beginPath();
                        ctx.moveTo((start_signal/fft_data.length)*canvasWidth, canvasHeight * (1 - (strength_signal/65536)));
                        ctx.lineTo((end_signal/fft_data.length)*canvasWidth, canvasHeight * (1 - (strength_signal/65536)));
                        ctx.stroke();
                        ctx.restore();
                        */

          /* Find real start of top of signal */
          for (
            j = start_signal;
            fft_data[j] - noise_level < 0.75 * (strength_signal - noise_level);
            j++
          ) {
            start_signal = j;
          }
          /*
                        ctx.lineWidth=1;
                        ctx.strokeStyle = 'white';
                        ctx.beginPath();
                        ctx.moveTo((start_signal/fft_data.length)*canvasWidth, canvasHeight * (1 - (strength_signal/65536)));
                        ctx.lineTo((start_signal/fft_data.length)*canvasWidth, canvasHeight * (1 - (strength_signal/65536)) + 20);
                        ctx.stroke();
                        ctx.restore();
                        */

          /* Find real end of the top of signal */
          for (
            j = end_signal;
            fft_data[j] - noise_level < 0.75 * (strength_signal - noise_level);
            j--
          ) {
            end_signal = j;
          }
          /*
                        ctx.lineWidth=1;
                        ctx.strokeStyle = 'white';
                        ctx.beginPath();
                        ctx.moveTo((end_signal/fft_data.length)*canvasWidth, canvasHeight * (1 - (strength_signal/65536)));
                        ctx.lineTo((end_signal/fft_data.length)*canvasWidth, canvasHeight * (1 - (strength_signal/65536)) + 20);
                        ctx.stroke();
                        ctx.restore();
                        */

          mid_signal = start_signal + (end_signal - start_signal) / 2.0;

          signal_bw = align_symbolrate(
            (end_signal - start_signal) * (9.0 / fft_data.length)
          );
          signal_freq = 490.5 + ((mid_signal + 1) / fft_data.length) * 9.0;

          signals.push({
            start: (start_signal / fft_data.length) * canvasWidth,
            end: (end_signal / fft_data.length) * canvasWidth,
            top: canvasHeight - (strength_signal / 65536) * canvasHeight,
            frequency: 10000 + signal_freq,
            symbolrate: 1000.0 * signal_bw,
          });

          // Exclude signals in beacon band
          if (signal_freq < 492.0) {
            if (signal_bw >= 1.0) {
              // Probably the Beacon!
              beacon_strength = strength_signal;
            }
            continue;
          }

          /*
                            console.log("####");
                        for(j = start_signal; j < end_signal; j++)
                        {
                        console.log(fft_data[j]);
                        }
                        */

          /* Sanity check bandwidth, and exclude beacon */
          if (signal_bw != 0) {
            text_x_position = (mid_signal / fft_data.length) * canvasWidth;

            /* Adjust for right-side overlap */
            if (text_x_position > 0.92 * canvasWidth) {
              text_x_position = canvasWidth - 55;
            }

            ctx.font = "14px Arial";
            ctx.fillStyle = background_colour === "black" ? "white" : "black";
            ctx.textAlign = "center";
            if (!is_overpower(beacon_strength, strength_signal, signal_bw)) {
              ctx.fillText(
                print_symbolrate(signal_bw) +
                  ", " +
                  print_frequency(signal_freq, signal_bw),
                text_x_position,
                canvasHeight - (strength_signal / 65536) * canvasHeight - 16
              );
              ctx.restore();
            } else {
              ctx.fillText(
                "[over-power]",
                text_x_position,
                canvasHeight - (strength_signal / 65536) * canvasHeight - 16
              );
              ctx.restore();

              ctx.lineWidth = 2;
              ctx.strokeStyle =
                background_colour === "black" ? "white" : "black";
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(
                (start_signal / fft_data.length) * canvasWidth,
                canvasHeight * (1 - (beacon_strength - 1.0 * scale_db) / 65536)
              );
              ctx.lineTo(
                (end_signal / fft_data.length) * canvasWidth,
                canvasHeight * (1 - (beacon_strength - 1.0 * scale_db) / 65536)
              );
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.restore();
            }
          }
        }
      }
    }

    if (in_signal) {
      end_signal = fft_data.length;
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

      ctx.font = "14px Arial";
      ctx.fillStyle = background_colour === "black" ? "white" : "black";
      ctx.textAlign = "center";
      ctx.fillText(
        "[out-of-band]",
        canvasWidth - 55,
        canvasHeight - (strength_signal / 65536) * canvasHeight - 16
      );
      ctx.restore();
    }

    if (mouse_in_canvas) {
      render_frequency_info(mouse_x, mouse_y);

      render_signal_box(mouse_x, mouse_y);
    }

    if (typeof signal_selected !== "undefined" && signal_selected != null) {
      render_signal_selected_box(clicked_x, clicked_y);
    }
  }

  function render_signal_box(mouse_x, mouse_y) {
    let channelSpace = Math.floor(
      (canvasHeight * (4 / 8) - canvasHeight * (1 / 100)) / rx_count
    );
    let channel_lines = [];
    let top_line_y = 5;
    let square = {};
    if (mouse_y < (canvasHeight * 7) / 8) {
      for (i = 0; i < signals.length; i++) {
        if (
          mouse_x > signals[i].start &&
          mouse_x < signals[i].end
          /* && mouse_y > signals[i].top */
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
          channel_lines.push(top_line_y);
          /* ctx height = 500 */
          for (let rx = 0; rx < rx_count; rx++) {
            /* channel lines */
            channel_lines.push(channelSpace * (rx + 1));
            ctx.font = "13px" + " Arial";
            ctx.fillText(
              `CH${rx + 1}`,
              signals[i].start - 20,
              channelSpace * rx + channelSpace / 2
            );
            if (
              mouse_x > signals[i].start &&
              mouse_x < signals[i].end &&
              mouse_y > channel_lines[rx] &&
              mouse_y < channel_lines[rx + 1]
            ) {
              channelClicked = rx + 1;
              channel_coords.x1 = signals[i].start;
              channel_coords.x2 = signals[i].end;
              channel_coords.y1 = channel_lines[rx];
              ctx.globalAlpha = 0.2;
              ctx.fillStyle = invertColor(band_colour);
              ctx.fillRect(
                channel_coords.x1,
                channel_coords.y1,
                signals[i].end - signals[i].start,
                channelSpace
              );
              square["number"] = channelClicked;
              square["x1"] = channel_coords.x1;
              square["y1"] = channel_coords.y1;
              square["width"] = signals[i].end - signals[i].start;
              square["height"] = channelSpace;
              /* console.log(square) */
              highlighted_channel = square;
              ctx.globalAlpha = 1.0;
            }

            ctx.beginPath();
            ctx.moveTo(signals[i].start, channelSpace * (rx + 1));
            ctx.lineTo(signals[i].end, channelSpace * (rx + 1));
            ctx.stroke();
          }
          /* console.log(channel_lines) */
          channel_lines.push(canvasHeight * (7 / 8));
          if (
            mouse_x > signals[i].start &&
            mouse_x < signals[i].end &&
            mouse_y > channel_lines[rx_count]
          ) {
            /* ctx.fillText(`ONBOARD`, signals[i].start + 25,  channelSpace * (rx_count + 1) - 25); */
            channelClicked = rx_count + 1;
            /* ctx.fillRect(signals[i].start, channelSpace * (rx + 1), signals[i].end - signals[i].start, 10); */
          }
          /* RIGHT LINE */
          ctx.beginPath();
          ctx.moveTo(signals[i].end, canvasHeight * (7 / 8));
          ctx.lineTo(signals[i].end, canvasHeight * (1 / 100));
          ctx.stroke();

          /* As long as we have a beacon, and for signals other than the beacon, display relative power on mouseover */
          if (beacon_strength > 0 && signals[i].start > canvasWidth / 8) {
            ctx.font =
              (signals[i].symbolrate < 500 ? "11px" : "12px") + " Arial";
            ctx.fillStyle = background_colour === "black" ? "white" : "black";
            ctx.textAlign = "center";
            if (
              Math.round(
                parseFloat(signals[i].frequency - 8089.5).toFixed(2) * 4
              ) /
                4 !==
              10491.5
            ) {
              canvasClickBW = signals[i].symbolrate / 1000;
              uplink =
                Math.round(
                  parseFloat(signals[i].frequency - 8089.5).toFixed(2) * 4
                ) / 4;
              downlink =
                Math.round(parseFloat(signals[i].frequency).toFixed(2) * 4) / 4;
              busy = true;
              activeXd1 = signals[i].start;
              activeXd2 = signals[i].end;
            }
            db_per_pixel = ((canvasHeight * 7) / 8 - canvasHeight / 12) / 15; // 15dB screen window
            beacon_strength_pixel =
              canvasHeight - (beacon_strength / 65536) * canvasHeight;
            let mer = `${(
              (beacon_strength_pixel +
                (beacon_strength_pixel - signals[i].top)) /
              db_per_pixel
            ).toFixed(1)} / ${(
              (beacon_strength_pixel - signals[i].top) /
              db_per_pixel
            ).toFixed(1)} dBb`;
            /* let mer = `${((beacon_strength_pixel + (beacon_strength_pixel - signals[i].top)) / db_per_pixel).toFixed(1)} dB`; */
            ctx.fillText(
              mer,
              signals[i].start - (signals[i].start - signals[i].end) / 2,
              (canvasHeight * 7) / 8 -
                (7 * ((canvasHeight * 7) / 8 - signals[i].top)) / 8
            );
          }
          busy = true;
          ctx.restore();
          return;
        }
      }
      canvasClickBW = undefined;
      uplink = undefined;
      busy = false;
    }
  }

  function render_signal_selected_box(mouse_clicked_x, mouse_clicked_y) {
    if (mouse_y < (canvasHeight * 7) / 8) {
      for (i = 0; i < signals.length; i++) {
        if (
          mouse_clicked_x > signals[i].start &&
          mouse_clicked_x < signals[i].end &&
          mouse_clicked_y > signals[i].top
        ) {
          signal_selected = signals[i];

          ctx.save();
          ctx.lineWidth = 3;
          ctx.strokeStyle = background_colour === "black" ? "white" : "black";
          ctx.beginPath();
          ctx.moveTo(signal_selected.start, canvasHeight * (7 / 8));
          ctx.lineTo(signal_selected.start, signal_selected.top);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(signal_selected.start, signal_selected.top);
          ctx.lineTo(signal_selected.end, signal_selected.top);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(signal_selected.end, canvasHeight * (7 / 8));
          ctx.lineTo(signal_selected.end, signal_selected.top);
          ctx.stroke();
          ctx.restore();

          return;
        }
      }
    }
  }

  function render_frequency_info(mouse_x, mouse_y) {
    let display_triggered = false;
    if (mouse_y > (canvasHeight * 7) / 8) {
      for (let i = 0; i < freq_info.length; i++) {
        xd1 = freq_info[i].x1;
        xd2 = freq_info[i].x2;
        yd = freq_info[i].y;
        if (
          mouse_x > xd1 - 1 &&
          mouse_x < xd2 + 1 &&
          mouse_y > yd - 3 &&
          mouse_y < yd + 9
        ) {
          canvas_element.title =
            "Downlink: " +
            (10000.0 + freq_info[i].center_frequency) +
            " MHz\nUplink: " +
            (1910.5 + freq_info[i].center_frequency) +
            " MHz\nSymbol Rate: " +
            (freq_info[i].bandwidth == 0.125
              ? "125/66/33 Ksps"
              : freq_info[i].bandwidth == 0.333
              ? freq_info[i].center_frequency < 497.0
                ? "500/333/250 Ksps"
                : "333/250 Ksps"
              : "1 Msps");
          downlink = 10000.0 + freq_info[i].center_frequency;
          uplink = 1910.5 + freq_info[i].center_frequency;
          canvasClickBW =
            uplink < 2407.5 && freq_info[i].bandwidth == 0.333
              ? 0.5
              : freq_info[i].bandwidth;
          busy = false;
          ctx.fillStyle = invertColor(band_colour);
          ctx.fillRect(xd1, yd, xd2 - xd1, 10);
          activeColor = invertColor(band_colour);
          activeXd1 = xd1;
          activeXd2 = xd2;
          activeYd = yd;
          display_triggered = true;
          break;
        }
      }
    }
    if (!display_triggered) {
      canvas_element.title = "";
    }
  }

  function fft_fullscreen() {
    if (canvas_element.requestFullscreen) {
      canvas_element.requestFullscreen();
    } else if (canvas_element.webkitRequestFullScreen) {
      canvas_element.webkitRequestFullScreen();
    } else if (canvas_element.mozRequestFullScreen) {
      canvas_element.mozRequestFullScreen();
    }
  }

  const checkFullScreen = function () {
    if (typeof document.fullScreen != "undefined") {
      return document.fullScreen;
    } else if (typeof document.webkitIsFullScreen != "undefined") {
      return document.webkitIsFullScreen;
    } else if (typeof document.mozFullScreen != "undefined") {
      return document.mozFullScreen;
    } else {
      return false;
    }
  };
  const previousOrientation = window.orientation;
  const checkOrientation = function () {
    if (checkFullScreen()) {
      if (window.orientation !== previousOrientation) {
        if (0 != (previousOrientation + window.orientation) % 180) {
          canvasWidth = window.innerHeight;
          canvasHeight = window.innerWidth;
          initCanvas();
        }
        previousOrientation = window.orientation;
        previousHeight = window.innerHeight;
        previousWidth = window.innerWidth;
      }
    }
  };
  var previousHeight = window.innerHeight;
  var previousWidth = window.innerWidth;
  const checkResize = function () {
    if (
        !checkFullScreen() &&
        (previousHeight != window.innerHeight ||
            previousWidth != window.innerWidth)
    ) {
      let width = document.body.clientWidth - 20;
      let height = document.body.clientHeight;
      canvasHeight =
          height < canvasHeightLast
              ? height
              : canvasHeightLast;
      canvasWidth = width;
      initCanvas(canvas_element);
      previousHeight = window.innerHeight;
      previousWidth = window.innerWidth;
    }
  };
  window.addEventListener("fullscreenchange", function () {
    if (checkFullScreen()) {
      setTimeout(function () {
        /* Set canvas to full document size */
        canvasHeight = canvas_element.height;
        canvasWidth =  canvas_element.width;
        initCanvas();
      }, 10);
    } else {
      /* Reset canvas size */
      canvasHeight = 550;
      canvasWidth = $("#fft-col").width();
      initCanvas();
    }
  });
  window.addEventListener("resize", checkResize, false);
  window.addEventListener("orientationchange", checkOrientation, false);
  // Android doesn't always fire orientationChange on 180 degree turns
  setInterval(checkOrientation, 2000);
})();
