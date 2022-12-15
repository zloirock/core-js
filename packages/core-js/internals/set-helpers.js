var uncurryThis = require('../internals/function-uncurry-this');

// eslint-disable-next-line es/no-set -- safe
var SetPrototype = Set.prototype;
var $has = SetPrototype.has;
var has = uncurryThis($has);

var aSet = function (it) {
  has(it);
  return it;
};

module.exports = {
  // eslint-disable-next-line es/no-set -- safe
  Set: Set,
  aSet: aSet,
  add: uncurryThis(SetPrototype.add),
  has: has,
  remove: uncurryThis(SetPrototype['delete']),
  proto: SetPrototype,
  $has: $has,
  $keys: SetPrototype.keys
};
