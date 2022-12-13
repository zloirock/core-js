var DESCRIPTORS = require('../internals/descriptors');
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

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var size = DESCRIPTORS ? uncurryThis(Object.getOwnPropertyDescriptor(MapPrototype, 'size').get) : function (map) {
  return map.size;
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
  size: size,
  iterate: iterate
};
