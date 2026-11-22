'use strict';
var $ = require('../internals/export');
var fails = require('../internals/fails');
var hasIndex = require('../internals/array-has-index');
var isArray = require('../internals/is-array');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var toIndexedObject = require('../internals/to-indexed-object');
var createProperty = require('../internals/create-property');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var setArrayLength = require('../internals/array-set-length');
var arraySpeciesConstructor = require('../internals/array-species-constructor');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');
var arrayMethodSetsPositiveLength = require('../internals/array-method-sets-positive-length');
var mayTruncateToNegativeZero = require('../internals/may-truncate-to-negative-zero');
var nativeSlice = require('../internals/array-slice');
var V8_VERSION = require('../internals/environment-v8-version');
var IS_IE = require('../internals/environment-is-ie-or-edge');

var $Array = Array;
var ArrayPrototype = $Array.prototype;
var max = Math.max;

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');

// An end that truncates to -0 is kept as -0: V8 5.1 - 6.3 set it as the `length` of the result,
// V8 6.4 - 8.1 pass it to the species constructor while elements follow the start.
// https://github.com/v8/v8/commit/b590679496e829fd2f88ba4494072f0196c979de
// https://github.com/v8/v8/commit/8c8bd658c6f3a765a73ac49e57b7b138a67db635
var NEGATIVE_ZERO_END = HAS_SPECIES_SUPPORT && !arrayMethodSetsPositiveLength([].slice, [0, -0]);

// V8 5.1 - 6.3 skip writing the `length` of a species result when the end falls before the start, ChakraCore - of any
// empty one, so it fails the probe above too.
// https://github.com/v8/v8/commit/b590679496e829fd2f88ba4494072f0196c979de
// https://github.com/chakra-core/ChakraCore/blob/a75335bb5ab3905236902b2aede192ab64eed9df/lib/Runtime/Library/JavascriptArray.cpp#L6451-L6455
var SKIPS_EMPTY_LENGTH = HAS_SPECIES_SUPPORT && !arrayMethodSetsPositiveLength([].slice, [1, 0]);

// ChakraCore copies only up to the current length, so when the bounds conversion or the species lookup shrinks an array
// with indices on its own prototype, the inherited elements of the dropped range are lost
// https://github.com/chakra-core/ChakraCore/blob/a75335bb5ab3905236902b2aede192ab64eed9df/lib/Runtime/Library/JavascriptArray.cpp#L11318
var LOSES_INHERITED_ELEMENTS = HAS_SPECIES_SUPPORT && fails(function () {
  var array = setPrototypeOf([0, 0], setPrototypeOf({ 1: 1 }, ArrayPrototype));
  var start = { valueOf: function () {
    array.length = 1;
    return 0;
  } };
  return nativeSlice(array, start)[1] !== 1;
});

// ChakraCore truncates the start of an array-like to 32 bits and does not read the index 2 ** 32 - 1, which is not an
// array index
// https://github.com/chakra-core/ChakraCore/blob/a75335bb5ab3905236902b2aede192ab64eed9df/lib/Runtime/Library/JavascriptArray.cpp#L6445-L6446
var LOSES_LARGE_INDICES = HAS_SPECIES_SUPPORT && fails(function () {
  var result = nativeSlice({ length: 4294967298, 4294967295: 1, 4294967296: 2 }, 4294967295);
  return result[0] !== 1 || result[1] !== 2;
});

// IE <= 11 and V8 < 4.9 predate array proxies, so reading an array's length again has no side effects.
var LEGACY_SLICE = IS_IE === true || V8_VERSION > 0 && V8_VERSION < 49;

var FORCED = !HAS_SPECIES_SUPPORT || NEGATIVE_ZERO_END || SKIPS_EMPTY_LENGTH || LOSES_INHERITED_ELEMENTS || LOSES_LARGE_INDICES;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$({ target: 'Array', proto: true, forced: FORCED }, {
  slice: function slice(start, end) {
    // only an array gets a species result, so only there the native may keep -0 or skip the `length`;
    // ChakraCore loses inherited elements only of an array with another prototype, large indices - of a non-array
    if (HAS_SPECIES_SUPPORT && !(NEGATIVE_ZERO_END && mayTruncateToNegativeZero(end) && isArray(this))
      && !(LOSES_INHERITED_ELEMENTS && isArray(this) && getPrototypeOf(this) !== ArrayPrototype)
      && !(LOSES_LARGE_INDICES && !isArray(this))) {
      var sliced = nativeSlice(this, start, end);
      // writing `length` is the last step of `slice`, so the skipped write can follow the native call;
      // a proxy result sees one more `has`
      if (SKIPS_EMPTY_LENGTH && !isArray(sliced) && !('length' in sliced)) sliced.length = 0;
      return sliced;
    }
    var O = toIndexedObject(this);
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
