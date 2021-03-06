"use strict";

const { SyncBailHook } = require("tapable");
const { RawSource } = require("webpack-sources");
const ParserHelpers = require("webpack/lib/ParserHelpers");
const ModuleHotAcceptDependency = require("webpack/lib/dependencies/ModuleHotAcceptDependency");

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
				const hotUpdateChunkTemplate = compilation.hotUpdateChunkTemplate;

				/**
				 * compilation.hooks.record以及compilation.hooks.additionalChunkAssets用于生成补丁文件
				 * **/
				compilation.hooks.record.tap(
					"HotModuleReplacementPlugin",
					(compilation, records) => {
						if (records.hash === compilation.hash) return;
						records.hash = compilation.hash;
						records.moduleHashs = {};
						for (const module of compilation.modules) {
							const identifier = module.identifier();
							records.moduleHashs[identifier] = module.hash;
						}
						records.chunkHashs = {};
						for (const chunk of compilation.chunks) {
							records.chunkHashs[chunk.id] = chunk.hash;
						}
						records.chunkModuleIds = {};
						for (const chunk of compilation.chunks) {
							records.chunkModuleIds[chunk.id] = Array.from(
								chunk.modulesIterable,
								m => m.id
							);
						}
					}
				);
				compilation.hooks.additionalChunkAssets.tap(
					"HotModuleReplacementPlugin",
					() => {
						const records = compilation.records;
						if (records.hash === compilation.hash) return;
						if (
							!records.moduleHashs ||
							!records.chunkHashs ||
							!records.chunkModuleIds
						)
							return;
						for (const module of compilation.modules) {
							const identifier = module.identifier();
							let hash = module.hash;
							module.hotUpdate = records.moduleHashs[identifier] !== hash;
						}
						const hotUpdateMainContent = {
							h: compilation.hash,
							c: {}
						};
						for (const key of Object.keys(records.chunkHashs)) {
							const chunkId = isNaN(+key) ? key : +key;
							const currentChunk = compilation.chunks.find(
								chunk => `${chunk.id}` === key
							);
							if (currentChunk) {
								const newModules = currentChunk
									.getModules()
									.filter(module => module.hotUpdate);
								const allModules = new Set();
								for (const module of currentChunk.modulesIterable) {
									allModules.add(module.id);
								}
								const removedModules = records.chunkModuleIds[chunkId].filter(
									id => !allModules.has(id)
								);
								if (newModules.length > 0 || removedModules.length > 0) {
									const source = hotUpdateChunkTemplate.render(
										chunkId,
										newModules,
										removedModules,
										compilation.hash,
										compilation.moduleTemplates.javascript,
										compilation.dependencyTemplates
									);
									const {
										path: filename,
										info: assetInfo
									} = compilation.getPathWithInfo(hotUpdateChunkFilename, {
										hash: records.hash,
										chunk: currentChunk
									});
									compilation.additionalChunkAssets.push(filename);
									compilation.emitAsset(
										filename,
										source,
										Object.assign({ hotModuleReplacement: true }, assetInfo)
									);
									hotUpdateMainContent.c[chunkId] = true;
									currentChunk.files.push(filename);
									compilation.hooks.chunkAsset.call(currentChunk, filename);
								}
							} else {
								hotUpdateMainContent.c[chunkId] = false;
							}
						}
						console.log('==============12', RawSource)
						const source = new RawSource(JSON.stringify(hotUpdateMainContent));
						const {
							path: filename,
							info: assetInfo
						} = compilation.getPathWithInfo(hotUpdateMainFilename, {
							hash: records.hash
						});
						compilation.emitAsset(
							filename,
							source,
							Object.assign({ hotModuleReplacement: true }, assetInfo)
						);
					}
				);

				/**
				 * 以下代码主要是为了注入hmr runtime代码
				 * **/
				const mainTemplate = compilation.mainTemplate;

				mainTemplate.hooks.bootstrap.tap(
					"HotModuleReplacementPlugin",
					(source, chunk, hash) => {
						// source = mainTemplate.hooks.hotBootstrap.call(source, chunk, hash); // 热更新运行时代码
						source = ''
						return [
							source,
							"",
							hotInitCode
								.replace(/\$require\$/g, mainTemplate.requireFn)
								.replace(/\$hash\$/g, JSON.stringify(hash))
								.replace(/\$requestTimeout\$/g, this.requestTimeout)
								.replace(
									/\/\*foreachInstalledChunks\*\//g,
										`var chunkId = ${JSON.stringify(chunk.id)};`
								)
						].join('\n')
					}
				);
				mainTemplate.hooks.moduleRequire.tap(
					"HotModuleReplacementPlugin",
					(_, chunk, hash, varModuleId) => {
						return `hotCreateRequire(${varModuleId})`;
					}
				);
				mainTemplate.hooks.requireExtensions.tap(
					"HotModuleReplacementPlugin",
					source => {
						const buf = [source];
						buf.push("");
						buf.push("// __webpack_hash__");
						buf.push(
							mainTemplate.requireFn +
							".h = function() { return hotCurrentHash; };"
						);
						return buf.join("\n");
					}
				);

				mainTemplate.hooks.currentHash.tap(
					"HotModuleReplacementPlugin",
					(_, length) => {
						return "hotCurrentHash"
					}
				);

				mainTemplate.hooks.moduleObj.tap(
					"HotModuleReplacementPlugin",
					(source, chunk, hash, varModuleId) => {
						return [
							`${source},`,
							`hot: hotCreateModule(${varModuleId}),`,
							"parents: [],",
							"children: []"
						].join('\n');
					}
				);


				compilation.dependencyFactories.set(
					ModuleHotAcceptDependency,
					normalModuleFactory
				);
				compilation.dependencyTemplates.set(
					ModuleHotAcceptDependency,
					new ModuleHotAcceptDependency.Template()
				);
				const addParserPlugins = (parser, parserOptions) => {

					parser.hooks.call
						.for("module.hot.accept")
						.tap("HotModuleReplacementPlugin", expr => {
							if (!parser.state.compilation.hotUpdateChunkTemplate) {
								return false;
							}
							if (expr.arguments.length >= 1) {
								const arg = parser.evaluateExpression(expr.arguments[0]);
								let params = [];
								let requests = [];
								if (arg.isString()) {
									params = [arg];
								} else if (arg.isArray()) {
									params = arg.items.filter(param => param.isString());
								}
								if (params.length > 0) {
									params.forEach((param, idx) => {
										const request = param.string;
										const dep = new ModuleHotAcceptDependency(request, param.range);
										dep.optional = true;
										dep.loc = Object.create(expr.loc);
										dep.loc.index = idx;
										parser.state.module.addDependency(dep);
										requests.push(request);
									});
									if (expr.arguments.length > 1) {
										parser.hooks.hotAcceptCallback.call(
											expr.arguments[1],
											requests
										);
										parser.walkExpression(expr.arguments[1]); // other args are ignored
										return true;
									} else {
										parser.hooks.hotAcceptWithoutCallback.call(expr, requests);
										return true;
									}
								}
							}
						});
					// 替换src/index.js中 if (module.hot) {...} 的module.hot为true字面量
					parser.hooks.evaluateIdentifier.for("module.hot").tap(
						{
							name: "HotModuleReplacementPlugin",
							before: "NodeStuffPlugin"
						},
						expr => {
							return ParserHelpers.evaluateToIdentifier(
								"module.hot",
								!!parser.state.compilation.hotUpdateChunkTemplate
							)(expr);
						}
					)
					parser.hooks.expression
						.for("module.hot")
						.tap("HotModuleReplacementPlugin", () =>  true);
				};
				normalModuleFactory.hooks.parser
					.for("javascript/auto")
					.tap("HotModuleReplacementPlugin", addParserPlugins);
				// compilation.hooks.normalModuleLoader.tap(
				// 	"HotModuleReplacementPlugin",
				// 	context => {
				// 		context.hot = true;
				// 	}
				// );
		})
	}
};


