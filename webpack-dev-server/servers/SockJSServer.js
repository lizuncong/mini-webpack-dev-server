'use strict';
const sockjs = require('sockjs');

module.exports = class SockJSServer {
  constructor(server) {
    this.server = server;
    this.socket = sockjs.createServer();
    this.socket.installHandlers(this.server.listeningApp, {
      prefix: this.server.sockPath,
    });
  }

  send(connection, message) {
    // prevent cases where the server is trying to send data while connection is closing
    if (connection.readyState !== 1) {
      return;
    }

    connection.write(message);
  }

  close(connection) {
    connection.close();
  }

  // f should be passed the resulting connection and the connection headers
  onConnection(f) {
    this.socket.on('connection', (connection) => {
      f(connection, connection ? connection.headers : null);
    });
  }

  onConnectionClose(connection, f) {
    connection.on('close', f);
  }
};
