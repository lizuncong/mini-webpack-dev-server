'use strict';
const path = require('path')
const express = require('express');
const http = require('http')
const mime = require('mime')
const fs = require('fs-extra') // 暂时使用硬盘文件系统
fs.join = path.join
const updateCompiler = require('./utils/updateCompiler');

const HASH_REGEXP = /[0-9a-f]{10,}/;

class Server {
  constructor(compiler, options = {}) {

    this.compiler = compiler;
    this.options = options;
    this.sockets = [];
    this.socketServerImplementation = require('./servers/SockJSServer')
    this.sockPath = '/sockjs-node'
    updateCompiler(this.compiler, this.options);
    this.setupHooks();
    this.setupApp();
    this.setupDevMiddleware();
    this.setupMiddleware();
    this.createServer()

  }

  setupMiddleware() {
    this.app.use(this.middleware);
  }
  createServer(){
    this.listeningApp = http.createServer(this.app)
  }

  setupDevMiddleware() {
    // middleware for serving webpack bundle
    this.middleware = this.webpackDevMiddleware();
  }

  // webpack-dev-middleware的主要流程
  webpackDevMiddleware(){
    const { compiler } = this
    // 1.创建一个context
    const context = {
      state: false, // false说明正在编译，true编译完成
      callbacks: [], // 如果编译还没完成，则delay请求
    }
    compiler.hooks.invalid.tap('WebpackDevMiddleware2', () => {
      context.state = false
    });
    compiler.hooks.run.tap('WebpackDevMiddleware', () => {
      context.state = false
    });
    this.compiler.hooks.done.tap('WebpackDevMiddleware2', (stats) => {
      context.state = true;
      const cbs = context.callbacks;
      context.callbacks = [];
      cbs.forEach((cb) => {
        cb();
      });
    });
    // 2.启动编译
    compiler.watch({
      aggregateTimeout: 200,
    }, (err) => {
    })
    // 3. 设置文件读写系统
    // const fs = new MemoryFs()
    // context.fs = compiler.outputFileSystem = fs;
    context.fs = compiler.outputFileSystem = fs;

    // 4. 返回一个中间件，用来响应客户端对于产出文件的请求，比如：index.html，main.js，.json
    // staticDir 静态文件根目录，它其实就是输出目录 output dist目录
    return (req, res, next) => {
      let { url } = req;
      // 1.获取文件名称
      if(url === '/'){
        url = './index.html'
      }
      const filename = path.join(compiler.options.output.path, url);
      const processRequest = () => {
        try{

          const statObj = context.fs.statSync(filename)
          if(statObj.isFile()){
            const content = context.fs.readFileSync(filename)
            res.setHeader('Content-Type', mime.getType(filename))
            res.setHeader('Content-Length', content.length);
            res.send(content)
          } else {
            return res.sendStatus(404)
          }
        }catch(err){
          console.log('err..', err)
          return res.sendStatus(404)
        }
      }

      if (HASH_REGEXP.test(filename) || context.state) {
        // 如果是带hash的，说明此时编译完成，可以直接处理了请求了。如果context.state为true说明编译也完成了，可以直接处理
        processRequest();
      } else {
        // 正在编译中，so delay the request
        context.callbacks.push(processRequest)
      }
    }
  }

  setupApp() {
    this.app = new express();
  }
  setupHooks(){
    const { compile, invalid, done } = this.compiler.hooks;
    compile.tap('webpack-dev-server', () => {
    });
    invalid.tap('webpack-dev-server', () => {
    });
    done.tap('webpack-dev-server', (stats) => {
      this._sendStats(this.sockets, this.getStats(stats));
    })
  }

  getStats(stats){
    return stats.toJson(stats);
  }

  sockWrite(sockets, type, data) {
    sockets.forEach((socket) => {
      this.socketServer.send(socket, JSON.stringify({ type, data }));
    });
  }


  _sendStats(sockets, stats, force) {
    this.sockWrite(sockets, 'hash', stats.hash);
    this.sockWrite(sockets, 'ok');

  }

  createSocketServer() {
    this.socketServer = new this.socketServerImplementation(this);

    this.socketServer.onConnection((connection, headers) => {
      if (!connection) {
        return;
      }


      // if (!headers || !this.checkHost(headers) || !this.checkOrigin(headers)) {
      //   this.sockWrite([connection], 'error', 'Invalid Host/Origin header');
      //
      //   this.socketServer.close(connection);
      //
      //   return;
      // }

      this.sockets.push(connection);

      this.socketServer.onConnectionClose(connection, () => {
        const idx = this.sockets.indexOf(connection);

        if (idx >= 0) {
          this.sockets.splice(idx, 1);
        }
      });

      // if (this.clientLogLevel) {
      //   this.sockWrite([connection], 'log-level', this.clientLogLevel);
      // }

      // if (this.hot) {
      //   this.sockWrite([connection], 'hot');
      // }

      // TODO: change condition at major version
      // if (this.options.liveReload !== false) {
      //   this.sockWrite([connection], 'liveReload', this.options.liveReload);
      // }

      // if (this.progress) {
      //   this.sockWrite([connection], 'progress', this.progress);
      // }

      // if (this.clientOverlay) {
      //   this.sockWrite([connection], 'overlay', this.clientOverlay);
      // }

      if (!this._stats) {
        return;
      }

      this._sendStats([connection], this.getStats(this._stats), true);
    });
  }

  listen(port, host, callback){
    this.listeningApp.listen(port, host, () => {
      this.createSocketServer();
      callback();
    })
  }
}

module.exports = Server;
