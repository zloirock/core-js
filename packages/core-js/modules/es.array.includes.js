'use strict';
var $ = require('../internals/export');
var arrayIncludes = require('../internals/array-includes');
var addToUnscopables = require('../internals/add-to-unscopables');

var internalIncludes = arrayIncludes(true);

// `Array.prototype.includes` method
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
$({ target: 'Array', proto: true }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return internalIncludes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('includes');
