'use strict';
var globalThis = require('../internals/global-this');
var defineBuiltIn = require('../internals/define-built-in');
var hasOwn = require('../internals/has-own-property');
var TypedArrayConstructors = require('../internals/typed-array-constructors');
var TypedArrayPrototype = require('../internals/typed-array-core').TypedArrayPrototype;

module.exports = function (KEY, property, forced, options) {
  if (forced) for (var ARRAY in TypedArrayConstructors) {
    var TypedArrayConstructor = globalThis[ARRAY];
    if (TypedArrayConstructor && hasOwn(TypedArrayConstructor.prototype, KEY)) try {
      delete TypedArrayConstructor.prototype[KEY];
    } catch (error) {
      // old WebKit bug - some methods are non-configurable
      try {
        TypedArrayConstructor.prototype[KEY] = property;
      } catch (error2) { /* empty */ }
    }
  }
  if (!TypedArrayPrototype[KEY] || forced) {
    defineBuiltIn(TypedArrayPrototype, KEY, forced ? property
      : Int8Array.prototype[KEY] || property, options);
  }
};
