var store = require('core-js-internals/shared')('wks');
var uid = require('core-js-internals/uid');
var Symbol = require('core-js-internals/global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
