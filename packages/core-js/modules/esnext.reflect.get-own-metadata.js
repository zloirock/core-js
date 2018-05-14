var ReflectMetadataModule = require('../internals/reflect-metadata');
var anObject = require('../internals/an-object');
var ordinaryGetOwnMetadata = ReflectMetadataModule.get;
var toMetaKey = ReflectMetadataModule.key;

// `Reflect.getOwnMetadata` method
// https://rbuckton.github.io/reflect-metadata/
ReflectMetadataModule.exp({ getOwnMetadata: function getOwnMetadata(metadataKey, target /* , targetKey */) {
  return ordinaryGetOwnMetadata(metadataKey, anObject(target)
    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
} });
