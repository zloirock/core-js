var DESCRIPTORS = require('../internals/descriptors');
var global = require('../internals/global');
var isObject = require('../internals/is-object');
var has = require('../internals/has');
var classof = require('../internals/classof');
var redefine = require('../internals/redefine');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var ObjectPrototype = Object.prototype;

var DataView = global.DataView;
var Uint8Array = global.Uint8Array;
var Uint8ArrayPrototype = Uint8Array && Uint8Array.prototype;
var TypedArrayConstructor = isObject(Uint8Array) && getPrototypeOf(Uint8Array);
var TypedArrayPrototype = isObject(Uint8ArrayPrototype) && getPrototypeOf(Uint8ArrayPrototype);

var NATIVE_ARRAY_BUFFER = !!(global.ArrayBuffer && global.DataView);
var NATIVE_ARRAY_BUFFER_VIEWS = NATIVE_ARRAY_BUFFER;

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

var exportProto = function (KEY, property, forced) {
  if (!DESCRIPTORS) return;
  var ARRAY;
  if (CORRECT_PROTOTYPE_CHAIN) {
    if (forced) for (ARRAY in TypedArrayConstructorsList) {
      if (global[ARRAY] && has(global[ARRAY].prototype, KEY)) delete global[ARRAY].prototype[KEY];
    }
    if (!TypedArrayPrototype[KEY] || forced) {
      redefine(TypedArrayPrototype, KEY, forced ? property : Uint8ArrayPrototype[KEY] || property);
    }
  } else for (ARRAY in TypedArrayConstructorsList) {
    if (global[ARRAY]) redefine(global[ARRAY].prototype, KEY, forced ? property : Uint8ArrayPrototype[KEY] || property);
  }
};

var exportStatic = function (KEY, property, forced) {
  if (!DESCRIPTORS) return;
  var ARRAY;
  if (CORRECT_PROTOTYPE_CHAIN) {
    if (forced) for (ARRAY in TypedArrayConstructorsList) {
      if (global[ARRAY] && has(global[ARRAY], KEY)) delete global[ARRAY][KEY];
    }
    if (!TypedArrayConstructor[KEY] || forced) {
      redefine(TypedArrayConstructor, KEY, forced ? property : Uint8Array[KEY] || property);
    }
  } else for (ARRAY in TypedArrayConstructorsList) {
    if (global[ARRAY]) redefine(global[ARRAY], KEY, forced ? property : Uint8Array[KEY] || property);
  }
};

var CORRECT_PROTOTYPE_CHAIN, NAME;

for (NAME in TypedArrayConstructorsList) {
  if (!global[NAME]) NATIVE_ARRAY_BUFFER_VIEWS = false;
}

CORRECT_PROTOTYPE_CHAIN = !NATIVE_ARRAY_BUFFER_VIEWS || !!setPrototypeOf;

if (!TypedArrayConstructor || TypedArrayConstructor === Function.prototype) {
  TypedArrayConstructor = function TypedArray() {
    throw TypeError('Incorrect invocation!');
  };

  if (Uint8Array && setPrototypeOf) for (NAME in TypedArrayConstructorsList) {
    if (global[NAME]) setPrototypeOf(global[NAME], TypedArrayConstructor);
  }
}

if (!TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype) {
  TypedArrayPrototype = {};

  if (Uint8ArrayPrototype && setPrototypeOf) for (NAME in TypedArrayConstructorsList) {
    if (global[NAME]) setPrototypeOf(global[NAME].prototype, TypedArrayPrototype);
  }
}

// WebKit bug - the same parent prototype for typed arrays and data view
if (DataView && setPrototypeOf && getPrototypeOf(DataView.prototype) !== ObjectPrototype) {
  setPrototypeOf(DataView.prototype, ObjectPrototype);
}

module.exports = {
  CORRECT_PROTOTYPE_CHAIN: CORRECT_PROTOTYPE_CHAIN,
  NATIVE_ARRAY_BUFFER: NATIVE_ARRAY_BUFFER,
  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
  aTypedArray: aTypedArray,
  exportProto: exportProto,
  exportStatic: exportStatic,
  isArrayBufferView: isArrayBufferView,
  isTypedArray: isTypedArray,
  TypedArray: TypedArrayConstructor,
  TypedArrayPrototype: TypedArrayPrototype,
  TypedArrayConstructorsList: TypedArrayConstructorsList
};
