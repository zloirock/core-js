'use strict';
var $ = require('../internals/export');
var right = require('../internals/array-reduce').right;
var sloppyArrayMethod = require('../internals/sloppy-array-method');

// `Array.prototype.reduceRight` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
$({ target: 'Array', proto: true, forced: sloppyArrayMethod('reduceRight') }, {
  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
    return right(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});
