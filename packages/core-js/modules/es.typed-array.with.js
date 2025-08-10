'use strict';
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/array-buffer-view-core').aTypedArray;
var arrayWith = require('../internals/array-with');
var getTypedArrayConstructor = require('../internals/get-typed-array-constructor');
var isBigIntArray = require('../internals/is-big-int-array');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');
var toBigInt = require('../internals/to-big-int');

var PROPER_ORDER = function () {
  try {
    // eslint-disable-next-line no-throw-literal, es/no-array-prototype-with -- required for testing
    new Int8Array(1).with(2, { valueOf: function () { throw 8; } });
  } catch (error) {
    // some early implementations, like WebKit, does not follow the final semantic
    // https://github.com/tc39/proposal-change-array-by-copy/pull/86
    return error === 8;
  }
}();

// Bug in WebKit. It should truncate a negative fractional index to zero, but instead throws an error
var THROW_ON_NEGATIVE_FRACTIONAL_INDEX = PROPER_ORDER && function () {
  try {
    // eslint-disable-next-line es/no-array-prototype-with -- required for testing
    new Int8Array(1).with(-0.5, 1);
  } catch (error) {
    return true;
  }
}();

// `%TypedArray%.prototype.with` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.with
exportTypedArrayMethod('with', { with: function (index, value) {
  var O = aTypedArray(this);
  var relativeIndex = toIntegerOrInfinity(index);
  var actualValue = isBigIntArray(O) ? toBigInt(value) : +value;
  return arrayWith(O, getTypedArrayConstructor(O), relativeIndex, actualValue);
} }.with, !PROPER_ORDER || THROW_ON_NEGATIVE_FRACTIONAL_INDEX);
