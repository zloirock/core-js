
'use strict';
var $ = require('../internals/export');
var shared = require('../internals/shared');
var getBuiltIn = require('../internals/get-built-in');
var uncurryThis = require('../internals/function-uncurry-this');
var isSymbol = require('../internals/is-symbol');
var wellKnownSymbol = require('../internals/well-known-symbol');

// dependency: es.symbol.constructor
var Symbol = getBuiltIn('Symbol');
var $isWellKnownSymbol = Symbol.isWellKnownSymbol;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var some = uncurryThis([].some);
var thisSymbolValue = uncurryThis(Symbol.prototype.valueOf);
var WellKnownSymbolsStore = shared('wks');

getOwnPropertyNames(Symbol).forEach(function (symbolKey) {
  // some old engines throws on access to some keys like `arguments` or `caller`
  try {
    if (isSymbol(Symbol[symbolKey])) wellKnownSymbol(symbolKey);
  } catch (error) { /* empty */ }
});

// `Symbol.isWellKnownSymbol` method
// https://tc39.es/proposal-symbol-predicates/#sec-symbol-iswellknownsymbol
// We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
$({ target: 'Symbol', stat: true, forced: true }, {
  isWellKnownSymbol: function isWellKnownSymbol(value) {
    if ($isWellKnownSymbol && $isWellKnownSymbol(value)) return true;
    try {
      var symbol = thisSymbolValue(value);
      return some(getOwnPropertyNames(WellKnownSymbolsStore), function (key) {
        // eslint-disable-next-line eqeqeq -- polyfilled symbols case
        if (WellKnownSymbolsStore[key] == symbol) return true;
      });
    } catch (error) { /* empty */ }
    return false;
  },
});
