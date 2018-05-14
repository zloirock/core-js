'use strict';
var isObject = require('../internals/is-object');
var isArray = require('../internals/is-array');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var toLength = require('../internals/to-length');
var toIndexedObject = require('../internals/to-indexed-object');
var createProperty = require('../internals/create-property');
var SPECIES = require('../internals/well-known-symbol')('species');
var nativeSlice = [].slice;
var max = Math.max;

var SPECIES_SUPPORT = require('../internals/check-array-species-create')(function (array) {
  return array.slice();
});

// `Array.prototype.slice` method
// https://tc39.github.io/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
require('../internals/export')({ target: 'Array', proto: true, forced: !SPECIES_SUPPORT }, {
  slice: function slice(start, end) {
    var O = toIndexedObject(this);
    var length = toLength(O.length);
    var k = toAbsoluteIndex(start, length);
    var final = toAbsoluteIndex(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject(Constructor)) {
        Constructor = Constructor[SPECIES];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === Array || Constructor === undefined) return nativeSlice.call(O, k, final);
    }
    result = new (Constructor === undefined ? Array : Constructor)(max(final - k, 0));
    for (n = 0; k < final; k++, n++) if (k in O) createProperty(result, n, O[k]);
    result.length = n;
    return result;
  }
});
