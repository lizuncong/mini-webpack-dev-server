/**
 * 1.连接websocket服务器
 * 2.websocket客户端监听事件：监听hash事件，保存hash值；
 * 3.监听ok事件，执行reloadApp方法进行更新
 * 4.在reloadApp中会进行判断，是否支持热更新，如果支持的话发射 webpackHotUpdate 事件，如果不支持则直接刷新浏览器
 * 5.在 webpack/hot/dev-server.js 会监听 webpackHotUpdate 事件
 * 6.在check方法里会调用module.hot.check方法
 * 7.调用 hotDownloadManifest，向server端发送Ajax请求，服务端返回一个Manifest文件(hash.hot-update.json)，该Manifest
 *   包含了本次编译hash值和更新模块的chunk名
 * 8.调用 JsonpMainTemplate.runtime 的 hotDownloadUpdateChunk 方法通过JSONP请求获取到最新的模块代码
 * 9.补丁js取回来后会调用JsonpMainTemplate.runtime.js的webpackHotUpdate方法
 * 10.然后会调用HotModuleReplacement.runtime.js的hotAddUpdateChunk方法动态更新模块代码
 * 11.然后调用hotApply方法进行热更新
 * 12.从缓存中删除旧模块
 * 13.执行accept的回调
 * **/


let currentHash;

class EventEmitter{
  constructor(){
    this.events = {}
  }

  on(eventName, fn){
    this.events[eventName] = fn
  }

  emit(eventName, ...args){
    this.events[eventName](...args)
  }
}

let hotEmitter = new EventEmitter()
const socket = window.io('/');

socket.on('hash', hash => {
  currentHash = hash
})


socket.on('ok', () => {
  console.log('客户端接收到ok事件');
  reloadApp();
})


function reloadApp(){
  hotEmitter.emit("webpackHotUpdate")
}
