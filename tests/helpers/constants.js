export const GLOBAL = Function('return this')();

export const NATIVE = GLOBAL.NATIVE || false;

export const NODE = typeof Bun == 'undefined' && Object.prototype.toString.call(GLOBAL.process).slice(8, -1) === 'process';

export const BUN = typeof Bun != 'undefined' && Object.prototype.toString.call(GLOBAL.process).slice(8, -1) === 'process';

const $TYPED_ARRAYS = {
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

export const TYPED_ARRAYS = [];

for (const name in $TYPED_ARRAYS) TYPED_ARRAYS.push({
  name,
  TypedArray: GLOBAL[name],
  bytes: $TYPED_ARRAYS[name],
  $: Number,
});

export const TYPED_ARRAYS_WITH_BIG_INT = [...TYPED_ARRAYS];

for (const name of ['BigInt64Array', 'BigUint64Array']) if (GLOBAL[name]) TYPED_ARRAYS_WITH_BIG_INT.push({
  name,
  TypedArray: GLOBAL[name],
  bytes: 8,
  // eslint-disable-next-line es/no-bigint -- safe
  $: BigInt,
});

export const LITTLE_ENDIAN = (() => {
  try {
    return new GLOBAL.Uint8Array(new GLOBAL.Uint16Array([1]).buffer)[0] === 1;
  } catch {
    return true;
  }
})();

// FF < 23 bug
export const REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR = !function () {
  try {
    Object.defineProperty([], 'length', { writable: false });
  } catch {
    return true;
  }
}();

export const CONFIGURABLE_FUNCTION_NAME = !!function () {
  function f() { /* empty */ }
  try {
    return Object.defineProperty(f, 'name', { value: 'new' }).name === 'new';
  } catch { /* empty */ }
}();

export const WHITESPACES = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';
