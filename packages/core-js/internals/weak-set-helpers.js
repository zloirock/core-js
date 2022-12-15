var uncurryThis = require('../internals/function-uncurry-this');

// eslint-disable-next-line es/no-weak-set -- safe
var $WeakSet = WeakSet;
var WeakSetPrototype = $WeakSet.prototype;
var has = uncurryThis(WeakSetPrototype.has);

var aWeakSet = function (it) {
  has(it);
  return it;
};

module.exports = {
  WeakSet: $WeakSet,
  aWeakSet: aWeakSet,
  add: uncurryThis(WeakSetPrototype.add),
  has: has,
  remove: uncurryThis(WeakSetPrototype['delete'])
};
