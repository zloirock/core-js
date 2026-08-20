'use strict';
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var fails = require('../internals/fails');
var aTypedArray = require('../internals/a-typed-array');
var toLength = require('../internals/to-length');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var getTypedArrayConstructor = require('../internals/get-typed-array-constructor');

var DOES_NOT_WORK_WITH_DIFFERENT_TYPED_ARRAYS = fails(function () {
  return !(Int8Array.prototype.subarray.call(new Float32Array([1, 2, 3]), 0, 1) instanceof Float32Array);
});

// `%TypedArray%.prototype.subarray` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.subarray
exportTypedArrayMethod('subarray', function subarray(begin, end) {
  var O = aTypedArray(this);
  var length = O.length;
  var beginIndex = toAbsoluteIndex(begin, length);
  var C = getTypedArrayConstructor(O);
  return new C(
    O.buffer,
    O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
    toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - beginIndex)
  );
}, DOES_NOT_WORK_WITH_DIFFERENT_TYPED_ARRAYS);
