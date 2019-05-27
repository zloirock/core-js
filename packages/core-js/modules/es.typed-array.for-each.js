'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var arrayMethods = require('../internals/array-methods');

var arrayForEach = arrayMethods(0);
var aTypedArray = ArrayBufferViewCore.aTypedArray;

// `%TypedArray%.prototype.forEach` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.foreach
ArrayBufferViewCore.exportProto('forEach', function forEach(callbackfn /* , thisArg */) {
  arrayForEach(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});
