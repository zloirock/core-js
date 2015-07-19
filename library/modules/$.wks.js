var store  = require('./$.shared')('wks')
  , Symbol = require('./$').g.Symbol;
module.exports = function(name){
  return store[name] || (store[name] =
    Symbol && Symbol[name] || (Symbol || require('./$.uid'))('Symbol.' + name));
};