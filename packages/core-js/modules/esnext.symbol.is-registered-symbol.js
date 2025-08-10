'use strict';
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var uncurryThis = require('../internals/function-uncurry-this');

var Symbol = getBuiltIn('Symbol');
var keyFor = Symbol.keyFor;
var thisSymbolValue = uncurryThis(Symbol.prototype.valueOf);

// `Symbol.isRegisteredSymbol` method
// https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregisteredsymbol
$({ target: 'Symbol', stat: true }, {
  isRegisteredSymbol: Symbol.isRegisteredSymbol || function isRegisteredSymbol(value) {
    try {
      return keyFor(thisSymbolValue(value)) !== undefined;
    } catch (error) {
      return false;
    }
  }
});
