var uncurryThis = require('../internals/function-uncurry-this');

// eslint-disable-next-line es/no-weak-map -- safe
var $WeakMap = WeakMap;
var WeakMapPrototype = $WeakMap.prototype;

module.exports = {
  WeakMap: $WeakMap,
  set: uncurryThis(WeakMapPrototype.set),
  get: uncurryThis(WeakMapPrototype.get),
  has: uncurryThis(WeakMapPrototype.has),
  remove: uncurryThis(WeakMapPrototype['delete'])
};
