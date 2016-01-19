// https://gist.github.com/WebReflection/9353781
var $export    = require('./_export')
  , ownKeys    = require('./_own-keys')
  , toIObject  = require('./_to-iobject')
  , createDesc = require('./_property-desc')
  , gOPD       = require('./_object-gopd')
  , dP         = require('./_object-dp');

$export($export.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object){
    var O       = toIObject(object)
      , getDesc = gOPD.f
      , keys    = ownKeys(O)
      , result  = {}
      , i       = 0
      , key, D;
    while(keys.length > i){
      D = getDesc(O, key = keys[i++]);
      if(key in result)dP.f(result, key, createDesc(0, D));
      else result[key] = D;
    } return result;
  }
});