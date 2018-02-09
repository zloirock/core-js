'use strict';
var internalEvery = require('./_array-methods')(4);

// `Array.prototype.every` method
// https://tc39.github.io/ecma262/#sec-array.prototype.every
require('./_export')({ target: 'Array', proto: true, forced: !require('./_strict-method')([].every, true) }, {
  every: function every(callbackfn /* , thisArg */) {
    return internalEvery(this, callbackfn, arguments[1]);
  }
});
