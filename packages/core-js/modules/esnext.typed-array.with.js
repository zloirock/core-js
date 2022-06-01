'use strict';
var arrayWith = require('../internals/array-with');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
// var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');
// var toBigInt = require('../internals/to-big-int');
// var classof = require('../internals/classof');
// var uncurryThis = require('../internals/function-uncurry-this');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
var TYPED_ARRAY_CONSTRUCTOR = ArrayBufferViewCore.TYPED_ARRAY_CONSTRUCTOR;
// var slice = uncurryThis(''.slice);

// `%TypedArray%.prototype.with` method
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.with
exportTypedArrayMethod('with', { 'with': function (index, value) {
  // aTypedArray(this);
  // var relativeIndex = toIntegerOrInfinity(index);
  // var actualValue = slice(classof(this), 0, 3) === 'Big' ? toBigInt(value) : +value;
  // return arrayWith(this, this[TYPED_ARRAY_CONSTRUCTOR], relativeIndex, actualValue);
  return arrayWith(aTypedArray(this), this[TYPED_ARRAY_CONSTRUCTOR], index, value);
} }['with']);
