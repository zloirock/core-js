'use strict';
var arrayFill = require('../internals/array-fill');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;

// `%TypedArray%.prototype.fill` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.fill
ArrayBufferViewCore.exportProto('fill', function fill(value /* , start, end */) { // eslint-disable-line no-unused-vars
  return arrayFill.apply(aTypedArray(this), arguments);
});
