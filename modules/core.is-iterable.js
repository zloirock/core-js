var classof     = require('./$.classof')
  , ITERATOR    = require('./$.wks')('iterator')
  , Iterators   = require('./$.iterators')
  , ArrayProto  = Array.prototype
  , StringProto = String.prototype;
module.exports = require('./$.core').isIterable = function(it){
  var O = Object(it);
  return ITERATOR in O
    || '@@iterator' in O
    || it === ArrayProto
    || it === StringProto
    || Iterators.hasOwnProperty(classof(O));
};