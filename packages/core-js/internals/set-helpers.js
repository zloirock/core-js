var DESCRIPTORS = require('../internals/descriptors');
var uncurryThis = require('../internals/function-uncurry-this');
var iterateSimple = require('../internals/iterate-simple');

// eslint-disable-next-line es/no-set -- safe
var $Set = Set;
var SetPrototype = $Set.prototype;
var add = uncurryThis(SetPrototype.add);
var forEach = uncurryThis(SetPrototype.forEach);
var has = uncurryThis(SetPrototype.has);
var keys = uncurryThis(SetPrototype.keys);
var next = keys(new $Set()).next;

var aSet = function (it) {
  has(it);
  return it;
};

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var size = DESCRIPTORS ? uncurryThis(Object.getOwnPropertyDescriptor(SetPrototype, 'size').get) : function (set) {
  return set.size;
};

var clone = function (set) {
  var result = new $Set();
  forEach(set, function (it) {
    add(result, it);
  });
  return result;
};

var iterate = function (set, fn) {
  return iterateSimple(keys(set), fn, next);
};

module.exports = {
  Set: $Set,
  aSet: aSet,
  add: add,
  remove: uncurryThis(SetPrototype['delete']),
  forEach: forEach,
  has: has,
  size: size,
  clone: clone,
  iterate: iterate
};
