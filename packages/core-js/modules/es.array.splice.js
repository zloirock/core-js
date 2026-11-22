'use strict';
var $ = require('../internals/export');
var apply = require('../internals/function-apply');
var hasIndex = require('../internals/array-has-index');
var isArray = require('../internals/is-array');
var toObject = require('../internals/to-object');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var setArrayLength = require('../internals/array-set-length');
var doesNotExceedSafeInteger = require('../internals/does-not-exceed-safe-integer');
var arraySpeciesCreate = require('../internals/array-species-create');
var createProperty = require('../internals/create-property');
var deletePropertyOrThrow = require('../internals/delete-property-or-throw');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');
var arrayMethodSetsPositiveLength = require('../internals/array-method-sets-positive-length');
var mayTruncateToNegativeZero = require('../internals/may-truncate-to-negative-zero');
var createSpliceTestObject = require('../internals/array-splice-test-object');

var nativeSplice = [].splice;
var max = Math.max;
var min = Math.min;
var NATIVE_ON_ARRAYS;
var NATIVE_WITH_FEW_ITEMS;
var NEGATIVE_ZERO_COUNT;

var rejectsOverflow = function () {
  var O = createSpliceTestObject(nativeSplice, 1);
  var length = O.length;
  try {
    apply(nativeSplice, O, arguments);
  } catch (error) {
    return error instanceof TypeError && O.length === length && !(length - 1 in O) && !(length in O);
  }
};

// V8 < 6.8, Firefox < 55, Safari < 14, Chakra and Hermes 0.12 - 0.13 miss the length limit.
// V8 7.1+ rounds length + insertCount before subtracting actualDeleteCount.
// https://issues.chromium.org/issues/42210878
// https://issues.chromium.org/issues/42210878#comment18
var FORCED = function () {
  if (typeof nativeSplice != 'function' || !arrayMethodHasSpeciesSupport('splice')) return true;
  var keepsLimit = rejectsOverflow(-1, 1, 0, 0);
  // A deletion count that truncates to -0 is kept as -0: V8 5.1 passes it to the species constructor,
  // V8 5.1 - 7.0 set it as the `length` of the result, V8 7.1 - 8.1 do both while elements follow the start.
  // https://github.com/v8/v8/commit/915ec67cc62edac4abbba6033e9e88f4f395d14f
  // https://github.com/v8/v8/commit/fd334b3216488011b368ec4652819e08c38d0d36
  // https://github.com/v8/v8/commit/8c8bd658c6f3a765a73ac49e57b7b138a67db635
  NEGATIVE_ZERO_COUNT = !arrayMethodSetsPositiveLength(nativeSplice, [0, -0]);
  if (keepsLimit && !NEGATIVE_ZERO_COUNT) return false;
  NATIVE_WITH_FEW_ITEMS = keepsLimit || rejectsOverflow(-1, 0, 0);
  NATIVE_ON_ARRAYS = true;
  return true;
};

// `Array.prototype.splice` method
// https://tc39.es/ecma262/#sec-array.prototype.splice
$({ target: 'Array', proto: true, forced: FORCED }, {
  splice: function splice(start, deleteCount /* , ...items */) {
    var argumentsLength = arguments.length;
    // Keep native species lookup on arrays, unless the native keeps -0 from the deletion count.
    // An array proxy can still report a length above 2^32 - 1.
    if ((NATIVE_WITH_FEW_ITEMS && (argumentsLength < 4 || deleteCount === 0) || NATIVE_ON_ARRAYS && isArray(this))
      && !(NEGATIVE_ZERO_COUNT && mayTruncateToNegativeZero(deleteCount))) {
      return apply(nativeSplice, this, arguments);
    }
    var O = toObject(this);
    var len = lengthOfArrayLike(O);
    var actualStart = toAbsoluteIndex(start, len);
    var insertCount, actualDeleteCount, newLen, A, k, from, to;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min(max(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
    }
    newLen = doesNotExceedSafeInteger(len - actualDeleteCount + insertCount);
    A = arraySpeciesCreate(O, actualDeleteCount);
    for (k = 0; k < actualDeleteCount; k++) {
      from = actualStart + k;
      if (hasIndex(O, from)) createProperty(A, k, O[from]);
    }
    setArrayLength(A, actualDeleteCount);
    if (insertCount < actualDeleteCount) {
      for (k = actualStart; k < len - actualDeleteCount; k++) {
        from = k + actualDeleteCount;
        to = k + insertCount;
        if (hasIndex(O, from)) O[to] = O[from];
        else deletePropertyOrThrow(O, to);
      }
      for (k = len; k > newLen; k--) deletePropertyOrThrow(O, k - 1);
    } else if (insertCount > actualDeleteCount) {
      for (k = len - actualDeleteCount; k > actualStart; k--) {
        from = k + actualDeleteCount - 1;
        to = k + insertCount - 1;
        if (hasIndex(O, from)) O[to] = O[from];
        else deletePropertyOrThrow(O, to);
      }
    }
    for (k = 0; k < insertCount; k++) {
      O[k + actualStart] = arguments[k + 2];
    }
    setArrayLength(O, newLen);
    return A;
  }
});
