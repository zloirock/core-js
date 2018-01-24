'use strict';
// 22.1.3.11 Array.prototype.includes(searchElement [ , fromIndex ])
var $includes = require('./_array-includes')(true);

require('./_export')({ target: 'Array', proto: true }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

require('./_add-to-unscopables')('includes');
