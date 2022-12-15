var getBuiltIn = require('../internals/get-built-in');
var anObject = require('../internals/an-object');
var tryToString = require('../internals/try-to-string');

var Map = getBuiltIn('Map');

var aMap = function (it) {
  anObject(it);
  if ('size' in it && 'has' in it && 'get' in it && 'set' in it && 'delete' in it && 'entries' in it) return it;
  throw TypeError(tryToString(it) + ' is not a map');
};

var set = function (map, key, value) {
  return map.set(key, value);
};

var get = function (map, key) {
  return map.get(key);
};

var has = function (map, key) {
  return map.has(key);
};

var remove = function (map, key) {
  return map['delete'](key);
};

module.exports = {
  Map: Map,
  aMap: aMap,
  set: set,
  get: get,
  has: has,
  remove: remove,
  proto: Map.prototype
};
