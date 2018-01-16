'use strict';
var $some = require('./_array-methods')(3);

require('./_export')({ target: 'Array', proto: true, forced: !require('./_strict-method')([].some, true) }, {
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn /* , thisArg */) {
    return $some(this, callbackfn, arguments[1]);
  }
});
