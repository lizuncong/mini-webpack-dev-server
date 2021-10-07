"use strict";

const { SyncBailHook } = require("tapable");


module.exports = class HotModuleReplacementPlugin {
	constructor(options) {
		debugger;
		this.options = options || {};
		this.multiStep = undefined;
		this.fullBuildTimeout =  200;
		this.requestTimeout = 10000;
	}

	apply(compiler) {
		const multiStep = this.multiStep;
		const fullBuildTimeout = this.fullBuildTimeout;
		const requestTimeout = this.requestTimeout;
		// hotUpdateChunkFilename以及hotUpdateMainFilename在调用webpack(config)初始化时，通过
		// new WebpackOptionsDefaulter注入的，代码在lib/webpack.js，WebpackOptionsDefaulter.js中。
		const hotUpdateChunkFilename =
				compiler.options.output.hotUpdateChunkFilename;
		const hotUpdateMainFilename = compiler.options.output.hotUpdateMainFilename;
		compiler.hooks.additionalPass.tapAsync(
				"HotModuleReplacementPlugin",
				callback => {
					console.log('hotModuleReplacementPlugin...additionalPass')
					if (multiStep) return setTimeout(callback, fullBuildTimeout);
					return callback();
				}
		);

		compiler.hooks.compilation.tap(
				"HotModuleReplacementPlugin",
				(compilation, { normalModuleFactory }) => {
					// This applies the HMR plugin only to the targeted compiler
					// It should not affect child compilations
					console.log('hotModuleReplacementPlugin...compilation')
					if (compilation.compiler !== compiler) return;
					console.log('hotModuleReplacementPlugin2...compilation')
				}
		);
	}
};
