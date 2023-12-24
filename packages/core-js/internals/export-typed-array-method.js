'use strict';
var globalThis = require('../internals/global-this');
var defineBuiltIn = require('../internals/define-built-in');
var hasOwn = require('../internals/has-own-property');
var TypedArrayConstructors = require('../internals/typed-array-constructors');
var TypedArrayPrototype = require('../internals/typed-array-core').TypedArrayPrototype;

module.exports = function (key, property, forced, options) {
  var exported = forced ? property : Int8Array.prototype[key] || property;

  for (var name in TypedArrayConstructors) {
    var Prototype = globalThis[name] && globalThis[name].prototype;
    if (Prototype && hasOwn(Prototype, key)) try {
      delete Prototype[key];
    } catch (error) {
      // old WebKit bug - some methods are non-configurable
      try {
        Prototype[key] = exported;
      } catch (error2) { /* empty */ }
    }
  }

  // in some cases, this comparison is required since, for example, in V8 ~ Chrome 48-
  // `Int8#toLocaleString` is correct, but also exists generic incorrect `%TypedArrayPrototype%#toLocaleString`
  if (TypedArrayPrototype[key] !== exported) {
    defineBuiltIn(TypedArrayPrototype, key, exported, options);
  }
};
