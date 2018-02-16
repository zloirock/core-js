var ReflectMetadataModule = require('../internals/reflect-metadata');
var anObject = require('../internals/an-object');
var toMetaKey = ReflectMetadataModule.key;
var getOrCreateMetadataMap = ReflectMetadataModule.map;
var store = ReflectMetadataModule.store;

ReflectMetadataModule.exp({ deleteMetadata: function deleteMetadata(metadataKey, target /* , targetKey */) {
  var targetKey = arguments.length < 3 ? undefined : toMetaKey(arguments[2]);
  var metadataMap = getOrCreateMetadataMap(anObject(target), targetKey, false);
  if (metadataMap === undefined || !metadataMap['delete'](metadataKey)) return false;
  if (metadataMap.size) return true;
  var targetMetadata = store.get(target);
  targetMetadata['delete'](targetKey);
  return !!targetMetadata.size || store['delete'](target);
} });
