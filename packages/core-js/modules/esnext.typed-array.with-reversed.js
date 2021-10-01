'use strict';
var lengthOfArrayLike = require('../internals/length-of-array-like');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
var TYPED_ARRAY_CONSTRUCTOR = ArrayBufferViewCore.TYPED_ARRAY_CONSTRUCTOR;

// `%TypedArray%.prototype.withReversed` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.withReversed
exportTypedArrayMethod('withReversed', function withReversed() {
  var O = aTypedArray(this);
  var len = lengthOfArrayLike(O);
  var A = new O[TYPED_ARRAY_CONSTRUCTOR](len);
  var k = 0;
  for (; k < len; k++) A[k] = O[len - k - 1];
  return A;
});
