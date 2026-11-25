'use strict';
var globalThis = require('../internals/global-this');
var uncurryThis = require('../internals/function-uncurry-this-clause');
var arrayBufferByteLength = require('../internals/array-buffer-byte-length');
var isDetached = require('../internals/array-buffer-is-detached');
var enforceInternalState = require('../internals/internal-state').enforce;
var postMessage = require('../internals/message-channel-post');
var PROPER_STRUCTURED_CLONE_TRANSFER = require('../internals/structured-clone-proper-transfer');

var structuredClone = globalThis.structuredClone;
var TypeError = globalThis.TypeError;
var supported, nativeTransfer, markDetached;

var isSupported = function () {
  if (supported !== undefined) return supported;
  var ArrayBuffer = globalThis.ArrayBuffer;
  if (!ArrayBuffer) return PROPER_STRUCTURED_CLONE_TRANSFER;
  supported = PROPER_STRUCTURED_CLONE_TRANSFER;
  try {
    // Capture the fallback before installing the transfer polyfill.
    if (supported) nativeTransfer = !postMessage && uncurryThis(ArrayBuffer.prototype.transfer);
    else {
      var buffer = new ArrayBuffer(2);
      if (buffer.byteLength !== 2) return false;
      postMessage(null, [buffer]);
      if (buffer.byteLength !== 0) return false;
      // Firefox 41-44 accepts detached buffers in view constructors and structured cloning.
      markDetached = !isDetached(buffer);
      supported = true;
    }
  } catch (error) { /* empty */ }
  return supported;
};

var detach = function (transferable) {
  if (!isSupported()) throw new TypeError('ArrayBuffer is not detachable');
  if (PROPER_STRUCTURED_CLONE_TRANSFER) {
    structuredClone(transferable, { transfer: [transferable] });
    // A non-native structuredClone can leave the buffer attached.
    if (isDetached(transferable)) return;
  }
  if (postMessage) {
    postMessage(null, [transferable]);
    if (markDetached && arrayBufferByteLength(transferable) === 0) enforceInternalState(transferable).detached = true;
  } else if (nativeTransfer) try {
    nativeTransfer(transferable);
  } catch (error) { /* empty */ }
};

detach.isSupported = isSupported;
// Defer the probe if ArrayBuffer is not installed yet.
module.exports = (PROPER_STRUCTURED_CLONE_TRANSFER || !!postMessage) && (!globalThis.ArrayBuffer || isSupported()) && detach;
