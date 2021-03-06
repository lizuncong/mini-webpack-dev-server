// import SockJS from 'sockjs-client'; // 为了不干扰核心逻辑，这里就不将sockjs打包进bundle中，使用external的方式引用。
import hotEmitter from '../hot/emitter';

// 目的是初始化socket实例，和服务端保持长连接
const status = {
  currentHash: ''
};

// 原本的onSocketMessage支持的事件：hot、liveReload、invalid、hash、still-ok、log-level、
// log-level、overlay、progress、progress-update、ok、content-changed、warnings、errors、error、close
const onSocketMessage = {
  hot: function hot() {
    console.info('[WDS] Hot Module Replacement enabled.');
  },
  invalid: function invalid() {
    console.info('[WDS] App updated. Recompiling...');
  },
  hash: function hash(_hash) {
    console.log('[MINIWDS] hash....')
    status.currentHash = _hash;
  },
  ok: function ok() {
    console.info('[MINIWDS] App hot update...');
    // reloadApp
    hotEmitter.emit('webpackHotUpdate', status.currentHash);
  }
};


const socketUrl = "http://localhost:8081/sockjs-node";
const sock = new SockJS(socketUrl);
sock.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (onSocketMessage[msg.type]) {
    onSocketMessage[msg.type](msg.data);
  }
};
