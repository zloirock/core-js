'use strict';
var arrayCopyWithin = require('../internals/array-copy-within');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;

// `%TypedArray%.prototype.copyWithin` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.copywithin
ArrayBufferViewCore.exportProto('copyWithin', function copyWithin(target, start /* , end */) {
  return arrayCopyWithin.call(aTypedArray(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
});
