'use strict';
var internalMap = require('./_array-methods')(1);

// `Array.prototype.map` method
// https://tc39.github.io/ecma262/#sec-array.prototype.map
require('./_export')({ target: 'Array', proto: true, forced: !require('./_strict-method')([].map, true) }, {
  map: function map(callbackfn /* , thisArg */) {
    return internalMap(this, callbackfn, arguments[1]);
  }
});
