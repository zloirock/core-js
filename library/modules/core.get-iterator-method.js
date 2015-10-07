var classof     = require('./$.classof')
  , ITERATOR    = require('./$.wks')('iterator')
  , Iterators   = require('./$.iterators')
  , ArrayProto  = Array.prototype
  , StringProto = String.prototype;
module.exports = require('./$.core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR] || it['@@iterator']
    || Iterators[it === ArrayProto ? 'Array' : it === StringProto ? 'String' : classof(it)];
};