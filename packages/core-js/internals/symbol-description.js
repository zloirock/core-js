'use strict';
var globalThis = require('../internals/global-this');
var uncurryThis = require('../internals/function-uncurry-this');
var isCallable = require('../internals/is-callable');
var shared = require('../internals/shared');

// Detect the global implementation; the pure constructor may already be a different shim.
var SymbolConstructor = globalThis.Symbol;
var SymbolPrototype = SymbolConstructor && SymbolConstructor.prototype;
var descriptor = SymbolPrototype && Object.getOwnPropertyDescriptor(SymbolPrototype, 'description');
var CORRECT = isCallable(SymbolConstructor) && SymbolPrototype &&
  'description' in SymbolPrototype &&
  // Safari 12 returns an empty string for an omitted description.
  SymbolConstructor().description === undefined;
var EmptyStringDescriptionStore = shared('symbol-empty-string-description');
var thisSymbolValue = SymbolPrototype && uncurryThis(SymbolPrototype.valueOf);
var symbolDescriptiveString = SymbolPrototype && uncurryThis(SymbolPrototype.toString);
var symbolKeyFor = SymbolConstructor && SymbolConstructor.keyFor;
var STANDARD_SYMBOL_STRING = isCallable(SymbolConstructor) &&
  String(SymbolConstructor('description detection')) === 'Symbol(description detection)';
var regexp = /^Symbol\((.*)\)[^)]+$/;
var replace = uncurryThis(''.replace);
var stringSlice = uncurryThis(''.slice);

module.exports = {
  correct: CORRECT,
  getter: descriptor && descriptor.get,
  valueOf: thisSymbolValue,
  empty: EmptyStringDescriptionStore,
  get: function description() {
    var symbol = thisSymbolValue(this);
    if (symbol in EmptyStringDescriptionStore || symbolKeyFor && symbolKeyFor(symbol) === '') return '';
    var string = symbolDescriptiveString(symbol);
    var desc = STANDARD_SYMBOL_STRING ? stringSlice(string, 7, -1) : replace(string, regexp, '$1');
    return desc === '' ? undefined : desc;
  },
};
