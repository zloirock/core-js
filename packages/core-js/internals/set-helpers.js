var uncurryThis = require('../internals/function-uncurry-this');
var iterateSimple = require('../internals/iterate-simple');

// eslint-disable-next-line es/no-set -- safe
var $Set = Set;
var SetPrototype = $Set.prototype;
var $has = SetPrototype.has;
var $keys = SetPrototype.keys;
var add = uncurryThis(SetPrototype.add);
var forEach = uncurryThis(SetPrototype.forEach);
var has = uncurryThis($has);
var keys = uncurryThis($keys);
var next = keys(new $Set()).next;

var aSet = function (it) {
  has(it);
  return it;
};

var iterate = function (set, fn, interruptible) {
  return interruptible ? iterateSimple(keys(set), fn, next) : forEach(set, fn);
};

module.exports = {
  Set: $Set,
  aSet: aSet,
  add: add,
  has: has,
  remove: uncurryThis(SetPrototype['delete']),
  proto: SetPrototype,
  iterate: iterate,
  $has: $has,
  $keys: $keys
};
