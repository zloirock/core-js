'use strict';
var internalFilter = require('../internals/array-methods')(2);

var SPECIES_SUPPORT = require('../internals/check-array-species-create')(function (array) {
  return array.filter(Boolean);
});

// `Array.prototype.filter` method
// https://tc39.github.io/ecma262/#sec-array.prototype.filter
// with adding support of @@species
require('../internals/export')({ target: 'Array', proto: true, forced: !SPECIES_SUPPORT }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return internalFilter(this, callbackfn, arguments[1]);
  }
});
