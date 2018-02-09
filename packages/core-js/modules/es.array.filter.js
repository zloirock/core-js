'use strict';
var internalFilter = require('./_array-methods')(2);

// `Array.prototype.filter` method
// https://tc39.github.io/ecma262/#sec-array.prototype.filter
require('./_export')({ target: 'Array', proto: true, forced: !require('./_strict-method')([].filter, true) }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return internalFilter(this, callbackfn, arguments[1]);
  }
});
