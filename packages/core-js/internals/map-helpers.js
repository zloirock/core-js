var uncurryThis = require('../internals/function-uncurry-this');
var iterateSimple = require('../internals/iterate-simple');

// eslint-disable-next-line es/no-map -- safe
var $Map = Map;
var MapPrototype = $Map.prototype;
var forEach = uncurryThis(MapPrototype.forEach);
var set = uncurryThis(MapPrototype.set);
var get = uncurryThis(MapPrototype.get);
var has = uncurryThis(MapPrototype.has);
var entries = uncurryThis(MapPrototype.entries);
var next = entries(new $Map()).next;

var aMap = function (it) {
  has(it);
  return it;
};

var iterate = function (map, fn, interruptible) {
  return interruptible ? iterateSimple(entries(map), function (entry) {
    return fn(entry[1], entry[0]);
  }, next) : forEach(map, fn);
};

module.exports = {
  Map: $Map,
  aMap: aMap,
  set: set,
  get: get,
  has: has,
  remove: uncurryThis(MapPrototype['delete']),
  proto: MapPrototype,
  iterate: iterate
};
