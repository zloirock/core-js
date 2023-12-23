'use strict';
var arrayToReversed = require('../internals/array-to-reversed');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var getTypedArrayConstructor = require('../internals/get-typed-array-constructor');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.toReversed` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.toreversed
exportTypedArrayMethod('toReversed', function toReversed() {
  return arrayToReversed(aTypedArray(this), getTypedArrayConstructor(this));
});
