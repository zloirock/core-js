'use strict';
var hasOwn = require('../internals/has-own-property');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var wellKnownSymbol = require('../internals/well-known-symbol');
var getTypedArrayName = require('../internals/get-typed-array-name');
var TypedArrayPrototype = require('../internals/typed-array-core').TypedArrayPrototype;

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

if (!hasOwn(TypedArrayPrototype, TO_STRING_TAG)) {
  // @dependency: es.object.to-string
  defineBuiltInAccessor(TypedArrayPrototype, TO_STRING_TAG, {
    configurable: true,
    get: function () {
      return getTypedArrayName(this);
    },
  });
}
