import hotEmitter from './emitter'
if (module.hot) {
  var lastHash;
  hotEmitter.on("webpackHotUpdate", function(currentHash) {
    lastHash = currentHash;
    module.hot.check().then(res => {
      if(lastHash.indexOf(__webpack_require__.h()) >= 0){
        console.log("info", "[HMR] App is up to date.");
      }
    });
  });
  console.log("info", "[HMR] Waiting for update signal from WDS...");
} else {
  throw new Error("[HMR] Hot Module Replacement is disabled.");
}
