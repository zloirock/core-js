var toIndexedObject = require('../internals/to-indexed-object');
var nativeGetOwnPropertySymbols = require('../internals/object-get-own-property-symbols').f;

module.exports.f = function getOwnPropertySymbols(it) {
  return nativeGetOwnPropertySymbols(toIndexedObject(it));
};
