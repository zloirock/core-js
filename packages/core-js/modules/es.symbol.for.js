var $ = require('../internals/export');
var has = require('../internals/has');
var getBuiltIn = require('../internals/get-built-in');
var shared = require('../internals/shared');
var toString = require('../internals/to-string');
var NATIVE_SYMBOL = require('../internals/native-symbol');

var StringToSymbolRegistry = shared('string-to-symbol-registry');
var SymbolToStringRegistry = shared('symbol-to-string-registry');

// `Symbol.for` method
// https://tc39.es/ecma262/#sec-symbol.for
$({ target: 'Symbol', stat: true, forced: !NATIVE_SYMBOL }, {
  for: function (key) {
    var string = toString(key);
    if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = getBuiltIn('Symbol')(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  },
});
