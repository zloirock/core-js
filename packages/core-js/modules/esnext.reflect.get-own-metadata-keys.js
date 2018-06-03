var ReflectMetadataModule = require('../internals/reflect-metadata');
var anObject = require('../internals/an-object');
var ordinaryOwnMetadataKeys = ReflectMetadataModule.keys;
var toMetaKey = ReflectMetadataModule.key;

// `Reflect.getOwnMetadataKeys` method
// https://github.com/rbuckton/reflect-metadata
ReflectMetadataModule.exp({ getOwnMetadataKeys: function getOwnMetadataKeys(target /* , targetKey */) {
  return ordinaryOwnMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
} });
