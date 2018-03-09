var global = require('../internals/global');
var isObject = require('../internals/is-object');
var has = require('../internals/has');
var classof = require('../internals/classof');
// var getPrototypeOf = require('../internals/object-get-prototype-of');
// var setPrototypeOf = require('../internals/object-set-prototype-of');

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

var NAME/* , TypedArray, TypedArrayPrototype */;

for (NAME in TypedArrayConstructorsList) {
  if (!global[NAME]) NATIVE_ARRAY_BUFFER_VIEWS = false;
}

var isArrayBufferView = function (it) {
  var klass = classof(it);
  return klass === 'DataView' || has(TypedArrayConstructorsList, klass);
};

var isTypedArray = function (it) {
  return isObject(it) && has(TypedArrayConstructorsList, classof(it));
};

var aTypedArray = function (it) {
  if (isTypedArray(it)) return it;
  throw TypeError(it + ' is not a typed array!');
};

module.exports = {
  NATIVE_ARRAY_BUFFER: NATIVE_ARRAY_BUFFER,
  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
  aTypedArray: aTypedArray,
  // exportProto: function () { return TypedArrayPrototype; },
  // exportStatic: function () { return TypedArray; },
  isArrayBufferView: isArrayBufferView,
  isTypedArray: isTypedArray
};
