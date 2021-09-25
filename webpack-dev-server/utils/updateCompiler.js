/**
 * updateCompiler主要任务是给webpack config entry增加两个入口，用于实现客户端和服务器端通信
 * 1.clientEntry: '/Users/lizuncong/Documents/手写源码系列/mini-webpack-dev-server/node_modules/webpack-dev-server/client/index.js?http://localhost:8080'
 * 2.hotEntry: '/Users/lizuncong/Documents/手写源码系列/mini-webpack-dev-server/node_modules/webpack/hot/dev-server.js'
 * **/
// 为了实现客户端跟服务器端通信，需要往入口里多注入两个文件：
const path = require('path')
function updateCompiler(compiler){
  const config = compiler.options;
  // config.entry = {
  //   main: [
  //     path.resolve(__dirname, '../client/index.js'),
  //     path.resolve(__dirname, './client/hot/dev-server.js'),
  //     config.entry,
  //   ]
  // }
  config.entry = [
      path.resolve(__dirname, '../client/index.js'),
      path.resolve(__dirname, '../hot/dev-server.js'),
      config.entry,
  ]
  compiler.hooks.entryOption.call(config.context, config.entry); // 如果不调用，会怎样

}

module.exports = updateCompiler;
