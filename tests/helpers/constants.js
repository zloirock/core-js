'use strict';

export var DESCRIPTORS = !!function () {
  try {
    return Object.defineProperty({}, 'a', {
      get: function () {
        return 7;
      }
    }).a === 7;
  } catch (e) { /* empty */ }
}();

export var GLOBAL = Function('return this')();

export var NATIVE = GLOBAL.NATIVE || false;

export var TYPED_ARRAYS = {
  Float32Array: 4,
  Float64Array: 8,
  Int8Array: 1,
  Int16Array: 2,
  Int32Array: 4,
  Uint8Array: 1,
  Uint16Array: 2,
  Uint32Array: 4,
  Uint8ClampedArray: 1
};

export var LITTLE_ENDIAN = function () {
  try {
    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
  } catch (e) {
    return true;
  }
}();

export var PROTO = !!Object.setPrototypeOf || '__proto__' in Object.prototype;

export var STRICT = !function () {
  return this;
}();
