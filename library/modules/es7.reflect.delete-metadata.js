var metadata               = require('./_metadata')
  , anObject               = require('./_an-object')
  , toPropertyKey          = metadata.key
  , getOrCreateMetadataMap = metadata.map
  , store                  = metadata.store;

metadata.exp({deleteMetadata: function deleteMetadata(metadataKey, target, targetKey){
  anObject(target);
  if(targetKey !== undefined)targetKey = toPropertyKey(targetKey);
  var metadataMap = getOrCreateMetadataMap(target, targetKey, false);
  if(metadataMap === undefined || !metadataMap['delete'](metadataKey))return false;
  if(metadataMap.size)return true;
  var targetMetadata = store.get(target);
  targetMetadata['delete'](targetKey);
  if(targetMetadata.size)return true;
  store['delete'](target);
  return true;
}});