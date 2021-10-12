"use strict";

const { SyncBailHook } = require("tapable");

const FUNCTION_CONTENT_REGEX = /^function\s?\(\)\s?\{\r?\n?|\r?\n?\}$/g;
const INDENT_MULTILINE_REGEX = /^\t/gm;
const LINE_SEPARATOR_REGEX = /\r?\n/g;
function getFunctionContent(fn) {
	return fn
		.toString()
		.replace(FUNCTION_CONTENT_REGEX, "")
		.replace(INDENT_MULTILINE_REGEX, "")
	// .replace(LINE_SEPARATOR_REGEX, "\n");
}

// HMR runtime 代码
const hotInitCode = getFunctionContent(
	require("./HotModuleReplacement.runtime")
);

module.exports = class HotModuleReplacementPlugin {
	constructor(options) {
		debugger;
		this.options = options || {};
		this.fullBuildTimeout =  200;
		this.requestTimeout = 10000;
		console.log('=====my hot module replacement plugin=====')
	}

	apply(compiler) {
		// hotUpdateChunkFilename以及hotUpdateMainFilename在调用webpack(config)初始化时，通过
		// new WebpackOptionsDefaulter注入的，代码在lib/webpack.js，WebpackOptionsDefaulter.js中。
		const hotUpdateChunkFilename =
				compiler.options.output.hotUpdateChunkFilename;
		const hotUpdateMainFilename = compiler.options.output.hotUpdateMainFilename;

		compiler.hooks.compilation.tap(
			'MiniHotModuleReplacementPlugin',
			(compilation, { normalModuleFactory }) => {
				// This applies the HMR plugin only to the targeted compiler
				// It should not affect child compilations
				if (compilation.compiler !== compiler) return;

				const mainTemplate = compilation.mainTemplate;

				mainTemplate.hooks.bootstrap.tap(
					"HotModuleReplacementPlugin",
					(source, chunk, hash) => {
						return hotInitCode
					}
				);
		})
	}
};


