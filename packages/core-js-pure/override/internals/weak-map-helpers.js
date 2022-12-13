var getBuiltIn = require('../internals/get-built-in');
var anObject = require('../internals/an-object');
var tryToString = require('../internals/try-to-string');

var WeakMap = getBuiltIn('WeakMap');

var aWeakMap = function (it) {
  anObject(it);
  if ('has' in it && 'get' in it && 'set' in it && 'delete') return it;
  throw TypeError(tryToString(it) + ' is not a weakmap');
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
  WeakMap: WeakMap,
  aWeakMap: aWeakMap,
  set: set,
  get: get,
  has: has,
  remove: remove
};
