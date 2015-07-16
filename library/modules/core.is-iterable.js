var $         = require('./$')
  , classof   = require('./$.cof').classof
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators')
  , global    = $.g;
module.exports = $.core.isIterable = function(it){
  var O      = Object(it)
    , Symbol = global.Symbol;
  return (Symbol && Symbol.iterator || '@@iterator') in O
    || ITERATOR in O
    || $.has(Iterators, classof(O));
};