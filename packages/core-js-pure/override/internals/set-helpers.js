var getBuiltIn = require('../internals/get-built-in');
var anObject = require('../internals/an-object');
var tryToString = require('../internals/try-to-string');
var iterateSimple = require('../internals/iterate-simple');

var Set = getBuiltIn('Set');
var $TypeError = TypeError;

var aSet = function (it) {
  anObject(it);
  if ('size' in it && 'has' in it && 'add' in it && 'delete' in it && 'keys' in it) return it;
  throw $TypeError(tryToString(it) + ' is not a set');
};

var add = function (set, it) {
  return set.add(it);
};

var remove = function (set, it) {
  return set['delete'](it);
};

var forEach = function (set, fn) {
  set.forEach(fn);
};

var has = function (set, it) {
  return set.has(it);
};

var size = function (set) {
  return set.size;
};

var clone = function (set) {
  var result = new Set();
  forEach(set, function (it) {
    add(result, it);
  });
  return result;
};

var iterate = function (set, fn) {
  var iterator = set.keys();
  return iterateSimple(iterator, fn, iterator.next);
};

module.exports = {
  Set: Set,
  aSet: aSet,
  add: add,
  remove: remove,
  forEach: forEach,
  has: has,
  size: size,
  clone: clone,
  iterate: iterate
};
