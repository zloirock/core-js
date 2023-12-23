'use strict';
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/array-buffer-view-core').aTypedArray;
var lengthOfArrayLike = require('../internals/length-of-array-like');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');

// `%TypedArray%.prototype.at` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.at
exportTypedArrayMethod('at', function at(index) {
  var O = aTypedArray(this);
  var len = lengthOfArrayLike(O);
  var relativeIndex = toIntegerOrInfinity(index);
  var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
  return (k < 0 || k >= len) ? undefined : O[k];
});
