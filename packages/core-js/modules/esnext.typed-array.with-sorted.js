'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aCallable = require('../internals/a-callable');
var arrayFromConstructorAndList = require('../internals/array-from-constructor-and-list');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
var TYPED_ARRAY_CONSTRUCTOR = ArrayBufferViewCore.TYPED_ARRAY_CONSTRUCTOR;
var sort = ArrayBufferViewCore.TypedArrayPrototype.sort;

// `%TypedArray%.prototype.withSorted` method
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.withSorted
exportTypedArrayMethod('withSorted', function withSorted(compareFn) {
  if (compareFn !== undefined) aCallable(compareFn);
  var O = aTypedArray(this);
  var A = arrayFromConstructorAndList(O[TYPED_ARRAY_CONSTRUCTOR], O);
  return sort.call(A, compareFn);
});
