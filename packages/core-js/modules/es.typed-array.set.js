'use strict';
var toLength = require('../internals/to-length');
var toOffset = require('../internals/to-offset');
var toObject = require('../internals/to-object');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;

var FORCED = require('../internals/fails')(function () {
  // eslint-disable-next-line no-undef
  new Int8Array(1).set({});
});

// `%TypedArray%.prototype.set` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.set
ArrayBufferViewCore.exportProto('set', function set(arrayLike /* , offset */) {
  aTypedArray(this);
  var offset = toOffset(arguments[1], 1);
  var length = this.length;
  var src = toObject(arrayLike);
  var len = toLength(src.length);
  var index = 0;
  if (len + offset > length) throw RangeError('Wrong length!');
  while (index < len) this[offset + index] = src[index++];
}, FORCED);
