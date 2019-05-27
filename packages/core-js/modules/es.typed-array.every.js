'use strict';
var arrayMethods = require('../internals/array-methods');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');

var arrayEvery = arrayMethods(4);
var aTypedArray = ArrayBufferViewCore.aTypedArray;

// `%TypedArray%.prototype.every` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.every
ArrayBufferViewCore.exportProto('every', function every(callbackfn /* , thisArg */) {
  return arrayEvery(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});
