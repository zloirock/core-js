'use strict';
if (require('../internals/descriptors')) {
  var global = require('../internals/global');
  var fails = require('../internals/fails');
  var $export = require('../internals/export');
  var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
  var TypedBufferModule = require('../internals/typed-buffer');
  var anInstance = require('../internals/an-instance');
  var createPropertyDescriptor = require('../internals/create-property-descriptor');
  var hide = require('../internals/hide');
  var toLength = require('../internals/to-length');
  var toIndex = require('../internals/to-index');
  var toOffset = require('../internals/to-offset');
  var toPrimitive = require('../internals/to-primitive');
  var has = require('../internals/has');
  var classof = require('../internals/classof');
  var isObject = require('../internals/is-object');
  var create = require('../internals/object-create');
  var setPrototypeOf = require('../internals/object-set-prototype-of');
  var getPrototypeOf = require('../internals/object-get-prototype-of');
  var getOwnPropertyNames = require('../internals/object-get-own-property-names').f;
  var TAG = require('../internals/well-known-symbol')('toStringTag');
  var uid = require('../internals/uid');
  var typedArrayFrom = require('../internals/typed-array-from');
  var arrayForEach = require('../internals/array-methods')(0);
  var checkCorrectnessOfIteration = require('../internals/check-correctness-of-iteration');
  var setSpecies = require('../internals/set-species');
  var definePropertyModule = require('../internals/object-define-property');
  var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
  var InternalStateModule = require('../internals/internal-state');
  var getInternalState = InternalStateModule.get;
  var setInternalState = InternalStateModule.set;
  var nativeDefineProperty = definePropertyModule.f;
  var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  var RangeError = global.RangeError;
  var Uint8Array = global.Uint8Array;
  var ARRAY_BUFFER = 'ArrayBuffer';
  var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
  var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
  var PROTOTYPE = 'prototype';
  var ArrayBuffer = TypedBufferModule.ArrayBuffer;
  var DataView = TypedBufferModule.DataView;
  var TYPED_ARRAY = uid('typed_array');
  var NATIVE_ARRAY_BUFFER_VIEWS = ArrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
  var TypedArrayConstructor = ArrayBufferViewCore.TypedArray;
  var aTypedArrayConstructor = ArrayBufferViewCore.aTypedArrayConstructor;
  var isTypedArray = ArrayBufferViewCore.isTypedArray;
  var WRONG_LENGTH = 'Wrong length!';

  var LITTLE_ENDIAN = fails(function () {
    // eslint-disable-next-line no-undef
    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
  });

  var fromList = function (C, list) {
    var index = 0;
    var length = list.length;
    var result = new (aTypedArrayConstructor(C))(length);
    while (length > index) result[index] = list[index++];
    return result;
  };

  var addGetter = function (it, key) {
    nativeDefineProperty(it, key, { get: function () { return getInternalState(this)[key]; } });
  };

  var isTypedArrayIndex = function (target, key) {
    return isTypedArray(target)
      && typeof key != 'symbol'
      && key in target
      && String(+key) == String(key);
  };
  var getOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
    return isTypedArrayIndex(target, key = toPrimitive(key, true))
      ? createPropertyDescriptor(2, target[key])
      : nativeGetOwnPropertyDescriptor(target, key);
  };
  var defineProperty = function defineProperty(target, key, descriptor) {
    if (isTypedArrayIndex(target, key = toPrimitive(key, true))
      && isObject(descriptor)
      && has(descriptor, 'value')
      && !has(descriptor, 'get')
      && !has(descriptor, 'set')
      // TODO: add validation descriptor w/o calling accessors
      && !descriptor.configurable
      && (!has(descriptor, 'writable') || descriptor.writable)
      && (!has(descriptor, 'enumerable') || descriptor.enumerable)
    ) {
      target[key] = descriptor.value;
      return target;
    } return nativeDefineProperty(target, key, descriptor);
  };

  if (!NATIVE_ARRAY_BUFFER_VIEWS) {
    getOwnPropertyDescriptorModule.f = getOwnPropertyDescriptor;
    definePropertyModule.f = defineProperty;
  }

  $export({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
    getOwnPropertyDescriptor: getOwnPropertyDescriptor,
    defineProperty: defineProperty
  });

  var $TypedArrayPrototype$ = {};
  addGetter($TypedArrayPrototype$, 'buffer');
  addGetter($TypedArrayPrototype$, 'byteOffset');
  addGetter($TypedArrayPrototype$, 'byteLength');
  addGetter($TypedArrayPrototype$, 'length');
  nativeDefineProperty($TypedArrayPrototype$, TAG, {
    get: function () { return this[TYPED_ARRAY]; }
  });

  // eslint-disable-next-line max-statements
  module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
    CLAMPED = !!CLAMPED;
    var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
    var GETTER = 'get' + KEY;
    var SETTER = 'set' + KEY;
    var TypedArray = global[NAME];
    var Base = TypedArray || {};
    var TAC = TypedArray && getPrototypeOf(TypedArray);
    var FORCED = !TypedArray || !ArrayBufferViewCore.NATIVE_ARRAY_BUFFER;
    var exported = {};
    var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
    var getter = function (that, index) {
      var data = getInternalState(that);
      return data.view[GETTER](index * BYTES + data.byteOffset, LITTLE_ENDIAN);
    };
    var setter = function (that, index, value) {
      var data = getInternalState(that);
      if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
      data.view[SETTER](index * BYTES + data.byteOffset, value, LITTLE_ENDIAN);
    };
    var addElement = function (that, index) {
      nativeDefineProperty(that, index, {
        get: function () {
          return getter(this, index);
        },
        set: function (value) {
          return setter(this, index, value);
        },
        enumerable: true
      });
    };
    if (FORCED) {
      TypedArray = wrapper(function (that, data, offset, $length) {
        anInstance(that, TypedArray, NAME);
        var index = 0;
        var byteOffset = 0;
        var buffer, byteLength, length, klass;
        if (!isObject(data)) {
          length = toIndex(data);
          byteLength = length * BYTES;
          buffer = new ArrayBuffer(byteLength);
        } else if (data instanceof ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
          buffer = data;
          byteOffset = toOffset(offset, BYTES);
          var $len = data.byteLength;
          if ($length === undefined) {
            if ($len % BYTES) throw RangeError(WRONG_LENGTH);
            byteLength = $len - byteOffset;
            if (byteLength < 0) throw RangeError(WRONG_LENGTH);
          } else {
            byteLength = toLength($length) * BYTES;
            if (byteLength + byteOffset > $len) throw RangeError(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if (isTypedArray(data)) {
          return fromList(TypedArray, data);
        } else {
          return typedArrayFrom.call(TypedArray, data);
        }
        setInternalState(that, {
          buffer: buffer,
          byteOffset: byteOffset,
          byteLength: byteLength,
          length: length,
          view: new DataView(buffer)
        });
        while (index < length) addElement(that, index++);
      });
      if (setPrototypeOf) setPrototypeOf(TypedArray, TypedArrayConstructor);
      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
    } else if (!fails(function () {
      TypedArray(1);
    }) || !fails(function () {
      new TypedArray(-1); // eslint-disable-line no-new
    }) || !checkCorrectnessOfIteration(function (iterable) {
      new TypedArray(); // eslint-disable-line no-new
      new TypedArray(null); // eslint-disable-line no-new
      new TypedArray(1.5); // eslint-disable-line no-new
      new TypedArray(iterable); // eslint-disable-line no-new
    }, true)) {
      TypedArray = wrapper(function (that, data, typedArrayOffset, $length) {
        anInstance(that, TypedArray, NAME);
        var klass;
        if (!isObject(data)) return new Base(toIndex(data));
        if (data instanceof ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
          return $length !== undefined
            ? new Base(data, toOffset(typedArrayOffset, BYTES), $length)
            : typedArrayOffset !== undefined
              ? new Base(data, toOffset(typedArrayOffset, BYTES))
              : new Base(data);
        }
        if (isTypedArray(data)) return fromList(TypedArray, data);
        return typedArrayFrom.call(TypedArray, data);
      });
      if (setPrototypeOf) setPrototypeOf(TypedArray, TypedArrayConstructor);
      arrayForEach(TAC !== Function.prototype
        ? getOwnPropertyNames(Base).concat(getOwnPropertyNames(TAC))
        : getOwnPropertyNames(Base)
      , function (key) {
        if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
      });
      TypedArray[PROTOTYPE] = TypedArrayPrototype;
    }
    if (TypedArrayPrototype.constructor !== TypedArray) hide(TypedArrayPrototype, 'constructor', TypedArray);
    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);

    if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
      nativeDefineProperty(TypedArrayPrototype, TAG, {
        get: function () { return NAME; }
      });
    }

    exported[NAME] = TypedArray;

    $export({ global: true, forced: TypedArray != Base }, exported);

    if (!(BYTES_PER_ELEMENT in TypedArray)) hide(TypedArray, BYTES_PER_ELEMENT, BYTES);
    if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

    setSpecies(NAME);
  };
} else module.exports = function () { /* empty */ };
