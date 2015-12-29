var metadata                = require('./_metadata')
  , anObject                = require('./_an-object')
  , ordinaryOwnMetadataKeys = metadata.keys
  , toMetaKey               = metadata.key;

metadata.exp({getOwnMetadataKeys: function getOwnMetadataKeys(target, targetKey){
  return ordinaryOwnMetadataKeys(anObject(target), toMetaKey(targetKey));
}});