### 什么是HMR
Hot Module Replacement 是指当我们对代码修改并保存后，webpack将会对代码进行重新打包，并将新的模块发送到浏览器端，
浏览器用新的模块替换掉旧的模块，以实现在不刷新浏览器的前提下更新页面


#### HotModuleReplacementPlugin
- 它会生成两个补丁文件
    + 上一次编译生成的hash.hot-update.json，说明从上次编译到现在哪些代码块发生改变。json里面c对象表明哪些代码块发生了改变，
    h表示本次编译生成的hash值，可以作为下一次热更新时补丁文件的前缀。
    + chunk名字 上一次编译生成的hash.hot-update.js，存放着此代码块最新的模块定义，里面会
    调用webpackHotUpdate方法
- 向代码块中注入HMR runtime代码，热更新的主要逻辑，比如拉取代码，执行代码，执行accept回调都是它注入到chunk中的
- hotCreateRequire 会帮我们给模块module的parents，children赋值。


#### 流程
- webpack(config)
    + HotModuleReplacementPlugin
        + 生成hot-update.json
        + 生成hot-update.js
        + 注入运行时代码，HotModuleReplacementPlugin.runtime
    + new Server(compiler)
        + updateCompiler
            + 向entry中注入代码
                + entry: { main: ['webpack-dev-server/client/index.js', 'webpack/hot/dev-server.js', './src/index.js'] }
            + setupHooks
                + compiler.hooks.done
                    
                + 创建express的app实例，setupApp
                    + 创建webpack-dev-middleware，setupDevMiddleware，以watch模式启动编译

#### HotModuleReplacement.runtime
- 调用module.hot.check方法
- 调用hotDownloadManifest
- 调用hotDownloadUpdateChunk
- webpackHotUpdate
- hotAddUpdateChunk
- hotApply
- 从缓存中删除旧模块
- 执行accept的回调


#### 为什么需要2个hash值
lastHash，currentHash

第1次编译的时候，lastHash = currentHash = hash1

客户端里的代码和服务器是一致的，都是hash1

这个时候服务器重新编译了

重新得到1个新的hash值，hash2

还会创建一个hash1的补丁包，包里会说明hash1到hash2哪些代码块发生了变更，以及发生了哪些变更
