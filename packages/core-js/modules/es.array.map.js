'use strict';
var internalMap = require('../internals/array-methods')(1);
var SLOPPY_METHOD = !require('../internals/strict-method')([].map, true);

// `Array.prototype.map` method
// https://tc39.github.io/ecma262/#sec-array.prototype.map
require('../internals/export')({ target: 'Array', proto: true, forced: SLOPPY_METHOD }, {
  map: function map(callbackfn /* , thisArg */) {
    return internalMap(this, callbackfn, arguments[1]);
  }
});
