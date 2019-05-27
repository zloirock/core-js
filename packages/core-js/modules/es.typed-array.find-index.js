'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var arrayMethods = require('../internals/array-methods');

var arrayFindIndex = arrayMethods(6);
var aTypedArray = ArrayBufferViewCore.aTypedArray;

// `%TypedArray%.prototype.findIndex` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.findindex
ArrayBufferViewCore.exportProto('findIndex', function findIndex(predicate /* , thisArg */) {
  return arrayFindIndex(aTypedArray(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});
