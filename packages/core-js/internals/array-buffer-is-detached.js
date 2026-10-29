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
var NATIVE_UINT8_ARRAY = Uint8Array && !Uint8Array.sham;
var CHECK_BY_CLONING = PROPER_STRUCTURED_CLONE_TRANSFER ? false : undefined;
var STOP = { valueOf: function () { throw STOP; } };

var throwsOnDetached = function (O, slice) {
  try {
    if (NATIVE_UINT8_ARRAY) {
      // A buffer can be larger than the maximum typed array length.
      // eslint-disable-next-line no-new -- thrower
      new Uint8Array(O, 0, 0);
    } else if (slice) {
      // Stop slice before species lookup and allocation.
      call(slice, O, STOP);
    }
    return false;
  } catch (error) {
    return error !== STOP;
  }
};

module.exports = function (O) {
  // A full polyfill never has a detachable backing store.
  if (getInternalState(O).type === 'ArrayBuffer') return false;
  if (NATIVE_UINT8_ARRAY && CHECK_BY_CLONING === false) return throwsOnDetached(O);
  var prototype = getNativePrototype(O, true);
  if (prototype && classof(prototype) === 'SharedArrayBuffer') return false;
  var slice = prototype && prototype.slice;
  if (CHECK_BY_CLONING === undefined && postMessage) {
    // Old WebKit accepts detached buffers in both view constructors and slice.
    CHECK_BY_CLONING = fails(function () {
      var Constructor = prototype && prototype.constructor;
      var buffer = NATIVE_UINT8_ARRAY ? new Uint8Array(1).buffer : new Constructor(1);
      postMessage(null, [buffer]);
      return !throwsOnDetached(buffer, slice);
    });
  }
  return throwsOnDetached(O, slice) || !!CHECK_BY_CLONING && arrayBufferByteLength(O) === 0 && fails(function () {
    postMessage(O);
  });
};
