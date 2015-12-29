var Set                     = require('./es6.set')
  , metadata                = require('./_metadata')
  , anObject                = require('./_an-object')
  , getPrototypeOf          = require('./_').getProto
  , ordinaryOwnMetadataKeys = metadata.keys
  , toMetaKey               = metadata.key;

var ordinaryMetadataKeys = function(O, P){
  var ownKeys = ordinaryOwnMetadataKeys(O, P);
  var parent = getPrototypeOf(O);
  if(parent === null)return ownKeys;
  var parentKeys = ordinaryMetadataKeys(parent, P);
  if(parentKeys.length <= 0)return ownKeys;
  if(ownKeys.length <= 0)return parentKeys;
  var set = new Set();
  var keys = [];
  for(var i = 0; i < ownKeys.length; i++){
    var key = ownKeys[i];
    var hasKey = set.has(key);
    if(!hasKey){
      set.add(key);
      keys.push(key);
    }
  }
  for(var j = 0; j < parentKeys.length; j++){
    var key = parentKeys[j];
    var hasKey = set.has(key);
    if(!hasKey){
      set.add(key);
      keys.push(key);
    }
  } return keys;
};

metadata.exp({getMetadataKeys: function getMetadataKeys(target, targetKey){
  return ordinaryMetadataKeys(anObject(target), toMetaKey(targetKey));
}});