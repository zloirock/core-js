'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var uncurryThis = require('../internals/function-uncurry-this');
var aCallable = require('../internals/a-callable');
var arrayFromConstructorAndList = require('../internals/array-from-constructor-and-list');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
var TYPED_ARRAY_CONSTRUCTOR = ArrayBufferViewCore.TYPED_ARRAY_CONSTRUCTOR;
var sort = uncurryThis(ArrayBufferViewCore.TypedArrayPrototype.sort);

// `%TypedArray%.prototype.toSorted` method
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.toSorted
exportTypedArrayMethod('toSorted', function toSorted(compareFn) {
  if (compareFn !== undefined) aCallable(compareFn);
  var O = aTypedArray(this);
  var A = arrayFromConstructorAndList(O[TYPED_ARRAY_CONSTRUCTOR], O);
  return sort(A, compareFn);
}, true);
