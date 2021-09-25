'use strict';
var NATIVE_ARRAY_BUFFER = require('../internals/array-buffer-native');

module.exports = function (arrayBuffer) {
  if (!NATIVE_ARRAY_BUFFER) return false; // core-js implementation doesn't seem to have deatched state
  if (arrayBuffer.byteLength !== 0) return false;
  try {
    arrayBuffer.slice(0, 0); // https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
    return false;
  } catch (error) {
    return true;
  }
};
