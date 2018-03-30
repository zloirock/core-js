'use strict';
var internalMap = require('../internals/array-methods')(1);

var SPECIES_SUPPORT = require('../internals/check-array-species-create')(function (array) {
  return array.map(Boolean);
});

// `Array.prototype.map` method
// https://tc39.github.io/ecma262/#sec-array.prototype.map
// with adding support of @@species
require('../internals/export')({ target: 'Array', proto: true, forced: !SPECIES_SUPPORT }, {
  map: function map(callbackfn /* , thisArg */) {
    return internalMap(this, callbackfn, arguments[1]);
  }
});
