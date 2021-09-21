let input = document.createElement('input')

document.body.appendChild(input)


let div = document.createElement('div')

document.body.appendChild(div)

let render = () => {
  const title = require('./title.js')
  div.innerHTML = title;
}

render()


if(module.hot){
  // 注册回调 当前index.js模块可以接收title.js的变更，
  // 当title.js变更后可以重新调用render方法。
  module.hot.accept(['./title.js'], render)
}
