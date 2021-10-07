
// 为了实现客户端跟服务器端通信，需要往入口里多注入两个文件：
const path = require('path')
function updateCompiler(compiler){
  const config = compiler.options;
  config.entry = [
      path.resolve(__dirname, '../client/index.js'),
      path.resolve(__dirname, '../hot/dev-server.js'),
      config.entry,
  ]
  compiler.hooks.entryOption.call(config.context, config.entry); // 如果不调用，会怎样

}

module.exports = updateCompiler;
