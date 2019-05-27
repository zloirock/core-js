'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var arrayMethods = require('../internals/array-methods');

var arrayFind = arrayMethods(5);
var aTypedArray = ArrayBufferViewCore.aTypedArray;

// `%TypedArray%.prototype.find` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.find
ArrayBufferViewCore.exportProto('find', function find(predicate /* , thisArg */) {
  return arrayFind(aTypedArray(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});
