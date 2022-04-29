'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var arraySlice = require('../internals/array-slice');
var arrayToSpliced = require('../internals/array-to-spliced');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
var TYPED_ARRAY_CONSTRUCTOR = ArrayBufferViewCore.TYPED_ARRAY_CONSTRUCTOR;

// `%TypedArray%.prototype.toSpliced` method
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.toSpliced
// eslint-disable-next-line no-unused-vars -- required for .length
exportTypedArrayMethod('toSpliced', function toSpliced(start, deleteCount /* , ...items */) {
  return arrayToSpliced(aTypedArray(this), this[TYPED_ARRAY_CONSTRUCTOR], arraySlice(arguments));
}, { arity: 2 });
