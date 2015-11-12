var store      = require('./$.shared')('wks')
  , uid        = require('./$.uid')
  , Symbol     = require('./$.global').Symbol
  , USE_SYMBOL = require('./$.correct-symbol');
module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};