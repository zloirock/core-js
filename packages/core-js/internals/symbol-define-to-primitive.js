'use strict';
var call = require('../internals/function-call');
var getBuiltIn = require('../internals/get-built-in');
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');
var wellKnownSymbol = require('../internals/well-known-symbol');
var defineBuiltIn = require('../internals/define-built-in');
var internalStateGetterFor = require('../internals/internal-state-getter-for');

module.exports = function () {
  var Symbol = getBuiltIn('Symbol');
  var SymbolPrototype = Symbol && Symbol.prototype;
  var valueOf = SymbolPrototype && SymbolPrototype.valueOf;
  var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
  var getInternalSymbolState = internalStateGetterFor('Symbol');

  if (SymbolPrototype && !SymbolPrototype[TO_PRIMITIVE]) {
    // `Symbol.prototype[@@toPrimitive]` method
    // https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
    // eslint-disable-next-line no-unused-vars -- required for .length
    defineBuiltIn(SymbolPrototype, TO_PRIMITIVE, function (hint) {
      // sham symbols have no primitive values - return the hidden string key, so `ToPropertyKey`-style
      // consumers (like the Babel `toPropertyKey` helper) get a working property key instead of an
      // object that they reject with a TypeError
      return NATIVE_SYMBOL ? call(valueOf, this) : getInternalSymbolState(this).tag;
    }, { arity: 1 });
  }
};
