var $         = require('./$')
  , classof   = require('./$.cof').classof
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators')
  , global    = $.g;
module.exports = $.core.getIteratorMethod = function(it){
  var Symbol = global.Symbol;
  if(it != undefined){
    return it[Symbol && Symbol.iterator || '@@iterator']
      || it[ITERATOR]
      || Iterators[classof(it)];
  }
};