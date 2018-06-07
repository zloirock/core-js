var Set = require('../modules/es.set');
var ReflectMetadataModule = require('../internals/reflect-metadata');
var anObject = require('../internals/an-object');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var iterate = require('../internals/iterate');
var ordinaryOwnMetadataKeys = ReflectMetadataModule.keys;
var toMetaKey = ReflectMetadataModule.key;

var from = function (iter) {
  var result = [];
  iterate(iter, result.push, result);
  return result;
};

var ordinaryMetadataKeys = function (O, P) {
  var oKeys = ordinaryOwnMetadataKeys(O, P);
  var parent = getPrototypeOf(O);
  if (parent === null) return oKeys;
  var pKeys = ordinaryMetadataKeys(parent, P);
  return pKeys.length ? oKeys.length ? from(new Set(oKeys.concat(pKeys))) : pKeys : oKeys;
};

// `Reflect.getMetadataKeys` method
// https://github.com/rbuckton/reflect-metadata
ReflectMetadataModule.exp({ getMetadataKeys: function getMetadataKeys(target /* , targetKey */) {
  return ordinaryMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
} });
