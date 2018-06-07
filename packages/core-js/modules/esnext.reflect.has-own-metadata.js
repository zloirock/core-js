var ReflectMetadataModule = require('../internals/reflect-metadata');
var anObject = require('../internals/an-object');
var ordinaryHasOwnMetadata = ReflectMetadataModule.has;
var toMetaKey = ReflectMetadataModule.key;

// `Reflect.hasOwnMetadata` method
// https://github.com/rbuckton/reflect-metadata
ReflectMetadataModule.exp({ hasOwnMetadata: function hasOwnMetadata(metadataKey, target /* , targetKey */) {
  return ordinaryHasOwnMetadata(metadataKey, anObject(target)
    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
} });
