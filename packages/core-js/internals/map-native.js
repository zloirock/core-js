'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

var MapPrototype = Map.prototype;

module.exports = {
  Map: Map,
  set: uncurryThis(MapPrototype.set),
  get: uncurryThis(MapPrototype.get),
  has: uncurryThis(MapPrototype.has),
  remove: uncurryThis(MapPrototype.delete),
};
