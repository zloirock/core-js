'use strict';
var globalThis = require('../internals/global-this');
var call = require('../internals/function-call');

module.exports = function (source, target, length) {
  // the `Uint8Array` and `set` polyfills can load after `structuredClone` or `transfer`
  var Uint8Array = globalThis.Uint8Array;
  var bytes = new Uint8Array(source, 0, length);
  call(Uint8Array.prototype.set, new Uint8Array(target, 0, length), bytes);
};
