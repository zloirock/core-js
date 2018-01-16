// https://tc39.github.io/proposal-Symbol-description/
'use strict';
var DESCRIPTORS = require('./_descriptors');
var has = require('./_has');
var isObject = require('./_is-object');
var gOPN = require('./_object-gopn').f;
var gOPD = require('./_object-gopd').f;
var dP = require('./_object-dp').f;
var Base = require('./_global').Symbol;

if (DESCRIPTORS && typeof Base == 'function' && !('description' in Base.prototype)) {
  var emptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var $Symbol = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
    var result = this instanceof $Symbol ? new Base(description) : Base(description);
    if (description === '') emptyStringDescriptionStore[result] = true;
    return result;
  };
  for (var keys = gOPN(Base), i = 0, key; keys.length > i; i++) {
    if (!has($Symbol, key = keys[i])) {
      dP($Symbol, key, gOPD(Base, key));
    }
  }
  var symbolPrototype = $Symbol.prototype = Base.prototype;
  symbolPrototype.constructor = $Symbol;

  var $toString = symbolPrototype.toString;
  var native = String(Base('test')) == 'Symbol(test)';
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  dP(symbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = isObject(this) ? this.valueOf() : this;
      var string = $toString.call(symbol);
      if (has(emptyStringDescriptionStore, symbol)) return '';
      var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  require('./_export')({ global: true, forced: true }, { Symbol: $Symbol });
}
