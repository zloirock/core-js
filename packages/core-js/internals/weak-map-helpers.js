'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

// @dependency: es.weak-map.constructor
var WeakMapPrototype = WeakMap.prototype;

module.exports = {
  WeakMap: WeakMap,
  set: uncurryThis(WeakMapPrototype.set),
  get: uncurryThis(WeakMapPrototype.get),
  has: uncurryThis(WeakMapPrototype.has),
  remove: uncurryThis(WeakMapPrototype.delete),
};
