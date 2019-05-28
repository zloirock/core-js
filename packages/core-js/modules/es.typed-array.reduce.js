'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var left = require('../internals/array-reduce').left;

var aTypedArray = ArrayBufferViewCore.aTypedArray;

// `%TypedArray%.prototype.reduce` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reduce
ArrayBufferViewCore.exportProto('reduce', function reduce(callbackfn /* , initialValue */) {
  return left(aTypedArray(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
});
