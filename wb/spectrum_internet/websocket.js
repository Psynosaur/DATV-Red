function u16Websocket(s, t, n) {
  (this.ws_url = s),
    (this.ws_name = t),
    (this.ws_buffer = n),
    (this.ws_sock = null),
    (this.ws_reconnect = null),
    (this.ws_data = null),
    (this.connect = function () {
      "undefined" != typeof MozWebSocket
        ? (this.ws_sock = new MozWebSocket(this.ws_url, this.ws_name))
        : (this.ws_sock = new WebSocket(this.ws_url, this.ws_name)),
        (this.ws_sock.binaryType = "arraybuffer"),
        (this.ws_sock.onopen = this.onopen.bind(this)),
        (this.ws_sock.onmessage = this.onmessage.bind(this)),
        (this.ws_sock.onclose = this.onclose.bind(this));
    }),
    (this.onopen = function () {
      window.clearInterval(this.ws_reconnect), (this.ws_reconnect = null);
    }),
    (this.onmessage = function (s) {
      try {
        (this.ws_data = new Uint16Array(s.data)),
          null != this.ws_data && this.ws_buffer.push(this.ws_data);
      } catch (s) {
        console.log("Error parsing binary!", s);
      }
    }),
    (this.onclose = function () {
      null != this.ws_sock && this.ws_sock.close(),
        (this.ws_sock = null),
        this.ws_reconnect ||
          (this.ws_reconnect = setInterval(
            function () {
              this.connect();
            }.bind(this),
            500
          ));
    }),
    (this.changeName = function (s) {
      (this.ws_name = s), null != this.ws_sock && this.ws_sock.close();
    }),
    "WebSocket" in window
      ? this.connect()
      : alert("Websockets are not supported in your browser!");
}
