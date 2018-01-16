'use strict';
var $reduce = require('./_array-reduce');

require('./_export')({ target: 'Array', proto: true, forced: !require('./_strict-method')([].reduceRight, true) }, {
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
    return $reduce(this, callbackfn, arguments.length, arguments[1], true);
  }
});
