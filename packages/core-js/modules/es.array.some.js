'use strict';
var $ = require('../internals/export');
var arrayMethods = require('../internals/array-methods');
var sloppyArrayMethod = require('../internals/sloppy-array-method');

var internalSome = arrayMethods(3);
var SLOPPY_METHOD = sloppyArrayMethod('some');

// `Array.prototype.some` method
// https://tc39.github.io/ecma262/#sec-array.prototype.some
$({ target: 'Array', proto: true, forced: SLOPPY_METHOD }, {
  some: function some(callbackfn /* , thisArg */) {
    return internalSome(this, callbackfn, arguments[1]);
  }
});
