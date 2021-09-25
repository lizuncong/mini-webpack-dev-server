'use strict';
const updateCompiler = require('./utils/updateCompiler');

class Server {
  constructor(compiler, options = {}) {

    this.compiler = compiler;
    this.options = options;

    updateCompiler(this.compiler, this.options);
    this.setupHooks();

  }

}

module.exports = Server;
