var getCompositeKeyNode = require('../internals/composite-key');
var path = require('../internals/path');
var global = require('../internals/global');

var getSymbolConstructor = function () {
  return typeof path.Symbol === 'function' ? path.Symbol : global.Symbol;
};

// https://github.com/bmeck/proposal-richer-keys/tree/master/compositeKey
require('../internals/export')({ global: true }, {
  compositeSymbol: function compositeSymbol() {
    if (arguments.length === 1 && typeof arguments[0] === 'string') return getSymbolConstructor()['for'](arguments[0]);
    return getCompositeKeyNode.apply(null, arguments).get('symbol', getSymbolConstructor());
  }
});
