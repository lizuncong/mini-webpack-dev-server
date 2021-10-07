/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _print_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./print.js */ "./src/print.js");


function component() {
  const element = document.createElement('div');
  const btn = document.createElement('button');

  element.innerHTML = 'Hello Webpack Dev Server';

  btn.innerHTML = 'Click me and check the console!';
  btn.onclick = _print_js__WEBPACK_IMPORTED_MODULE_0__["default"];

  element.appendChild(btn);

  return element;
}

let element = component(); // 存储 element，以在 print.js 修改时重新渲染
document.body.appendChild(element);


if (false) {}


/***/ }),

/***/ "./src/print.js":
/*!**********************!*\
  !*** ./src/print.js ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return printMe; });
function printMe() {
  console.log('I get called from print.js!1');
  // console.log('Updating print.js...');
}


/***/ }),

/***/ "./webpack-dev-server/client/index.js":
/*!********************************************!*\
  !*** ./webpack-dev-server/client/index.js ***!
  \********************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hot_emitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../hot/emitter */ "./webpack-dev-server/hot/emitter.js");
// import SockJS from 'sockjs-client'; // 为了不干扰核心逻辑，这里就不将sockjs打包进bundle中，使用external的方式引用。


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
    _hot_emitter__WEBPACK_IMPORTED_MODULE_0__["default"].emit('webpackHotUpdate', status.currentHash);
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


/***/ }),

/***/ "./webpack-dev-server/hot/dev-server.js":
/*!**********************************************!*\
  !*** ./webpack-dev-server/hot/dev-server.js ***!
  \**********************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _emitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./emitter */ "./webpack-dev-server/hot/emitter.js");

if (false) { var lastHash; } else {
  throw new Error("[HMR] Hot Module Replacement is disabled.");
}


/***/ }),

/***/ "./webpack-dev-server/hot/emitter.js":
/*!*******************************************!*\
  !*** ./webpack-dev-server/hot/emitter.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
class EventEmitter {
  constructor(){
    this.events = {}
  }
  on(evtName, cb){
    this.events[evtName] = (this.events[evtName] || []).push(cb)
  }
  emit(evtName, ...args){
    (this.events[evtName] || []).forEach(cb => {
      cb(...args)
    })
  }

}
/* harmony default export */ __webpack_exports__["default"] = (new EventEmitter());


/***/ }),

/***/ 0:
/*!********************************************************************************************************!*\
  !*** multi ./webpack-dev-server/client/index.js ./webpack-dev-server/hot/dev-server.js ./src/index.js ***!
  \********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! /Users/lizuncong/Documents/手写源码系列/mini-webpack-dev-server/webpack-dev-server/client/index.js */"./webpack-dev-server/client/index.js");
__webpack_require__(/*! /Users/lizuncong/Documents/手写源码系列/mini-webpack-dev-server/webpack-dev-server/hot/dev-server.js */"./webpack-dev-server/hot/dev-server.js");
module.exports = __webpack_require__(/*! ./src/index.js */"./src/index.js");


/***/ })

/******/ });
//# sourceMappingURL=main.js.map