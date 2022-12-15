var getBuiltIn = require('../internals/get-built-in');

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
  WeakMap: getBuiltIn('WeakMap'),
  set: set,
  get: get,
  has: has,
  remove: remove
};
