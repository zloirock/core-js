global.LITTLE_ENDIAN = function () {
  try {
    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
  } catch (e) {
    return true;
  }
}();
