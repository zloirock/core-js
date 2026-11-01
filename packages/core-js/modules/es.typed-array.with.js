'use strict';
var globalThis = require('../internals/global-this');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var isBigIntArray = require('../internals/is-big-int-array');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');
var toBigInt = require('../internals/to-big-int');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var getTypedArrayConstructor = ArrayBufferViewCore.getTypedArrayConstructor;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

var $RangeError = RangeError;
var BigInt64Array = globalThis.BigInt64Array;

var PROPER_ORDER = function () {
  try {
    // eslint-disable-next-line no-throw-literal, es/no-typed-arrays, es/no-array-prototype-with -- required for testing
    new Int8Array(1)['with'](2, { valueOf: function () { throw 8; } });
  } catch (error) {
    // some early implementations, like WebKit, does not follow the final semantic
    // https://github.com/tc39/proposal-change-array-by-copy/pull/86
    return error === 8;
  }
}();

var THROW_ON_VALID_ARGUMENTS = PROPER_ORDER && function () {
  try {
    // Bug in WebKit. It should truncate a negative fractional index to zero, but instead throws an error
    // eslint-disable-next-line es/no-typed-arrays, es/no-array-prototype-with -- required for testing
    new Int8Array(1)['with'](-0.5, 1);
    // Bug in Rhino 1.9. It converts the value with ToNumber instead of ToBigInt on BigInt arrays
    // https://github.com/mozilla/rhino/pull/2467
    // eslint-disable-next-line es/no-bigint -- required for testing
    if (BigInt64Array) new BigInt64Array(1)['with'](0, BigInt(1));
  } catch (error) {
    return true;
  }
}();

// `%TypedArray%.prototype.with` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.with
exportTypedArrayMethod('with', { 'with': function (index, value) {
  var O = aTypedArray(this);
  var len = lengthOfArrayLike(O);
  var relativeIndex = toIntegerOrInfinity(index);
  var actualIndex = relativeIndex < 0 ? len + relativeIndex : relativeIndex;
  var numericValue = isBigIntArray(O) ? toBigInt(value) : +value;
  if (actualIndex >= len || actualIndex < 0) throw new $RangeError('Incorrect index');
  var A = new (getTypedArrayConstructor(O))(len);
  var k = 0;
  for (; k < len; k++) A[k] = k === actualIndex ? numericValue : O[k];
  return A;
} }['with'], !PROPER_ORDER || THROW_ON_VALID_ARGUMENTS);
