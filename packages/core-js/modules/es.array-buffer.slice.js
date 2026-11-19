'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var arrayBufferByteLength = require('../internals/array-buffer-byte-length');
var notDetached = require('../internals/array-buffer-not-detached');
var detach = require('../internals/detach-transferable');
var PROPER_STRUCTURED_CLONE_TRANSFER = require('../internals/structured-clone-proper-transfer');
var toAbsoluteIndex = require('../internals/to-absolute-index');

var $ArrayBuffer = ArrayBuffer;
var nativeArrayBufferSlice = uncurryThis($ArrayBuffer.prototype.slice);

var INCORRECT_SLICE = fails(function () {
  return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
}) || !PROPER_STRUCTURED_CLONE_TRANSFER && !fails(function () {
  // V8 ~ Chrome < 52 and Safari < 14.1 return an empty buffer for a detached one
  // modern engines are not checked: a buffer detached on loading would invalidate the V8 protector
  var buffer = new $ArrayBuffer(1);
  detach(buffer);
  buffer.slice();
});

// `ArrayBuffer.prototype.slice` method
// https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
$({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
  slice: function slice(start, end) {
    var length = arrayBufferByteLength(this);
    // FF < 46, V8 ~ Chrome < 52 and Safari < 14.1 return an empty buffer for a detached one
    notDetached(this);
    var first = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    // the native method gets normalized indices: FF < 46 and other old engines take `undefined` as the end for 0
    return nativeArrayBufferSlice(this, first, fin);
  },
});
