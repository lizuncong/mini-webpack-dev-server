const webpack = require('webpack')
const config = require('../webpack.config')
const Server = require('./Server')

const options = {
  clientLogLevel:'info',
  filename:'main.js',
  host:'localhost',
  hot:true,
  hotOnly:undefined,
  port:8080,
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
    if (err) {
      throw err;
    }
  });
}
