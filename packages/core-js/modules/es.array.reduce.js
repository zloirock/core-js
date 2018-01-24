'use strict';
var $reduce = require('./_array-reduce');

require('./_export')({ target: 'Array', proto: true, forced: !require('./_strict-method')([].reduce, true) }, {
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: function reduce(callbackfn /* , initialValue */) {
    return $reduce(this, callbackfn, arguments.length, arguments[1], false);
  }
});
