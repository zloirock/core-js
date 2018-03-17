'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArrayConstructor = ArrayBufferViewCore.aTypedArrayConstructor;

var FORCED = require('../internals/fails')(function () {
  // eslint-disable-next-line no-undef
  Int8Array.of(1);
});

// `%TypedArray%.of` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.of
ArrayBufferViewCore.exportStatic('of', function of(/* ...items */) {
  var index = 0;
  var length = arguments.length;
  var result = new (aTypedArrayConstructor(this))(length);
  while (length > index) result[index] = arguments[index++];
  return result;
}, FORCED);
