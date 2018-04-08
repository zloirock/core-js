var ReflectMetadataModule = require('../internals/reflect-metadata');
var anObject = require('../internals/an-object');
var ordinaryOwnMetadataKeys = ReflectMetadataModule.keys;
var toMetaKey = ReflectMetadataModule.key;

// https://rbuckton.github.io/reflect-metadata/
ReflectMetadataModule.exp({ getOwnMetadataKeys: function getOwnMetadataKeys(target /* , targetKey */) {
  return ordinaryOwnMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
} });
