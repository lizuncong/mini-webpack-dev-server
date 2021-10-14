const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  mode: 'development',
  devtool: "source-map",
  // entry 里可以配置多个入口，每个入口有一个名称，默认就是main
  // webpack从入口文件开始进行编译，找到它依赖的模块，打包在一起，
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    hot: true,
  },
  plugins: [
      new HtmlWebpackPlugin({
        template: 'index.html'
      }),
      new webpack.HotModuleReplacementPlugin()
  ]
}
