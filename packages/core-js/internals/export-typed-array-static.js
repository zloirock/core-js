'use strict';
var globalThis = require('../internals/global-this');
var hasOwn = require('../internals/has-own-property');
var defineBuiltIn = require('../internals/define-built-in');
var TypedArrayConstructors = require('../internals/typed-array-constructors');
var TypedArray = require('../internals/typed-array-core').TypedArray;

module.exports = function (key, property, forced) {
  var exported = forced ? property : TypedArray[key] || property;
  var definitionThrows = false;

  if (!TypedArray[key] || forced) try {
    defineBuiltIn(TypedArray, key, exported);
  } catch (error) {
    // V8 ~ Chrome 49-50 `%TypedArray%` static methods are non-writable non-configurable
    definitionThrows = true;
  }

  for (var name in TypedArrayConstructors) {
    var Constructor = globalThis[name];

    // V8 ~ Chrome 48- `%TypedArray%` constructors static methods are non-writable non-configurable
    if (Constructor) try {
      if (definitionThrows) defineBuiltIn(Constructor, key, exported);
      else if (hasOwn(Constructor, key)) delete Constructor[key];
    } catch (error) { /* empty */ }
  }
};
