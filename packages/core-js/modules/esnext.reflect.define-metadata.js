var ReflectMetadataModule = require('../internals/reflect-metadata');
var anObject = require('../internals/an-object');
var toMetaKey = ReflectMetadataModule.key;
var ordinaryDefineOwnMetadata = ReflectMetadataModule.set;

ReflectMetadataModule.exp({ defineMetadata: function defineMetadata(metadataKey, metadataValue, target, targetKey) {
  ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject(target), toMetaKey(targetKey));
} });
