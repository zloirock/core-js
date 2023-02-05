var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var uncurryThis = require('../internals/function-uncurry-this');

var Symbol = getBuiltIn('Symbol');
var keyFor = Symbol.keyFor;
var thisSymbolValue = uncurryThis(Symbol.prototype.valueOf);

// `Symbol.isRegistered` method
// https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregistered
$({ target: 'Symbol', stat: true }, {
  isRegistered: function isRegistered(value) {
    try {
      return keyFor(thisSymbolValue(value)) !== undefined;
    } catch (error) {
      return false;
    }
  }
});
