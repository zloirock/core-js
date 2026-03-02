'use strict';
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var hasOwn = require('../internals/has-own-property');
var toString = require('../internals/to-string');
var shared = require('../internals/shared');
var NATIVE_SYMBOL_REGISTRY = require('../internals/symbol-registry-detection');

var StringToSymbolRegistry = NATIVE_SYMBOL_REGISTRY || shared('string-to-symbol-registry');
var SymbolToStringRegistry = NATIVE_SYMBOL_REGISTRY || shared('symbol-to-string-registry');
// @dependency: es.symbol.constructor
// @dependency: es.symbol.description
var Symbol = getBuiltIn('Symbol');

// `Symbol.for` method
// https://tc39.es/ecma262/#sec-symbol.for
$({ target: 'Symbol', stat: true, forced: !NATIVE_SYMBOL_REGISTRY }, {
  for: function (key) {
    var string = toString(key);
    if (hasOwn(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = Symbol(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  },
});
