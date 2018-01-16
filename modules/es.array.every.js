'use strict';
var $every = require('./_array-methods')(4);

require('./_export')({ target: 'Array', proto: true, forced: !require('./_strict-method')([].every, true) }, {
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn /* , thisArg */) {
    return $every(this, callbackfn, arguments[1]);
  }
});
