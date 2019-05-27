'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var arrayMethods = require('../internals/array-methods');

var arraySome = arrayMethods(3);
var aTypedArray = ArrayBufferViewCore.aTypedArray;

// `%TypedArray%.prototype.some` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.some
ArrayBufferViewCore.exportProto('some', function some(callbackfn /* , thisArg */) {
  return arraySome(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});
