'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var $groupBy = require('../internals/array-group-by');
var speciesConstructor = require('../internals/species-constructor');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var aTypedArrayConstructor = ArrayBufferViewCore.aTypedArrayConstructor;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.groupBy` method
// https://github.com/tc39/proposal-array-grouping
exportTypedArrayMethod('groupBy', function groupBy(callbackfn /* , thisArg */) {
  var result = $groupBy(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  var TypedArray = aTypedArrayConstructor(speciesConstructor(this, this.constructor));
  var key, array, typedArray, index, length;
  for (key in result) {
    array = result[key];
    length = array.length;
    result[key] = typedArray = new TypedArray(length);
    for (index = 0; index < length; index++) typedArray[index] = array[index];
  } return result;
});
