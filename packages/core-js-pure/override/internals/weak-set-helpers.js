var getBuiltIn = require('../internals/get-built-in');
var anObject = require('../internals/an-object');
var tryToString = require('../internals/try-to-string');

var WeakSet = getBuiltIn('WeakSet');

var aWeakSet = function (it) {
  anObject(it);
  if ('has' in it && 'add' in it && 'delete' in it) return it;
  throw TypeError(tryToString(it) + ' is not a weakset');
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

module.exports = {
  WeakSet: WeakSet,
  aWeakSet: aWeakSet,
  add: add,
  has: has,
  remove: remove
};
