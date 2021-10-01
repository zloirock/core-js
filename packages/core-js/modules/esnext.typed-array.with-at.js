'use strict';
var lengthOfArrayLike = require('../internals/length-of-array-like');
var isIntegralNumber = require('../internals/is-integral-number');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
var TYPED_ARRAY_CONSTRUCTOR = ArrayBufferViewCore.TYPED_ARRAY_CONSTRUCTOR;

var ERROR_MESSAGE = 'Incorrect index';

// `%TypedArray%.prototype.withAt` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.withAt
exportTypedArrayMethod('withAt', function withAt(index, value) {
  var O = aTypedArray(this);
  var len = lengthOfArrayLike(O);
  if (!isIntegralNumber(index) || index >= len) throw RangeError(ERROR_MESSAGE);
  var actualIndex = index < 0 ? len + index : index;
  if (actualIndex < 0) throw RangeError(ERROR_MESSAGE);
  var A = new O[TYPED_ARRAY_CONSTRUCTOR](len);
  var k = 0;
  for (; k < len; k++) A[k] = k === actualIndex ? value : O[k];
  return A;
});
