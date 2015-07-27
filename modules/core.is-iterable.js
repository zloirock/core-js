var global    = require('./$.global')
  , has       = require('./$.has')
  , classof   = require('./$.classof')
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators');
module.exports = require('./$.core').isIterable = function(it){
  var O      = Object(it)
    , Symbol = global.Symbol;
  return (Symbol && Symbol.iterator || '@@iterator') in O
    || ITERATOR in O
    || has(Iterators, classof(O));
};