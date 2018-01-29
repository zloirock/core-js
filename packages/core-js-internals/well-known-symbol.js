var store = require('./shared')('wks');
var uid = require('./uid');
var Symbol = require('./global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

module.exports = function (name) {
  return store[name] || (store[name] = USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};
