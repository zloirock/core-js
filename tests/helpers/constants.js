import defineProperty from 'core-js-pure/es/object/define-property';

export const DESCRIPTORS = !!(() => {
  try {
    return defineProperty({}, 'a', {
      get() {
        return 7;
      },
    }).a === 7;
  } catch { /* empty */ }
})();

// Old V8 cannot preserve property order when collecting non-enumerable keys.
export const OBJECT_NAMES_ORDER = (() => {
  try {
    const object = {};
    const alphabet = 'abcdefghijklmnopqrst';
    for (let i = 0; i < alphabet.length; i++) object[alphabet.charAt(i)] = i;
    // eslint-disable-next-line es/no-object-getownpropertynames -- required for testing
    return Object.getOwnPropertyNames(object).join('') === alphabet;
  } catch {
    return false;
  }
})();

export const GLOBAL = Function('return this')();

const FIREFOX_VERSION = +(/Firefox\/(\d+)/.exec(GLOBAL.navigator?.userAgent)?.[1] || 0);
// Firefox 25-32 uses the legacy getOwnPropertyNames proxy trap.
// https://bugzilla.mozilla.org/show_bug.cgi?id=1007334
export const FIREFOX_LEGACY_PROXY = FIREFOX_VERSION >= 25 && FIREFOX_VERSION < 33;
// Firefox 33-41 has no Reflect.ownKeys; names and symbols are collected separately.
// https://bugzilla.mozilla.org/show_bug.cgi?id=987514
export const FIREFOX_SPLIT_OWN_KEYS = FIREFOX_VERSION >= 33 && FIREFOX_VERSION < 42;

// Safari 10-14.0 / iOS 10-14.4 move proxy symbol keys after string keys.
// https://bugs.webkit.org/show_bug.cgi?id=216227
export const SAFARI_PROXY_SYMBOL_ORDER = /Version\/(?:1[0-3]|14\.0)\D.*Safari\/|(?:iPad|iPhone|iPod).*OS (?:1[0-3]|14_[0-4])\D/.test(GLOBAL.navigator?.userAgent);

export const NATIVE = GLOBAL.NATIVE || false;

export const DENO = !!GLOBAL.Deno?.version?.deno;

const denoVersion = DENO ? GLOBAL.Deno.version.deno.split('.') : [];
// Major and minor versions: Deno 1.10 -> 110, Deno 2.9 -> 209.
export const DENO_VERSION = DENO ? denoVersion[0] * 100 + +denoVersion[1] : 0;

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

if (GLOBAL.Float16Array) $TYPED_ARRAYS.Float16Array = 2;

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

// eslint-disable-next-line es/no-object-setprototypeof -- detection
export const PROTO = !!Object.setPrototypeOf || '__proto__' in Object.prototype;

export let REDEFINABLE_PROTO = false;

try {
  // Chrome 27- bug, also a bug for native `JSON.parse`
  defineProperty({}, '__proto__', { value: 42, writable: true, configurable: true, enumerable: true });
  REDEFINABLE_PROTO = true;
} catch { /* empty */ }

export const STRICT_THIS = (function () {
  return this;
})();

export const STRICT = !STRICT_THIS;

export const FREEZING = !function () {
  try {
    // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- detection
    return Object.isExtensible(Object.preventExtensions({}));
  } catch {
    return true;
  }
}();

export const CORRECT_PROTOTYPE_GETTER = !function () {
  try {
    function F() { /* empty */ }
    F.prototype.constructor = null;
    // eslint-disable-next-line es/no-object-getprototypeof -- detection
    return Object.getPrototypeOf(new F()) !== F.prototype;
  } catch {
    return true;
  }
}();

// FF < 23 bug
export const REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR = DESCRIPTORS && !function () {
  try {
    defineProperty([], 'length', { writable: false });
  } catch {
    return true;
  }
}();

export const WHITESPACES = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

// eslint-disable-next-line es/no-number-maxsafeinteger -- safe
export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

// eslint-disable-next-line es/no-number-minsafeinteger -- safe
export const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER || -9007199254740991;
