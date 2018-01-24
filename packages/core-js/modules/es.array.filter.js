'use strict';
var $filter = require('./_array-methods')(2);

require('./_export')({ target: 'Array', proto: true, forced: !require('./_strict-method')([].filter, true) }, {
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments[1]);
  }
});
