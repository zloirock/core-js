'use strict';
var $ = require('../internals/export');
var apply = require('../internals/function-apply');
var addToUnscopables = require('../internals/add-to-unscopables');
var doesNotExceedSafeInteger = require('../internals/does-not-exceed-safe-integer');
var hasOwn = require('../internals/has-own-property');
var isArray = require('../internals/is-array');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var toIndexedObject = require('../internals/to-indexed-object');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');
var createProperty = require('../internals/create-property');
var createSpliceTestObject = require('../internals/array-splice-test-object');

var $Array = Array;
var max = Math.max;
var min = Math.min;
var nativeToSpliced;
var NATIVE_WITH_FEW_ITEMS;

var throwsOn = function (O, args, ErrorConstructor) {
  try {
    apply(nativeToSpliced, O, args);
  } catch (error) { return error instanceof ErrorConstructor; }
};

// V8 since Chrome 110 and Hermes < 260318099.0.0 round the new length.
// Safari 16 - 18.6 and Bun < 1.2.12 also round source indices.
// https://issues.chromium.org/issues/587994321
// https://github.com/meta/hermes/commit/b915c736ce7b873c8312f5eb2679e5cf6acf19c1
// https://github.com/WebKit/WebKit/commit/c52c8eeff4dce2712b1420f2b1f6d83a7183aa69
var FORCED = function () {
  // eslint-disable-next-line es/no-array-prototype-tospliced -- feature detection
  var method = [].toSpliced;
  if (typeof method != 'function') return true;
  var O = createSpliceTestObject(method, 0);
  // eslint-disable-next-line no-sparse-arrays -- Hermes 0.13 repeats the preceding element for a hole
  var sparse = [1, , 2];
  // eslint-disable-next-line es/no-object-setprototypeof -- keep an inherited index from masking the hole
  if (1 in sparse) Object.setPrototypeOf(sparse, null);
  var copy = method.call(sparse);
  if (!hasOwn(copy, 1) || copy[1] !== undefined) return true;
  nativeToSpliced = method;
  var from = O.length - 2;
  O[from] = 1;
  O[from + 1] = 2;
  var result = method.call(O, 0, from, 0, 0, 0, 0);
  // At exactly the limit ArrayCreate throws RangeError. Safari < 27.3 and Bun < 1.4.3 throw TypeError.
  // https://bugs.webkit.org/show_bug.cgi?id=320830
  NATIVE_WITH_FEW_ITEMS = result[4] === 1 && result[5] === 2 && throwsOn(O, [], RangeError) && throwsOn(O, [-1, 0, 0], TypeError);
  return !NATIVE_WITH_FEW_ITEMS || result.length !== 6 || !throwsOn(O, [-1, 1, 0, 0], TypeError);
};

// `Array.prototype.toSpliced` method
// https://tc39.es/ecma262/#sec-array.prototype.tospliced
$({ target: 'Array', proto: true, forced: FORCED }, {
  toSpliced: function toSpliced(start, deleteCount /* , ...items */) {
    // An array proxy can still report a length above 2^32 - 1.
    if (NATIVE_WITH_FEW_ITEMS && (arguments.length < 4 || deleteCount === 0) || nativeToSpliced && isArray(this)) {
      return apply(nativeToSpliced, this, arguments);
    }
    var O = toIndexedObject(this);
    var len = lengthOfArrayLike(O);
    var actualStart = toAbsoluteIndex(start, len);
    var argumentsLength = arguments.length;
    var k = 0;
    var insertCount, actualDeleteCount, newLen, A;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min(max(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
    }
    // Subtract first to keep the length and the source indices exact.
    newLen = doesNotExceedSafeInteger(len - actualDeleteCount + insertCount);
    A = $Array(newLen);

    for (; k < actualStart; k++) createProperty(A, k, O[k]);
    for (; k < actualStart + insertCount; k++) createProperty(A, k, arguments[k - actualStart + 2]);
    for (; k < newLen; k++) createProperty(A, k, O[k - insertCount + actualDeleteCount]);

    return A;
  }
});

addToUnscopables('toSpliced');
