const webpack = require('webpack')
const config = require('../webpack.config.mini')
const Server = require('./Server')

const options = {
  clientLogLevel:'info',
  filename:'main.js',
  host:'localhost',
  hot:true,
  hotOnly:undefined,
  port:8081,
  publicPath:'/',
  stats: {
    cached:false,
    cachedAssets:false
  }
}
function startDevServer(config, options) {
  const compiler = webpack(config);
  const server = new Server(compiler, options);
  server.listen(options.port, options.host, (err) => {
    console.log('server listening on ', options.port)
    if (err) {
      throw err;
    }
  });
}

startDevServer(config, options)
