'use strict';
var internalFilter = require('../internals/array-methods')(2);
var SLOPPY_METHOD = !require('../internals/strict-method')([].filter, true);

// `Array.prototype.filter` method
// https://tc39.github.io/ecma262/#sec-array.prototype.filter
require('../internals/export')({ target: 'Array', proto: true, forced: SLOPPY_METHOD }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return internalFilter(this, callbackfn, arguments[1]);
  }
});
