'use strict';
var $map = require('./_array-methods')(1);

require('./_export')({ target: 'Array', proto: true, forced: !require('./_strict-method')([].map, true) }, {
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments[1]);
  }
});
