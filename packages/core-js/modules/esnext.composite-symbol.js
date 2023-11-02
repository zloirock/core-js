'use strict';
var $ = require('../internals/export');
var getCompositeKeyNode = require('../internals/composite-key');
var getBuiltIn = require('../internals/get-built-in');
var apply = require('../internals/function-apply');

// dependency: es.symbol.constructor
var Symbol = getBuiltIn('Symbol');
// dependency: es.symbol.for
var symbolFor = Symbol.for;

// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
$({ global: true, forced: true }, {
  compositeSymbol: function compositeSymbol() {
    if (arguments.length === 1 && typeof arguments[0] == 'string') return symbolFor(arguments[0]);
    return apply(getCompositeKeyNode, null, arguments).get('symbol', Symbol);
  },
});
