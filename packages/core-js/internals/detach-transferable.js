'use strict';
var globalThis = require('../internals/global-this');
var uncurryThis = require('../internals/function-uncurry-this-clause');
var arrayBufferByteLength = require('../internals/array-buffer-byte-length');
var isDetached = require('../internals/array-buffer-is-detached');
var enforceInternalState = require('../internals/internal-state').enforce;
var postMessage = require('../internals/message-channel-post');
var PROPER_STRUCTURED_CLONE_TRANSFER = require('../internals/structured-clone-proper-transfer');

var structuredClone = globalThis.structuredClone;
// captured before the transfer polyfill of this copy can replace it
// eslint-disable-next-line es/no-arraybuffer-prototype-transfer -- safe
var arrayBufferTransfer = uncurryThis(ArrayBuffer.prototype.transfer);
var detach = false;
var buffer, $detach;

if (PROPER_STRUCTURED_CLONE_TRANSFER) {
  detach = function (transferable) {
    structuredClone(transferable, { transfer: [transferable] });
    // modern engines trust any `structuredClone` to detach, but a non-native one leaves the buffer attached
    if (isDetached(transferable)) return;
    if (postMessage) postMessage(null, [transferable]);
    // the callers report buffers that stay attached
    else if (arrayBufferTransfer) try {
      arrayBufferTransfer(transferable);
    } catch (error) { /* empty */ }
  };
} else try {
  if (postMessage) {
    buffer = new ArrayBuffer(2);

    $detach = function (transferable) {
      postMessage(null, [transferable]);
    };

    if (buffer.byteLength === 2) {
      $detach(buffer);
      if (buffer.byteLength === 0) {
        // Firefox 41-44 accepts detached buffers in view constructors and structured cloning
        detach = isDetached(buffer) ? $detach : function (transferable) {
          $detach(transferable);
          if (arrayBufferByteLength(transferable) === 0) enforceInternalState(transferable).detached = true;
        };
      }
    }
  }
} catch (error) { /* empty */ }

module.exports = detach;
