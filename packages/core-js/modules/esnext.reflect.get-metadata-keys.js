var Set = require('./es.set');
var metadata = require('./_metadata');
var anObject = require('core-js-internals/an-object');
var getPrototypeOf = require('./_object-gpo');
var iterate = require('./_iterate');
var ordinaryOwnMetadataKeys = metadata.keys;
var toMetaKey = metadata.key;

var from = function (iter) {
  var result = [];
  iterate(iter, false, result.push, result);
  return result;
};

var ordinaryMetadataKeys = function (O, P) {
  var oKeys = ordinaryOwnMetadataKeys(O, P);
  var parent = getPrototypeOf(O);
  if (parent === null) return oKeys;
  var pKeys = ordinaryMetadataKeys(parent, P);
  return pKeys.length ? oKeys.length ? from(new Set(oKeys.concat(pKeys))) : pKeys : oKeys;
};

metadata.exp({ getMetadataKeys: function getMetadataKeys(target /* , targetKey */) {
  return ordinaryMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
} });
