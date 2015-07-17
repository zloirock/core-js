var $        = require('./$')
  , ownKeys  = require('./$.own-keys')
  , toObject = require('./$.to-object');

module.exports = function define(target, mixin){
  var keys   = ownKeys(toObject(mixin))
    , length = keys.length
    , i = 0, key;
  while(length > i)$.setDesc(target, key = keys[i++], $.getDesc(mixin, key));
  return target;
};