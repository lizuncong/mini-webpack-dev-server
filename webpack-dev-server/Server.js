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

    updateCompiler(this.compiler, this.options);
    this.setupHooks();
    this.setupApp();
    this.setupDevMiddleware();
    this.setupMiddleware();
    // this.routes();
    this.createServer();


  }

  setupMiddleware() {
    this.app.use(this.middleware);
  }
  createServer(){
    this.server = http.createServer(this.app)
  }

  setupDevMiddleware() {
    // middleware for serving webpack bundle
    this.middleware = this.webpackDevMiddleware();
  }

  webpackDevMiddleware(){
    const { compiler } = this
    // 1.创建一个context

    // 2.启动编译
    compiler.watch({

    }, () => {
      console.log('监听模式编译成功')
    })
    // 3. 设置文件读写系统
    // const fs = new MemoryFs()
    // this.fs = compiler.outputFileSystem = fs;
    this.fs = compiler.outputFileSystem = fs;

    // 4. 返回一个中间件，用来响应客户端对于产出文件的请求，比如：index.html，main.js，.json
    // staticDir 静态文件根目录，它其实就是输出目录 output dist目录
    return (req, res, next) => {
      let { url } = req;
      // 1.获取文件名称
      url === '/' ? url = './index.html' : null;
      const filePath = path.join(compiler.options.output.path, url);
      try{

        const statObj = this.fs.statSync(filePath)
        if(statObj.isFile()){
          const content = this.fs.readFileSync(filePath)
          res.setHeader('Content-Type', mime.getType(filePath))
          res.send(content)
        } else {
          return res.sendStatus(404)
        }
      }catch(err){
        console.log('err..', err)
        return res.sendStatus(404)
      }
    }
  }

  setupApp() {
    this.app = new express();
  }
  setupHooks(){
    const { compile, invalid, done } = this.compiler.hooks;
    compile.tap('webpack-dev-server', () => {
      console.log('compile..hook')
    });
    invalid.tap('webpack-dev-server', () => {
      console.log('invalid..hook')
    });
    done.tap('webpack-dev-server', (stats) => {
      // this.currentHash = stats.hash
      // this.sockets.forEach(socket => {
      //   socket.emit('hash', this.currentHash)
      //   socket.emit('ok')
      // })
      this.sockets.forEach((socket) => {
        this.socketServer.send(socket, JSON.stringify({ type: 'hash', data: stats.hash }));
        this.socketServer.send(socket, JSON.stringify({ type: 'ok' }));
      });

    })
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

  listen(port, host, callback){
    this.server.listen(port, host, callback)
  }
}

module.exports = Server;
