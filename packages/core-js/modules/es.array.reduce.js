'use strict';
var internalReduce = require('../internals/array-reduce');
var SLOPPY_METHOD = !require('../internals/strict-method')([].reduce, true);

// `Array.prototype.reduce` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
require('../internals/export')({ target: 'Array', proto: true, forced: SLOPPY_METHOD }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    return internalReduce(this, callbackfn, arguments.length, arguments[1], false);
  }
});
