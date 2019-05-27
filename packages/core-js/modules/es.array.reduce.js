'use strict';
var $ = require('../internals/export');
var internalReduce = require('../internals/array-reduce');
var sloppyArrayMethod = require('../internals/sloppy-array-method');

var SLOPPY_METHOD = sloppyArrayMethod('reduce');

// `Array.prototype.reduce` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
$({ target: 'Array', proto: true, forced: SLOPPY_METHOD }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    return internalReduce(this, callbackfn, arguments.length, arguments[1], false);
  }
});
