'use strict';
var $ = require('../internals/export');
var hasIndex = require('../internals/array-has-index');
var isArray = require('../internals/is-array');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var toIndexedObject = require('../internals/to-indexed-object');
var createProperty = require('../internals/create-property');
var setArrayLength = require('../internals/array-set-length');
var arraySpeciesConstructor = require('../internals/array-species-constructor');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');
var nativeSlice = require('../internals/array-slice');
var V8_VERSION = require('../internals/environment-v8-version');
var IS_IE = require('../internals/environment-is-ie-or-edge');

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');

// IE <= 11 and V8 < 4.9 predate array proxies, so reading an array's length again has no side effects.
var LEGACY_SLICE = IS_IE === true || V8_VERSION > 0 && V8_VERSION < 49;

var $Array = Array;
var max = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  slice: function slice(start, end) {
    var O = toIndexedObject(this);
    if (HAS_SPECIES_SUPPORT && isArray(O)) return nativeSlice(O, start, end);
    var length = lengthOfArrayLike(O);
    var k = toAbsoluteIndex(start, length);
    var fin = end === undefined ? length : toAbsoluteIndex(end, length);
    var Constructor = arraySpeciesConstructor(O);
    // Bound or species conversion may have shortened the source.
    if (LEGACY_SLICE && Constructor === $Array && isArray(O) && fin <= O.length) return nativeSlice(O, k, fin);
    var result = new Constructor(max(fin - k, 0));
    var n;
    for (n = 0; k < fin; k++, n++) if (hasIndex(O, k)) createProperty(result, n, O[k]);
    setArrayLength(result, n);
    return result;
  }
});
