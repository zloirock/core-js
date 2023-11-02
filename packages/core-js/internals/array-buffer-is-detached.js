'use strict';
var globalThis = require('../internals/global-this');
var arrayBufferByteLength = require('../internals/array-buffer-byte-length');

var DataView = globalThis.DataView;

module.exports = function (O) {
  if (arrayBufferByteLength(O) !== 0) return false;
  try {
    // eslint-disable-next-line no-new -- thrower
    new DataView(O);
    return false;
  } catch (error) {
    return true;
  }
};
