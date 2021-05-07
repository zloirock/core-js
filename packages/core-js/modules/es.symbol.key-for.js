var $ = require('../internals/export');
var has = require('../internals/has');
var isSymbol = require('../internals/is-symbol');
var shared = require('../internals/shared');
var NATIVE_SYMBOL = require('../internals/native-symbol');

var SymbolToStringRegistry = shared('symbol-to-string-registry');

// `Symbol.keyFor` method
// https://tc39.es/ecma262/#sec-symbol.keyfor
$({ target: 'Symbol', stat: true, forced: !NATIVE_SYMBOL }, {
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
    if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  },
});
