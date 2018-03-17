'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var global = require('../internals/global');
var isObject = require('../internals/is-object');
var has = require('../internals/has');
var classof = require('../internals/classof');
var hide = require('../internals/hide');
var redefine = require('../internals/redefine');
var defineProperty = require('../internals/object-define-property').f;
var getPrototypeOf = require('../internals/object-get-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var TO_STRING_TAG = require('../internals/well-known-symbol')('toStringTag');
var TYPED_ARRAY_TAG = require('../internals/uid')('TYPED_ARRAY_TAG');

var DataView = global.DataView;
var DataViewPrototype = DataView && DataView.prototype;
var Uint8Array = global.Uint8Array;
var Uint8ArrayPrototype = Uint8Array && Uint8Array.prototype;
var Uint8ClampedArray = global.Uint8ClampedArray;
var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
var TypedArray = Uint8Array && getPrototypeOf(Uint8Array);
var TypedArrayPrototype = Uint8ArrayPrototype && getPrototypeOf(Uint8ArrayPrototype);
var ObjectPrototype = Object.prototype;
var isPrototypeOf = ObjectPrototype.isPrototypeOf;

var NATIVE_ARRAY_BUFFER = !!(global.ArrayBuffer && global.DataView);
var NATIVE_ARRAY_BUFFER_VIEWS = NATIVE_ARRAY_BUFFER && !!setPrototypeOf;
var TYPED_ARRAY_TAG_REQIRED = false;
var NAME;

var TypedArrayConstructorsList = {
  Int8Array: 1,
  Uint8Array: 1,
  Uint8ClampedArray: 1,
  Int16Array: 2,
  Uint16Array: 2,
  Int32Array: 4,
  Uint32Array: 4,
  Float32Array: 4,
  Float64Array: 8
};

var isArrayBufferView = function (it) {
  var klass = classof(it);
  return klass === 'DataView' || has(TypedArrayConstructorsList, klass);
};

var isTypedArray = function (it) {
  return isObject(it) && has(TypedArrayConstructorsList, classof(it));
};

var aTypedArray = function (it) {
  if (isTypedArray(it)) return it;
  throw TypeError('Target is not a typed array!');
};

var aTypedArrayConstructor = function (C) {
  if (isPrototypeOf.call(TypedArray, C)) return C;
  throw TypeError('It is not a typed array constructor!');
};

var exportProto = function (KEY, property, forced) {
  if (!DESCRIPTORS) return;
  var ARRAY;
  if (forced) for (ARRAY in TypedArrayConstructorsList) {
    if (global[ARRAY] && has(global[ARRAY].prototype, KEY)) delete global[ARRAY].prototype[KEY];
  }
  if (!TypedArrayPrototype[KEY] || forced) {
    redefine(TypedArrayPrototype, KEY, forced ? property : Uint8ArrayPrototype[KEY] || property);
  }
};

var exportStatic = function (KEY, property, forced) {
  if (!DESCRIPTORS) return;
  var ARRAY;
  if (forced) for (ARRAY in TypedArrayConstructorsList) {
    if (global[ARRAY] && has(global[ARRAY], KEY)) delete global[ARRAY][KEY];
  }
  if (!TypedArray[KEY] || forced) {
    redefine(TypedArray, KEY, forced ? property : Uint8Array[KEY] || property);
  }
};

for (NAME in TypedArrayConstructorsList) {
  if (!global[NAME]) NATIVE_ARRAY_BUFFER_VIEWS = false;
}

// WebKit bug - typed arrays constructors prototype is Object.prototype
if (!NATIVE_ARRAY_BUFFER_VIEWS || typeof TypedArray != 'function' || TypedArray === Function.prototype) {
  // eslint-disable-next-line no-shadow
  TypedArray = function TypedArray() {
    throw TypeError('Incorrect invocation!');
  };
  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
    if (global[NAME]) setPrototypeOf(global[NAME], TypedArray);
  }
}

if (!NATIVE_ARRAY_BUFFER_VIEWS || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype) {
  TypedArrayPrototype = TypedArray.prototype;
  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
    if (global[NAME]) setPrototypeOf(global[NAME].prototype, TypedArrayPrototype);
  }
}

// WebKit bug - one more object in Uint8ClampedArray prototype chain
if (NATIVE_ARRAY_BUFFER_VIEWS && getPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
  setPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype);
}

if (!has(TypedArrayPrototype, TO_STRING_TAG)) {
  TYPED_ARRAY_TAG_REQIRED = true;
  defineProperty(TypedArrayPrototype, TO_STRING_TAG, { get: function () {
    return isObject(this) ? this[TYPED_ARRAY_TAG] : undefined;
  } });
  for (NAME in TypedArrayConstructorsList) hide(global[NAME], TYPED_ARRAY_TAG, NAME);
}

// WebKit bug - the same parent prototype for typed arrays and data view
if (NATIVE_ARRAY_BUFFER && setPrototypeOf && getPrototypeOf(DataViewPrototype) !== ObjectPrototype) {
  setPrototypeOf(DataViewPrototype, ObjectPrototype);
}

module.exports = {
  NATIVE_ARRAY_BUFFER: NATIVE_ARRAY_BUFFER,
  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQIRED && TYPED_ARRAY_TAG,
  aTypedArray: aTypedArray,
  aTypedArrayConstructor: aTypedArrayConstructor,
  exportProto: exportProto,
  exportStatic: exportStatic,
  isArrayBufferView: isArrayBufferView,
  isTypedArray: isTypedArray,
  TypedArray: TypedArray,
  TypedArrayPrototype: TypedArrayPrototype
};
