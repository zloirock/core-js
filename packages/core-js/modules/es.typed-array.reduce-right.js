'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var right = require('../internals/array-reduce').right;

var aTypedArray = ArrayBufferViewCore.aTypedArray;

// `%TypedArray%.prototype.reduceRicht` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reduceright
ArrayBufferViewCore.exportProto('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
  return right(aTypedArray(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
});
