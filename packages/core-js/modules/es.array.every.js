'use strict';
var internalEvery = require('../internals/array-methods')(4);
var SLOPPY_METHOD = !require('../internals/strict-method')([].every, true);

// `Array.prototype.every` method
// https://tc39.github.io/ecma262/#sec-array.prototype.every
require('../internals/export')({ target: 'Array', proto: true, forced: SLOPPY_METHOD }, {
  every: function every(callbackfn /* , thisArg */) {
    return internalEvery(this, callbackfn, arguments[1]);
  }
});
