'use strict';
var arrayWithAt = require('../internals/array-with-at');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
var TYPED_ARRAY_CONSTRUCTOR = ArrayBufferViewCore.TYPED_ARRAY_CONSTRUCTOR;

// `%TypedArray%.prototype.withAt` method
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.withAt
exportTypedArrayMethod('withAt', function withAt(index, value) {
  return arrayWithAt(aTypedArray(this), this[TYPED_ARRAY_CONSTRUCTOR], index, value);
});
