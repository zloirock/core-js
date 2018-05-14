'use strict';
var internalSome = require('../internals/array-methods')(3);

var SLOPPY_METHOD = !require('../internals/strict-method')([].some, true);

// `Array.prototype.some` method
// https://tc39.github.io/ecma262/#sec-array.prototype.some
require('../internals/export')({ target: 'Array', proto: true, forced: SLOPPY_METHOD }, {
  some: function some(callbackfn /* , thisArg */) {
    return internalSome(this, callbackfn, arguments[1]);
  }
});
