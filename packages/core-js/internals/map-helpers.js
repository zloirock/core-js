var uncurryThis = require('../internals/function-uncurry-this');

// eslint-disable-next-line es/no-map -- safe
var MapPrototype = Map.prototype;
var has = uncurryThis(MapPrototype.has);

var aMap = function (it) {
  has(it);
  return it;
};

module.exports = {
  // eslint-disable-next-line es/no-map -- safe
  Map: Map,
  aMap: aMap,
  set: uncurryThis(MapPrototype.set),
  get: uncurryThis(MapPrototype.get),
  has: has,
  remove: uncurryThis(MapPrototype['delete']),
  proto: MapPrototype
};
