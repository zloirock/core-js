'use strict';
var globalThis = require('../internals/global-this');
var fails = require('../internals/fails');
var uncurryThis = require('../internals/function-uncurry-this');
var uncurryThisAccessor = require('../internals/function-uncurry-this-accessor');
var toIndex = require('../internals/to-index');
var notDetached = require('../internals/array-buffer-not-detached');
var isDetached = require('../internals/array-buffer-is-detached');
var arrayBufferByteLength = require('../internals/array-buffer-byte-length');
var detachTransferable = require('../internals/detach-transferable');
var PROPER_STRUCTURED_CLONE_TRANSFER = require('../internals/structured-clone-proper-transfer');

var structuredClone = globalThis.structuredClone;
var $ArrayBuffer = ArrayBuffer;
var $DataView = DataView;
var ArrayBufferPrototype = $ArrayBuffer.prototype;
var DataViewPrototype = $DataView.prototype;
var Uint8Array = globalThis.Uint8Array;
var TypeError = globalThis.TypeError;
var RangeError = globalThis.RangeError;
var min = Math.min;
var isResizable = uncurryThisAccessor(ArrayBufferPrototype, 'resizable', 'get');
var maxByteLength = uncurryThisAccessor(ArrayBufferPrototype, 'maxByteLength', 'get');
var getInt8 = uncurryThis(DataViewPrototype.getInt8);
var setInt8 = uncurryThis(DataViewPrototype.setInt8);
var set = uncurryThis(Uint8Array.prototype.set);

var throwNotDetachable = function (error) {
  if (error.name === 'DataCloneError') throw new TypeError('ArrayBuffer is not detachable');
  throw error;
};

module.exports = (PROPER_STRUCTURED_CLONE_TRANSFER || detachTransferable) && function (arrayBuffer, newLength, preserveResizability) {
  var byteLength = arrayBufferByteLength(arrayBuffer);
  var newByteLength = newLength === undefined ? byteLength : toIndex(newLength);
  var fixedLength = !isResizable || !isResizable(arrayBuffer);
  var newBuffer;
  notDetached(arrayBuffer);
  // coercing `newLength` can resize the source
  byteLength = arrayBufferByteLength(arrayBuffer);
  if (PROPER_STRUCTURED_CLONE_TRANSFER && byteLength === newByteLength && (preserveResizability || fixedLength)) {
    try {
      newBuffer = structuredClone(arrayBuffer, { transfer: [arrayBuffer] });
    } catch (error) {
      throwNotDetachable(error);
    }
    // modern engines trust any `structuredClone` to transfer, but a non-native one keeps the source attached
    if (isDetached(arrayBuffer)) return newBuffer;
  }
  var options = preserveResizability && !fixedLength && maxByteLength
    ? { maxByteLength: maxByteLength(arrayBuffer) }
    : undefined;
  // allocation must succeed before the source is detached; species is not used
  try {
    // eslint-disable-next-line es/no-resizable-and-growable-arraybuffers -- safe
    newBuffer = new $ArrayBuffer(newByteLength, options);
  } catch (error) {
    // IE11 throws a TypeError when the requested allocation is too large.
    if (error instanceof TypeError) throw new RangeError('Wrong length');
    throw error;
  }
  var copyLength = min(newByteLength, byteLength);
  // typed array views have stricter size limits than buffers on some hosts.
  if (copyLength && fails(function () {
    set(new Uint8Array(newBuffer, 0, copyLength), new Uint8Array(arrayBuffer, 0, copyLength));
  })) {
    var a = new $DataView(arrayBuffer);
    var b = new $DataView(newBuffer);
    for (var i = 0; i < copyLength; i++) setInt8(b, i, getInt8(a, i));
  }
  try {
    detachTransferable(arrayBuffer);
  } catch (error) {
    throwNotDetachable(error);
  }
  // some hosts silently copy non-detachable buffers, such as WebAssembly memory
  if (!isDetached(arrayBuffer)) throw new TypeError('ArrayBuffer is not detachable');
  return newBuffer;
};
