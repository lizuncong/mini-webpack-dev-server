// eslint-disable no-unused-vars
var $hash$ = undefined;
var installedModules = undefined;
var $require$ = undefined;


module.exports = function() {
	// eslint-disable-next-line no-unused-vars
	var hotCurrentHash = $hash$;


	// eslint-disable-next-line no-unused-vars
	function hotCreateRequire(moduleId) {
		var me = installedModules[moduleId];
		if (!me) return $require$;
		var fn = function(request) {
			$require$(request)
			const module = installedModules[request]
			if (module.parents.indexOf(me) === -1) {
				module.parents.push(me);
			}
			if (me.children.indexOf(module) === -1) {
				me.children.push(module);
			}
			return module.exports;
		};
		function ObjectFactory(name) {
			return {
				configurable: true,
				enumerable: true,
				get: function() {
					return $require$[name];
				},
				set: function(value) {
					$require$[name] = value;
				}
			};
		};
		for (var name in $require$) {
			if (
					Object.prototype.hasOwnProperty.call($require$, name) &&
					name !== "e" &&
					name !== "t"
				) {
				Object.defineProperty(fn, name, ObjectFactory(name));
				}
			}
		return fn;
	}

	// eslint-disable-next-line no-unused-vars
	function hotCreateModule(moduleId) {
		var hot = {
			// private stuff
			_acceptedDependencies: {},
			accept: function(dep, callback) {
				if (typeof dep === "object"){
					for (let i = 0; i < dep.length; i++)
						hot._acceptedDependencies[dep[i]] = callback || function() {};
				} else {
					hot._acceptedDependencies[dep] = callback || function() {};
				}
			},
			// Management API
			check: hotCheck,
		};
		return hot;
	}


	// while downloading
	var hotAvailableFilesMap = {};

	// The update info
	var hotUpdate, hotUpdateNewHash;

	window["webpackHotUpdate"] = function(chunkId, moreModules){
		hotAddUpdateChunk(chunkId, moreModules)
	}

	function hotAddUpdateChunk(chunkId, moreModules){
		for(let moduleId in moreModules){
			modules[moduleId] = hotUpdate[moduleId] = moreModules[moduleId]
		}
		hotApply()
	}

	function hotApply(){
		for(let moduleId in hotUpdate){
			const oldModule = installedModules[moduleId]
			delete installedModules[moduleId]
			oldModule.parents.forEach(parentModule => {
				const cb = parentModule.hot._acceptedDependencies[moduleId]
				cb && cb();
			})
		}
	}

	function hotDownloadManifest(){
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const url = `${hotCurrentHash}.hot-update.json`;
			xhr.open('get', url)
			xhr.responseType = 'json'
			xhr.onload = function(){
				resolve(xhr.response)
			}
			xhr.send();
		})
	}
	function hotDownloadUpdateChunk(chunkId){
		const script = document.createElement('script')
		script.src = `${chunkId}.${hotCurrentHash}.hot-update.js`
		document.head.appendChild(script)
	}
	function hotCheck(apply) {
		return hotDownloadManifest().then(function(update) {
			if (!update) {
				return null;
			}
			hotAvailableFilesMap = update.c;
			hotUpdateNewHash = update.h;
			hotUpdate = {};
			Object.keys(hotAvailableFilesMap).forEach(chunkId => {
				hotDownloadUpdateChunk(chunkId)
			})
			hotCurrentHash = hotUpdateNewHash
			return Promise.resolve();
		});
	}

};
