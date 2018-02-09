'use strict';
var internalSome = require('./_array-methods')(3);

// `Array.prototype.some` method
// https://tc39.github.io/ecma262/#sec-array.prototype.some
require('./_export')({ target: 'Array', proto: true, forced: !require('./_strict-method')([].some, true) }, {
  some: function some(callbackfn /* , thisArg */) {
    return internalSome(this, callbackfn, arguments[1]);
  }
});
