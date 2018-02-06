// https://tc39.github.io/proposal-Symbol-description/
'use strict';
var DESCRIPTORS = require('core-js-internals/descriptors');
var has = require('core-js-internals/has');
var isObject = require('core-js-internals/is-object');
var getOwnPropertyNames = require('./_object-get-own-property-names').f;
var getOwnPropertyDescriptor = require('./_object-get-own-property-descriptor').f;
var defineProperty = require('./_object-define-property').f;
var Base = require('core-js-internals/global').Symbol;

if (DESCRIPTORS && typeof Base == 'function' && !('description' in Base.prototype)) {
  var emptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var $Symbol = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
    var result = this instanceof $Symbol
      ? new Base(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? Base() : Base(description);
    if (description === '') emptyStringDescriptionStore[result] = true;
    return result;
  };
  for (var keys = getOwnPropertyNames(Base), i = 0, key; keys.length > i; i++) {
    if (!has($Symbol, key = keys[i])) {
      defineProperty($Symbol, key, getOwnPropertyDescriptor(Base, key));
    }
  }
  var symbolPrototype = $Symbol.prototype = Base.prototype;
  symbolPrototype.constructor = $Symbol;

  var symbolToString = symbolPrototype.toString;
  var native = String(Base('test')) == 'Symbol(test)';
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  defineProperty(symbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = isObject(this) ? this.valueOf() : this;
      var string = symbolToString.call(symbol);
      if (has(emptyStringDescriptionStore, symbol)) return '';
      var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  require('./_export')({ global: true, forced: true }, { Symbol: $Symbol });
}
