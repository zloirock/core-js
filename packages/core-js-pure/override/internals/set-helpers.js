var getBuiltIn = require('../internals/get-built-in');
var anObject = require('../internals/an-object');
var tryToString = require('../internals/try-to-string');
var iterateSimple = require('../internals/iterate-simple');

var Set = getBuiltIn('Set');
var SetPrototype = Set.prototype;

var aSet = function (it) {
  anObject(it);
  if ('size' in it && 'has' in it && 'add' in it && 'delete' in it && 'keys' in it) return it;
  throw TypeError(tryToString(it) + ' is not a set');
};

var add = function (set, it) {
  return set.add(it);
};

var has = function (set, it) {
  return set.has(it);
};

var remove = function (set, it) {
  return set['delete'](it);
};

var size = function (set) {
  return set.size;
};

var iterate = function (set, fn, interruptible) {
  return interruptible ? iterateSimple(set.keys(), fn) : set.forEach(fn);
};

module.exports = {
  Set: Set,
  aSet: aSet,
  add: add,
  has: has,
  remove: remove,
  size: size,
  iterate: iterate,
  $has: SetPrototype.has,
  $keys: SetPrototype.keys
};
