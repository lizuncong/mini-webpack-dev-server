let currentHash;
let lastHash;

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

let hotEmitter = new EventEmitter();
(function(modules){

  var installedModules = {};
  function hotCheck(){
    hotDownloadManifest().then(update => {
      const chunkIds = Object.keys(update.c);
      chunkIds.forEach(chunkId => {
        hotDownloadUpdateChunk(chunkId)
      })
      lastHash = currentHash
    }).catch(() => {
      window.location.reload()
    })
  }

  function hotDownloadUpdateChunk(chunkId){
    const script = document.createElement('script')
    script.src = `${chunkId}.${lastHash}.hot-update.js`
    document.head.appendChild(script)
  }

  let hotUpdate = {};
  window.webpackHotUpdate = function(chunkId, moreModules){
    hotAddUpdateChunk(chunkId, moreModules)
  }

  function hotAddUpdateChunk(chunkId, moreModules){
    for(let moduleId in moreModules){
      modules[moduleId] = hotUpdate[moduleId] = moreModules[moduleId]
    }
    hotApply()
  }

  function hotApply(){
      for(let moduleId in hotUpdate){
        const oldModule = installedModules[moduleId]
        delete installedModules[moduleId]
        oldModule.parents.forEach(parentModule => {
          const cb = parentModule.hot._acceptedDependencies[moduleId]
          cb && cb();
        })
      }
  }

  function hotDownloadManifest(){
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `${lastHash}.hot-update.json`;
      xhr.open('get', url)
      xhr.responseType = 'json'
      xhr.onload = function(){
        resolve(xhr.response)
      }
      xhr.send();
    })
  }
  function hotCreateModule(){
    const hot = {
      _acceptedDependencies: {},
      accept(deps, callback){
        deps.forEach(dep => {
          hot._acceptedDependencies[dep] = callback
        })
      },
      check: hotCheck
    }

    return hot
  }
  // 给每个模块维护父子关系
  function hotCreateRequire(parentModuleId){
    const parentModule = installedModules[parentModuleId]
    if(!parentModule) return __webpack_require__;
    const hotRequire = function(childModuleId){
      __webpack_require__(childModuleId)
      const childModule = installedModules[childModuleId]
      childModule.parents.push(parentModule)
      parentModule.children.push(childModuleId)
      return childModule.exports
    }

    return hotRequire;
  }
  function __webpack_require__(moduleId){
    if(installedModules[moduleId]){
      return installedModules[moduleId]
    }
    let module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {},
      hot: hotCreateModule(), // 用于热更新 if(module.hot){ module.hot.accept()}
      parents: [], // 维护父子模块的关系，用于热更新
      children: [], // 维护父子模块的关系，用于热更新
    }
    modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId))
    module.l = true
    return module.exports
  }
  __webpack_require__.c = installedModules
  hotCreateRequire('./src/index.js')('./src/index.js')

  console.log(installedModules);
  return;
})({
  "./src/index.js": function(module, exports, __webpack_require__){
    __webpack_require__('client/index.js')
    __webpack_require__('client/hot/dev-server.js')
    let input = document.createElement('input')
    document.body.appendChild(input)
    let div = document.createElement('div')
    document.body.appendChild(div)
    let render = () => {
      const title = __webpack_require__('./src/title.js')
      div.innerHTML = title;
    }
    render()
    if(module.hot){
      module.hot.accept(['./src/title.js'], render)
    }
  },
  "./src/title.js": function(module, exports, __webpack_require__){
    module.exports = "title"
  },
  "client/index.js": function(module, exports, __webpack_require__){
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
  },
  "client/hot/dev-server.js": function(module, exports, __webpack_require__){
    hotEmitter.on('webpackHotUpdate', () => {
      if(!lastHash){ // 第一次渲染
        lastHash = currentHash;
        console.log('lastHash：', lastHash, 'currentHash：', currentHash)
        return;
      }
      console.log('lastHash：', lastHash, 'currentHash：', currentHash)
      // 调用hot.check方法向服务器检查更新并且拉取最新的代码
      module.hot.check()
    })
  },
})
