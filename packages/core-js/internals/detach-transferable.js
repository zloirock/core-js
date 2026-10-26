'use strict';
var globalThis = require('../internals/global-this');
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
      if (buffer.byteLength === 0) detach = $detach;
    }
  }
} catch (error) { /* empty */ }

module.exports = detach;
