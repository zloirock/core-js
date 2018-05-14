'use strict';
var arrayFindIndex = require('../internals/array-methods')(6);
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;

// `%TypedArray%.prototype.findIndex` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.findindex
ArrayBufferViewCore.exportProto('findIndex', function findIndex(predicate /* , thisArg */) {
  return arrayFindIndex(aTypedArray(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});
