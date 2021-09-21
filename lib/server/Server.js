const path = require('path')
const express = require('express')
const http = require('http')
// const MemoryFs = require('memory-fs') // 内存文件系统
const fs = require('fs-extra') // 暂时使用硬盘文件系统
fs.join = path.join
const mime = require('mime')
const socketIO = require('socket.io')
const updateCompiler = require('./updateCompiler')
class Server {
  constructor(compiler){
    this.compiler = compiler;
    updateCompiler(this.compiler)
    this.setupApp();
    this.currentHash; // 当前的hash值，每次编译都会产生一个hash值
    this.clientSocketList = []; // 存放着所有的通过websocket连接到服务器的客户端
    this.setupHooks();
    this.setupDevMiddleware();
    this.routes();
    this.createServer();
    this.createSocketServer();
  }
  createSocketServer(){
    // websocket协议握手是需要依赖http服务器的
    const io = socketIO(this.server)
    // 服务器监听客户端的连接，当客户端连接上来后，socket代表跟这个客户端连接的对象
    io.on('connection', socket => {
      console.log('一个新的客户端已经连接')
      this.clientSocketList.push(socket)
      socket.emit('hash', this.currentHash)
      socket.emit('ok')
      socket.on('disconnect', () => {
        const index = this.clientSocketList.indexOf(socket)
        this.clientSocketList.splice(index, 1)
      })
    })
  }
  routes(){
    const { compiler } = this
    const config = compiler.options
    this.app.use(this.middleware(config.output.path))
  }
  setupDevMiddleware(){
    this.middleware = this.webpackDevMiddleware(); // 返回一个express中间件
  }
  webpackDevMiddleware(){
    const { compiler } = this
    // 以监听模式启动编译，如果以后文件发生变更了，会重新编译
    compiler.watch({

    }, () => {
      console.log('监听模式编译成功')
    })

    // const fs = new MemoryFs()
    // this.fs = compiler.outputFileSystem = fs;
    this.fs = compiler.outputFileSystem = fs;
    // 返回一个中间件，用来响应客户端对于产出文件的请求，比如：index.html，main.js，.json
    // staticDir 静态文件根目录，它其实就是输出目录 output dist目录
    return (staticDir) => {
      return (req, res, next) => {
        let { url } = req;
        if(url === '/favicon.ico'){
          return res.sendStatus(404)
        }
        url === '/' ? url = './index.html' : null;
        const filePath = path.join(staticDir, url);
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
  }
  setupHooks(){
    const { compiler } = this;
    compiler.hooks.done.tap('webpack-dev-server', (stats) => {
      // stats是一个描述对象，里面放着打包后的结果 hash chunkHash contentHash 产生了哪些代码块，哪些模块
      console.log('hash', stats.hash)
      this.currentHash = stats.hash
      this.clientSocketList.forEach(socket => {
        socket.emit('hash', this.currentHash)
        socket.emit('ok')
      })
    })
  }
  setupApp(){
    this.app = express();
  }

  createServer(){
    this.server = http.createServer(this.app)
  }

  listen(port, host, callback){
    this.server.listen(port, host, callback)
  }

}

module.exports = Server

