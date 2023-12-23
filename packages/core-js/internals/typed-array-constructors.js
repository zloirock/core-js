'use strict';
var TypedArrayConstructors = {
  Int8Array: 1,
  Uint8Array: 1,
  Uint8ClampedArray: 1,
  Int16Array: 2,
  Uint16Array: 2,
  Int32Array: 4,
  Uint32Array: 4,
  Float32Array: 4,
  Float64Array: 8,
};

var BigIntArrayConstructors = {
  BigInt64Array: 8,
  BigUint64Array: 8,
};

module.exports = {
  base: TypedArrayConstructors,
  binint: BigIntArrayConstructors,
};
