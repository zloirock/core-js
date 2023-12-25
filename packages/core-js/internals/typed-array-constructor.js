'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var call = require('../internals/function-call');
var TYPED_ARRAY_CONSTRUCTORS_REQUIRE_WRAPPERS = require('../internals/typed-array-constructors-require-wrappers');
var TypedArray = require('../internals/typed-array-core').TypedArray;
var anInstance = require('../internals/an-instance');
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
var copyConstructorProperties = require('../internals/copy-constructor-properties');

var ArrayBufferPrototype = ArrayBuffer.prototype;

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

  if (TYPED_ARRAY_CONSTRUCTORS_REQUIRE_WRAPPERS) {
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

    TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
    TypedArrayConstructorPrototype.constructor = TypedArrayConstructor;
    // `.from` and `.of` has buggy descriptors in V8 ~ Chrome 50- and anyway can't work with wrappers
    copyConstructorProperties(TypedArrayConstructor, NativeTypedArrayConstructor, { from: false, of: false });
    setPrototypeOf(TypedArrayConstructor, TypedArray);
  }

  exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

  $({ global: true, constructor: true, forced: TYPED_ARRAY_CONSTRUCTORS_REQUIRE_WRAPPERS }, exported);
};
