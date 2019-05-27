'use strict';
var $ = require('../internals/export');
var arrayMethods = require('../internals/array-methods');
var sloppyArrayMethod = require('../internals/sloppy-array-method');

var internalEvery = arrayMethods(4);
var SLOPPY_METHOD = sloppyArrayMethod('every');

// `Array.prototype.every` method
// https://tc39.github.io/ecma262/#sec-array.prototype.every
$({ target: 'Array', proto: true, forced: SLOPPY_METHOD }, {
  every: function every(callbackfn /* , thisArg */) {
    return internalEvery(this, callbackfn, arguments[1]);
  }
});
