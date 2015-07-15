var $         = require('./$')
  , Iterators = require('./$.iter').Iterators
  , classof   = require('./$.cof').classof
  , ITERATOR  = require('./$.wks')('iterator')
  , global    = $.g;
module.exports = $.core.isIterable = function(it){
  var O      = Object(it)
    , Symbol = global.Symbol;
  return (Symbol && Symbol.iterator || '@@iterator') in O
    || ITERATOR in O
    || $.has(Iterators, classof(O));
};