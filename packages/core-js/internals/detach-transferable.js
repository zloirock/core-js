'use strict';
var globalThis = require('../internals/global-this');
var arrayBufferByteLength = require('../internals/array-buffer-byte-length');
var isDetached = require('../internals/array-buffer-is-detached');
var enforceInternalState = require('../internals/internal-state').enforce;
var postMessage = require('../internals/message-channel-post');
var PROPER_STRUCTURED_CLONE_TRANSFER = require('../internals/structured-clone-proper-transfer');

var structuredClone = globalThis.structuredClone;
var $ArrayBuffer = globalThis.ArrayBuffer;
var detach = false;
var buffer, $detach;

if (PROPER_STRUCTURED_CLONE_TRANSFER) {
  detach = function (transferable) {
    structuredClone(transferable, { transfer: [transferable] });
  };
} else if ($ArrayBuffer) try {
  if (postMessage) {
    buffer = new $ArrayBuffer(2);

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
