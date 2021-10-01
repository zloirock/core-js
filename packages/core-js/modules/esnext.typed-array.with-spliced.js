'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var arrayWithSpliced = require('../internals/array-with-spliced');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
var TYPED_ARRAY_CONSTRUCTOR = ArrayBufferViewCore.TYPED_ARRAY_CONSTRUCTOR;

// `%TypedArray%.prototype.withSpliced` method
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.withSpliced
// eslint-disable-next-line no-unused-vars -- required for .length
exportTypedArrayMethod('withSpliced', function withSpliced(start, deleteCount /* , ...items */) {
  return arrayWithSpliced.apply({ O: aTypedArray(this), C: this[TYPED_ARRAY_CONSTRUCTOR] }, arguments);
});
