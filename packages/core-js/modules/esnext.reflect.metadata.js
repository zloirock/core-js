var ReflectMetadataModule = require('../internals/reflect-metadata');
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var toMetaKey = ReflectMetadataModule.key;
var ordinaryDefineOwnMetadata = ReflectMetadataModule.set;

ReflectMetadataModule.exp({ metadata: function metadata(metadataKey, metadataValue) {
  return function decorator(target, targetKey) {
    ordinaryDefineOwnMetadata(
      metadataKey, metadataValue,
      (targetKey !== undefined ? anObject : aFunction)(target),
      toMetaKey(targetKey)
    );
  };
} });
