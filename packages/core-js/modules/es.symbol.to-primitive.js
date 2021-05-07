var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var defineWellKnownSymbol = require('../internals/define-well-known-symbol');
var getBuiltIn = require('../internals/get-built-in');
var wellKnownSymbol = require('../internals/well-known-symbol');

// `Symbol.toPrimitive` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.toprimitive
defineWellKnownSymbol('toPrimitive');

var SymbolPrototype = getBuiltIn('Symbol').prototype;
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
if (SymbolPrototype && !SymbolPrototype[TO_PRIMITIVE]) {
  createNonEnumerableProperty(SymbolPrototype, TO_PRIMITIVE, SymbolPrototype.valueOf);
}
