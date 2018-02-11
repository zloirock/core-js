'use strict';
var internalIncludes = require('../internals/array-includes')(true);

// `Array.prototype.includes` method
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
require('../internals/export')({ target: 'Array', proto: true }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return internalIncludes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
require('../internals/add-to-unscopables')('includes');
