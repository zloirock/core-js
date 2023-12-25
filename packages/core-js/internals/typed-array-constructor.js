'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var call = require('../internals/function-call');
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = require('../internals/typed-array-constructors-require-wrappers');
var TypedArray = require('../internals/typed-array-core').TypedArray;
var anInstance = require('../internals/an-instance');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var toIndex = require('../internals/to-index');
var toOffset = require('../internals/to-offset');
var classof = require('../internals/classof');
var isObject = require('../internals/is-object');
var isTypedArray = require('../internals/is-typed-array');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var typedArrayFrom = require('../internals/typed-array-from');
var arrayFromConstructorAndList = require('../internals/array-from-constructor-and-list');
var inheritIfRequired = require('../internals/inherit-if-required');

var getOwnPropertyNames = Object.getOwnPropertyNames;
var ArrayBufferPrototype = ArrayBuffer.prototype;
var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';

var isArrayBuffer = function (it) {
  var klass;
  return isPrototypeOf(ArrayBufferPrototype, it) || (klass = classof(it)) === 'ArrayBuffer' || klass === 'SharedArrayBuffer';
};

module.exports = function (TYPE, wrapper, CLAMPED) {
  var BYTES = TYPE.match(/\d+/)[0] / 8;
  var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
  var NativeTypedArrayConstructor = globalThis[CONSTRUCTOR_NAME];
  var TypedArrayConstructor = NativeTypedArrayConstructor;
  var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
  var exported = {};

  if (TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS) {
    TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, length) {
      anInstance(dummy, TypedArrayConstructorPrototype);
      return inheritIfRequired(function () {
        if (!isObject(data)) return new NativeTypedArrayConstructor(toIndex(data));
        if (isArrayBuffer(data)) return length !== undefined
          ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES), length)
          : typedArrayOffset !== undefined
            ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES))
            : new NativeTypedArrayConstructor(data);
        if (isTypedArray(data)) return arrayFromConstructorAndList(TypedArrayConstructor, data);
        return call(typedArrayFrom, TypedArrayConstructor, data);
      }(), dummy, TypedArrayConstructor);
    });

    setPrototypeOf(TypedArrayConstructor, TypedArray);
    getOwnPropertyNames(NativeTypedArrayConstructor).forEach(function (key) {
      if (!(key in TypedArrayConstructor)) {
        createNonEnumerableProperty(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
      }
    });
    TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
    TypedArrayConstructorPrototype.constructor = TypedArrayConstructor;
  }

  exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

  $({ global: true, constructor: true, forced: TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS }, exported);

  if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
    createNonEnumerableProperty(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
  }

  if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
    createNonEnumerableProperty(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
  }
};
