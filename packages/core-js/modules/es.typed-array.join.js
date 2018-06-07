'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;
var arrayJoin = [].join;

// `%TypedArray%.prototype.join` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.join
ArrayBufferViewCore.exportProto('join', function join(separator) { // eslint-disable-line no-unused-vars
  return arrayJoin.apply(aTypedArray(this), arguments);
});
