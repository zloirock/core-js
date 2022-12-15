var getBuiltIn = require('../internals/get-built-in');
var anObject = require('../internals/an-object');
var tryToString = require('../internals/try-to-string');
var caller = require('../internals/caller');

var Set = getBuiltIn('Set');
var SetPrototype = Set.prototype;

var aSet = function (it) {
  anObject(it);
  if ('size' in it && 'has' in it && 'add' in it && 'delete' in it && 'keys' in it) return it;
  throw TypeError(tryToString(it) + ' is not a set');
};

module.exports = {
  Set: Set,
  aSet: aSet,
  add: caller('add', 1),
  has: caller('has', 1),
  remove: caller('delete', 1),
  proto: SetPrototype,
  $has: SetPrototype.has,
  $keys: SetPrototype.keys
};
