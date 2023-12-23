'use strict';
var globalThis = require('../internals/global-this');
var hasOwn = require('../internals/has-own-property');
var defineBuiltIn = require('../internals/define-built-in');
var TypedArrayConstructors = require('../internals/typed-array-constructors');
var TypedArray = require('../internals/typed-array-core').TypedArray;

// TODO: Rewrite!!!
module.exports = function (KEY, property, forced) {
  var ARRAY, TypedArrayConstructor;
  if (forced) for (ARRAY in TypedArrayConstructors) {
    TypedArrayConstructor = globalThis[ARRAY];
    if (TypedArrayConstructor && hasOwn(TypedArrayConstructor, KEY)) try {
      delete TypedArrayConstructor[KEY];
    } catch (error) { /* empty */ }
  }
  if (!TypedArray[KEY] || forced) {
    // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
    try {
      return defineBuiltIn(TypedArray, KEY, forced ? property : TypedArray[KEY] || property);
    } catch (error) { /* empty */ }
  } else return;
  for (ARRAY in TypedArrayConstructors) {
    TypedArrayConstructor = globalThis[ARRAY];
    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
      defineBuiltIn(TypedArrayConstructor, KEY, property);
    }
  }
};
