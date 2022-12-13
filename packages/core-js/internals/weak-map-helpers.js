var uncurryThis = require('../internals/function-uncurry-this');

// eslint-disable-next-line es/no-weak-map -- safe
var $WeakMap = WeakMap;
var WeakMapPrototype = $WeakMap.prototype;
var has = uncurryThis(WeakMapPrototype.has);

var aWeakMap = function (it) {
  has(it);
  return it;
};

module.exports = {
  WeakMap: $WeakMap,
  aWeakMap: aWeakMap,
  set: uncurryThis(WeakMapPrototype.set),
  get: uncurryThis(WeakMapPrototype.get),
  has: has,
  remove: uncurryThis(WeakMapPrototype['delete'])
};
