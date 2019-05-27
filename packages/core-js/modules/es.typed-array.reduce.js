'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var internalReduce = require('../internals/array-reduce');

var aTypedArray = ArrayBufferViewCore.aTypedArray;

// `%TypedArray%.prototype.reduce` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reduce
ArrayBufferViewCore.exportProto('reduce', function reduce(callbackfn /* , initialValue */) {
  return internalReduce(aTypedArray(this), callbackfn, arguments.length, arguments[1], false);
});
