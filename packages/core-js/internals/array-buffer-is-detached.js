'use strict';
var globalThis = require('../internals/global-this');
var NATIVE_ARRAY_BUFFER = require('../internals/array-buffer-basic-detection');
var arrayBufferByteLength = require('../internals/array-buffer-byte-length');
var detach = require('../internals/detach-transferable');
var postMessage = require('../internals/message-channel-post');
var PROPER_STRUCTURED_CLONE_TRANSFER = require('../internals/structured-clone-proper-transfer');

var $ArrayBuffer = globalThis.ArrayBuffer;
var DataView = globalThis.DataView;
var CHECK_BY_CLONING = false;
var buffer;

var throwsInDataView = function (O) {
  try {
    // eslint-disable-next-line no-new -- thrower
    new DataView(O);
    return false;
  } catch (error) {
    return true;
  }
};

// some engines (like Chrome < 96 or Safari < 14.1) don't throw on a detached buffer in `DataView`, but do
// on cloning it; a proper `structuredClone` transfer implies a throwing `DataView`, and probing there
// would invalidate the V8 ArrayBufferDetaching protector
if (NATIVE_ARRAY_BUFFER && !PROPER_STRUCTURED_CLONE_TRANSFER && detach && postMessage) try {
  buffer = new $ArrayBuffer(1);
  detach(buffer);
  CHECK_BY_CLONING = !throwsInDataView(buffer);
} catch (error) { /* empty */ }

module.exports = function (O) {
  if (!NATIVE_ARRAY_BUFFER || arrayBufferByteLength(O) !== 0) return false;
  if (throwsInDataView(O)) return true;
  if (!CHECK_BY_CLONING) return false;
  try {
    postMessage(O);
    return false;
  } catch (error) {
    return true;
  }
};
