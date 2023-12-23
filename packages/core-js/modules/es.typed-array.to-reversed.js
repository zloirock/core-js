'use strict';
var lengthOfArrayLike = require('../internals/length-of-array-like');
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/array-buffer-view-core').aTypedArray;
var getTypedArrayConstructor = require('../internals/get-typed-array-constructor');

// `%TypedArray%.prototype.toReversed` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.toreversed
exportTypedArrayMethod('toReversed', function toReversed() {
  var O = aTypedArray(this);
  var len = lengthOfArrayLike(O);
  var A = new (getTypedArrayConstructor(O))(len);
  var k = 0;
  for (; k < len; k++) A[k] = O[len - k - 1];
  return A;
});
