'use strict';
var internalReduceRight = require('../internals/array-reduce');
var SLOPPY_METHOD = !require('../internals/strict-method')([].reduceRight, true);

// `Array.prototype.reduceRight` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
require('../internals/export')({ target: 'Array', proto: true, forced: SLOPPY_METHOD }, {
  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
    return internalReduceRight(this, callbackfn, arguments.length, arguments[1], true);
  }
});
