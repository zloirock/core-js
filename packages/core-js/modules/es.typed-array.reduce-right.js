'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var internalReduce = require('../internals/array-reduce');

var aTypedArray = ArrayBufferViewCore.aTypedArray;

// `%TypedArray%.prototype.reduceRicht` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reduceright
ArrayBufferViewCore.exportProto('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
  return internalReduce(aTypedArray(this), callbackfn, arguments.length, arguments[1], true);
});
