'use strict';
const sockjs = require('sockjs');


module.exports = class SockJSServer  {
  // options has: error (function), debug (function), server (http/s server), path (string)
  constructor(server) {
    this.server = server;
    this.socket = sockjs.createServer({
      // Use provided up-to-date sockjs-client
      sockjs_url: '/__webpack_dev_server__/sockjs.bundle.js',
      // Limit useless logs
      log: (severity, line) => {
        if (severity === 'error') {
          console.error('sockjs..error', line);
        } else {
          console.log('sockjs..debug', line);
        }
      },
    });

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
