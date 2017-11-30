export const DESCRIPTORS = !!(() => {
  try {
    return Object.defineProperty({}, 'a', {
      get() {
        return 7;
      },
    }).a === 7;
  } catch (e) { /* empty */ }
})();

export const GLOBAL = Function('return this')();

export const NATIVE = GLOBAL.NATIVE || false;

export const TYPED_ARRAYS = {
  Float32Array: 4,
  Float64Array: 8,
  Int8Array: 1,
  Int16Array: 2,
  Int32Array: 4,
  Uint8Array: 1,
  Uint16Array: 2,
  Uint32Array: 4,
  Uint8ClampedArray: 1,
};

export const LITTLE_ENDIAN = (() => {
  try {
    return new GLOBAL.Uint8Array(new GLOBAL.Uint16Array([1]).buffer)[0] === 1;
  } catch (e) {
    return true;
  }
})();

export const PROTO = !!Object.setPrototypeOf || '__proto__' in Object.prototype;

export const STRICT = !function () {
  return this;
}();
