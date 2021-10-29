var NATIVE_ARRAY_BUFFER = require('../internals/array-buffer-native');

module.exports = function (arrayBuffer) {
  // core-js implementation doesn't have deatched state
  if (!NATIVE_ARRAY_BUFFER) return false;
  if (arrayBuffer.byteLength !== 0) return false;
  try {
    // https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
    arrayBuffer.slice(0, 0);
    return false;
  } catch (error) {
    return true;
  }
};
