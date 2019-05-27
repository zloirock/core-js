'use strict';
var $ = require('../internals/export');
var internalReduce = require('../internals/array-reduce');
var sloppyArrayMethod = require('../internals/sloppy-array-method');
var SLOPPY_METHOD = sloppyArrayMethod('reduceRight');

// `Array.prototype.reduceRight` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
$({ target: 'Array', proto: true, forced: SLOPPY_METHOD }, {
  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
    return internalReduce(this, callbackfn, arguments.length, arguments[1], true);
  }
});
