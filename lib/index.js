const webpack = require('webpack')
const Server = require('./server/Server')
const config = require('../webpack.config')

const compiler = webpack(config)

const server = new Server(compiler);

server.listen(9090, 'localhost', () => {
  console.log('服务已经在9090端口上使用')
})
