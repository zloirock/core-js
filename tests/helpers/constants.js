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

export const FREEZING = !function () {
  try {
    return Object.isExtensible(Object.preventExtensions({}));
  } catch (e) {
    return true;
  }
}();

export const CORRECT_PROTOTYPE_GETTER = !function () {
  try {
    function F() { /* empty */ }
    F.prototype.constructor = null;
    return Object.getPrototypeOf(new F()) !== F.prototype;
  } catch (e) {
    return true;
  }
}();

// eslint-disable-next-line max-len
export const WHITESPACES = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';
