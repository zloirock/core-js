'use strict';
var globalThis = require('../internals/global-this');
var call = require('../internals/function-call');
var arrayBufferByteLength = require('../internals/array-buffer-byte-length');
var getNativePrototype = require('../internals/array-buffer-native-prototype');
var getInternalState = require('../internals/internal-state').get;
var classof = require('../internals/classof-raw');
var fails = require('../internals/fails');
var postMessage = require('../internals/message-channel-post');
var PROPER_STRUCTURED_CLONE_TRANSFER = require('../internals/structured-clone-proper-transfer');

var Uint8Array = globalThis.Uint8Array;
var nativeSlice = ArrayBuffer.prototype.slice;
var CHECK_BY_CLONING = PROPER_STRUCTURED_CLONE_TRANSFER ? false : undefined;
var STOP = { valueOf: function () { throw STOP; } };

var throwsOnDetached = function (O, slice) {
  try {
    // a buffer can be larger than the maximum typed array length
    // eslint-disable-next-line no-new -- thrower
    new Uint8Array(O, 0, 0);
    // Without MessageChannel, old V8 needs slice to recognize detached WebAssembly buffers.
    if (slice && !postMessage) {
      // Stop slice before species lookup and allocation.
      call(slice, O, STOP);
    }
    return false;
  } catch (error) {
    return error !== STOP;
  }
};

module.exports = function (O) {
  if (getInternalState(O).detached) return true;
  if (CHECK_BY_CLONING === false) return throwsOnDetached(O);
  if (classof(getNativePrototype(O, true)) === 'SharedArrayBuffer') return false;
  if (CHECK_BY_CLONING === undefined && postMessage) {
    // old WebKit accepts detached buffers in both view constructors and slice
    // The probe must actually detach: Deno 1.13 rejects ArrayBuffer transfer.
    CHECK_BY_CLONING = !fails(function () {
      var buffer = new Uint8Array(1).buffer;
      postMessage(null, [buffer]);
      return arrayBufferByteLength(buffer) !== 0 || throwsOnDetached(buffer, nativeSlice);
    });
  }
  return throwsOnDetached(O, nativeSlice) || !!CHECK_BY_CLONING && arrayBufferByteLength(O) === 0 && fails(function () {
    postMessage(O);
  });
};
