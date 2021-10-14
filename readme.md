### 运行
- npm run dev 会以官方的webpack-dev-server启动项目，对应的配置文件是webpack.config.js
- node webpack-dev-server 运行的是迷你版本的webpack-dev-server，对应的配置文件是webpack.config.mini.js

### HMR
Hot Module Replacement(模块热更新)是指当我们对代码修改并保存后，webpack将会对代码进行重新打包，并将新的模块发送到浏览器端，
浏览器用新的模块替换掉旧的模块，以实现在不刷新浏览器的前提下更新页面

为了实现HMR，浏览器和服务器必须建立一个websocket连接。服务端监听文件修改，生成一个[hash].hot-update.json文件告诉浏览器有哪些模块修改了，
以及[chunk].[hash].hot-update.js补丁文件。

- webpack配置项入口entry增加两个文件，用于注入websocket相关代码
    + client/index.js用于和服务端建立websocket连接
    + hot/dev-server.js。当浏览器通过websocket接收到服务端发出的ok信息后，dev-server.js执行module.hot.check热更新检查
- HotModuleReplacementPlugin.js用于向main.js中注入热更新运行时代码，以及生成.hot-update.json和.hot-update.js补丁文件
    + 向window挂载webpackHotUpdate方法
    + compilation.mainTemplate.hooks一系列的hooks就是用于webpack bootstrap代码中注入热更新运行时代码
    + compilation.hooks.additionalChunkAssets和compilation.hooks.record这两个钩子用于生成.hot-update.json及.hot-update.js补丁文件
- HotModuleReplacement.runtime.js模块热更新运行时代码热更新的流程：
    + client/index.js接收到服务端ok信息，hot/dev-server执行module.hot.check热更新检查
    + module.hot.check方法里面调用hotDownloadManifest方法向服务端请求.hot-update.json文件
    + 浏览器拿到.hot-update.json里面的模块，遍历.c属性中的键，向服务器请求.hot-update.js补丁文件
    + 补丁文件是个自执行脚本，webpackHotUpdate("main", {/**模块对象**/})
    + window.webpackHotUpdate方法调用hotAddUpdateChunk方法收集需要更新的模块，并替换掉旧模块，执行hotApply方法
    + hotApply主要是从缓存中删除旧模块，并且执行module.hot.accept回调

### webpack-dev-server/lib/Server.js
webpack-dev-server就是一个express服务器，主要逻辑在Server.js文件中，Server.js主要做了以下处理：
- updateCompiler.js。
    + 更新webpack config的entry配置项，向entry中注入两个入口，用于实现客户端和服务端通信。
        + clientEntry: './node_modules/webpack-dev-server/client/index.js?http://localhost:8080'。这里主要是创建websocket连接，定义websocket各种消息类型。其中最重要的是hash和ok消息。
          如果客户端收到服务端ok消息时，会调用`hotEmitter.emit('webpackHotUpdate', currentHash)`发射一个更新的事件。
        + hotEntry: './node_modules/webpack/hot/dev-server.js'。这里主要是调用`hotEmitter.on("webpackHotUpdate", function(currentHash) { module.hot.check() })`监听更新事件，
          并调用module.hot.check方法检查更新
          + 会监听 webpackHotUpdate 事件
          + 在check方法里会调用module.hot.check方法
          + 调用 hotDownloadManifest，向server端发送Ajax请求，服务端返回一个Manifest文件(hash.hot-update.json)，该Manifest
            包含了本次编译hash值和更新模块的chunk名
          + 调用 JsonpMainTemplate.runtime 的 hotDownloadUpdateChunk 方法通过JSONP请求获取到最新的模块代码
          + 补丁js取回来后会调用JsonpMainTemplate.runtime.js的webpackHotUpdate方法
          + 然后会调用HotModuleReplacement.runtime.js的hotAddUpdateChunk方法动态更新模块代码
          + 然后调用hotApply方法进行热更新
          + 从缓存中删除旧模块
          + 执行accept的回调
    + HotModuleReplacementPlugin兜底。
    + 注入__webpack_dev_server_client__变量

- 初始化一个express服务。
- 设置webpack dev middleware
    + 使用watch模式启动编译，并设置compiler的钩子
    + 设置文件读写系统，这里使用的是memory-fs
    + 返回一个中间件，这个中间件的作用是提供静态资源服务，比如hot-update.json、hot-update.js文件等。同时，如果此时还在编译中，但是浏览器此时
      有请求过来，比如用户刷新了浏览器，那么中间件能对请求进行一个delay，并等编译完成后再响应这些请求。
- 使用sockjs初始化一个websocket连接。

#### HotModuleReplacementPlugin
- 它会生成两个补丁文件
    + 上一次编译生成的hash.hot-update.json，说明从上次编译到现在哪些代码块发生改变。json里面c对象表明哪些代码块发生了改变，
    h表示本次编译生成的hash值，可以作为下一次热更新时补丁文件的前缀。
    + chunk名字 上一次编译生成的hash.hot-update.js，存放着此代码块最新的模块定义，里面会
    调用webpackHotUpdate方法
- 向代码块中注入HMR runtime代码，热更新的主要逻辑，比如拉取代码，执行代码，执行accept回调都是它注入到chunk中的
- hotCreateRequire 会帮我们给模块module的parents，children赋值。




