'use strict';
var isObject = require('../internals/is-object');
var hasOwn = require('../internals/has-own-property');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var wellKnownSymbol = require('../internals/well-known-symbol');
var TypedArrayCore = require('../internals/typed-array-core');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var TypedArrayPrototype = TypedArrayCore.TypedArrayPrototype;
var getTypedArrayMetadata = TypedArrayCore.getTypedArrayMetadata;

if (!hasOwn(TypedArrayPrototype, TO_STRING_TAG)) {
  defineBuiltInAccessor(TypedArrayPrototype, TO_STRING_TAG, {
    configurable: true,
    get: function () {
      if (isObject(this)) return getTypedArrayMetadata(this, 'TypedArrayName');
    },
  });
}
