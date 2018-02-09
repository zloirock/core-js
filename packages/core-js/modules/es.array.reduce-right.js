'use strict';
var internalReduceRight = require('./_array-reduce');

// `Array.prototype.reduceRight` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
require('./_export')({ target: 'Array', proto: true, forced: !require('./_strict-method')([].reduceRight, true) }, {
  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
    return internalReduceRight(this, callbackfn, arguments.length, arguments[1], true);
  }
});
