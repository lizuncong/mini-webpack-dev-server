/******/ (function(modules) { // webpackBootstrap
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentHash = "e51fbdbad6853d611ca0";
/******/
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateRequire(moduleId) {
/******/ 		var me = installedModules[moduleId];
/******/ 		if (!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			__webpack_require__(request)
/******/ 			const module = installedModules[request]
/******/ 			if (module.parents.indexOf(me) === -1) {
/******/ 				module.parents.push(me);
/******/ 			}
/******/ 			if (me.children.indexOf(module) === -1) {
/******/ 				me.children.push(module);
/******/ 			}
/******/ 			return module.exports;
/******/ 		};
/******/ 		function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for (var name in __webpack_require__) {
/******/ 			if (
/******/ 					Object.prototype.hasOwnProperty.call(__webpack_require__, name) &&
/******/ 					name !== "e" &&
/******/ 					name !== "t"
/******/ 				) {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 				}
/******/ 			}
/******/ 		return fn;
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateModule(moduleId) {
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			accept: function(dep, callback) {
/******/ 				if (typeof dep === "object"){
/******/ 					for (let i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				} else {
/******/ 					hot._acceptedDependencies[dep] = callback || function() {};
/******/ 				}
/******/ 			},
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 		};
/******/ 		return hot;
/******/ 	}
/******/
/******/
/******/ 	// while downloading
/******/ 	var hotAvailableFilesMap = {};
/******/
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/
/******/ 	window["webpackHotUpdate"] = function(chunkId, moreModules){
/******/ 		hotAddUpdateChunk(chunkId, moreModules)
/******/ 	}
/******/
/******/ 	function hotAddUpdateChunk(chunkId, moreModules){
/******/ 		for(let moduleId in moreModules){
/******/ 			modules[moduleId] = hotUpdate[moduleId] = moreModules[moduleId]
/******/ 		}
/******/ 		hotApply()
/******/ 	}
/******/
/******/ 	function hotApply(){
/******/ 		for(let moduleId in hotUpdate){
/******/ 			const oldModule = installedModules[moduleId]
/******/ 			delete installedModules[moduleId]
/******/ 			oldModule.parents.forEach(parentModule => {
/******/ 				const cb = parentModule.hot._acceptedDependencies[moduleId]
/******/ 				cb && cb();
/******/ 			})
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotDownloadManifest(){
/******/ 		return new Promise((resolve, reject) => {
/******/ 			const xhr = new XMLHttpRequest();
/******/ 			const url = `${hotCurrentHash}.hot-update.json`;
/******/ 			xhr.open('get', url)
/******/ 			xhr.responseType = 'json'
/******/ 			xhr.onload = function(){
/******/ 				resolve(xhr.response)
/******/ 			}
/******/ 			xhr.send();
/******/ 		})
/******/ 	}
/******/ 	function hotDownloadUpdateChunk(chunkId){
/******/ 		const script = document.createElement('script')
/******/ 		script.src = `${chunkId}.${hotCurrentHash}.hot-update.js`
/******/ 		document.head.appendChild(script)
/******/ 	}
/******/ 	function hotCheck(apply) {
/******/ 		return hotDownloadManifest().then(function(update) {
/******/ 			if (!update) {
/******/ 				return null;
/******/ 			}
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/ 			hotUpdate = {};
/******/ 			Object.keys(hotAvailableFilesMap).forEach(chunkId => {
/******/ 				hotDownloadUpdateChunk(chunkId)
/******/ 			})
/******/ 			hotCurrentHash = hotUpdateNewHash
/******/ 			return Promise.resolve();
/******/ 		});
/******/ 	}
/******/
/******/
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
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: [],
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
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
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(__webpack_require__.s = 0);
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


if (true) {
  module.hot.accept(/*! ./print.js */ "./src/print.js", function(__WEBPACK_OUTDATED_DEPENDENCIES__) { /* harmony import */ _print_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./print.js */ "./src/print.js");
(function() {
    console.log('Accepting the updated printMe module!');
    document.body.removeChild(element);
    element = component(); // 重新渲染 "component"，以便更新 click 事件处理函数
    document.body.appendChild(element);
  })(__WEBPACK_OUTDATED_DEPENDENCIES__); }.bind(this))
}


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
  console.log('123I get called from print.js!12345678966789');
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

if (true) {
  var lastHash;
  _emitter__WEBPACK_IMPORTED_MODULE_0__["default"].on("webpackHotUpdate", function(currentHash) {
    lastHash = currentHash;
    module.hot.check().then(res => {
      if(lastHash.indexOf(__webpack_require__.h()) >= 0){
        console.log("info", "[HMR] App is up to date.");
      }
    });
  });
  console.log("info", "[HMR] Waiting for update signal from WDS...");
} else {}


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
    const cbs = this.events[evtName] || [];
    cbs.push(cb)
    this.events[evtName] = cbs
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

__webpack_require__(/*! /Users/lizc/Documents/MYProjects/mini-webpack-dev-server/webpack-dev-server/client/index.js */"./webpack-dev-server/client/index.js");
__webpack_require__(/*! /Users/lizc/Documents/MYProjects/mini-webpack-dev-server/webpack-dev-server/hot/dev-server.js */"./webpack-dev-server/hot/dev-server.js");
module.exports = __webpack_require__(/*! ./src/index.js */"./src/index.js");


/***/ })

/******/ });
//# sourceMappingURL=main.js.map