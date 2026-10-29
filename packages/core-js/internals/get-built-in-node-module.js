'use strict';
var globalThis = require('../internals/global-this');
var call = require('../internals/function-call');
var IS_NODE = require('../internals/environment-is-node');

module.exports = function (name) {
  if (IS_NODE) {
    try {
      return globalThis.process.getBuiltinModule(name);
    } catch (error) { /* empty */ }
    try {
      return globalThis.process.mainModule.require(name);
    } catch (error) { /* empty */ }
    try {
      // a CommonJS module imported from ESM has no `process.mainModule`
      // indirection keeps bundlers from treating this as a dynamic dependency
      return call(module.require, module, name);
    } catch (error) { /* empty */ }
    try {
      // old Node REPL and `node -e` have global `require`, but no `mainModule`
      // eslint-disable-next-line no-new-func -- safe
      return Function('return require("' + name + '")')();
    } catch (error) { /* empty */ }
  }
};
