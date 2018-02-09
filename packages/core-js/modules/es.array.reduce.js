'use strict';
var internalReduce = require('./_array-reduce');

// `Array.prototype.reduce` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
require('./_export')({ target: 'Array', proto: true, forced: !require('./_strict-method')([].reduce, true) }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    return internalReduce(this, callbackfn, arguments.length, arguments[1], false);
  }
});
