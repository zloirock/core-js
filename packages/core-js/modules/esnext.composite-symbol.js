var path = require('../internals/path');
var global = require('../internals/global');
var getCompositeKeyNode = require('../internals/composite-key');

var initializer = function () {
  return path.Symbol ? path.Symbol() : global.Symbol();
};

// https://github.com/bmeck/proposal-richer-keys/tree/master/compositeKey
require('../internals/export')({ global: true }, {
  compositeSymbol: function compositeSymbol() {
    return getCompositeKeyNode.apply(null, arguments).get('symbol', initializer);
  }
});
