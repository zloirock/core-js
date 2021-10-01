'use strict';
var arrayWithReversed = require('../internals/array-with-reversed');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
var TYPED_ARRAY_CONSTRUCTOR = ArrayBufferViewCore.TYPED_ARRAY_CONSTRUCTOR;

// `%TypedArray%.prototype.withReversed` method
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.withReversed
exportTypedArrayMethod('withReversed', function withReversed() {
  return arrayWithReversed(aTypedArray(this), this[TYPED_ARRAY_CONSTRUCTOR]);
});
